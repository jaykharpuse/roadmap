import { openai } from "../lib/openAiClient";
import Roadmap from "../models/roadmap.model";
import RoadmapNode, { IRoadmapNode } from "../models/roadmap_node.model";
import Resource from "../models/resource.model";
import mongoose from "mongoose";
import { Socket } from "socket.io";
import { io, userSocketMap } from "..";
import { findSimilarRoadmaps, findExactRoadmap } from "./roadmapSearch.service";

// Define all valid enums based on your models
const validResourceTypes = [
  "article",
  "video",
  "course",
  "book",
  "documentation",
  "podcast",
  "cheatsheet",
  "tool",
  "other"
];

const validCategories = [
  "frontend",
  "backend",
  "web-development",
  "devops",
  "mobile",
  "mobile-development",
  "data-science",
  "design",
  "product-management",
  "cybersecurity",
  "cloud",
  "blockchain",
  "ai",
  "machine-learning",
  "programming",
  "other"
];

const validDifficulties = ["beginner", "intermediate", "advanced", "expert"];
const validNodeTypes = ["topic", "skill", "milestone", "project", "checkpoint"];

// Category to cover image mapping for auto-generated roadmaps
const categoryImages: Record<string, string> = {
  "frontend": "https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800&h=400&fit=crop",
  "backend": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
  "web-development": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
  "devops": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop",
  "mobile": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
  "mobile-development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
  "data-science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
  "design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
  "product-management": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
  "cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
  "cloud": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=400&fit=crop",
  "blockchain": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
  "ai": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
  "machine-learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
  "programming": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop",
  "other": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
};

// Get cover image for category
function getCoverImage(category: string): { public_id: string; url: string } {
  const url = categoryImages[category] || categoryImages["other"];
  return {
    public_id: `roadmap-${category}-cover`,
    url
  };
}

// In-memory cache for recent roadmaps (production should use Redis)
const roadmapCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheKey(prompt: string): string {
  return prompt.toLowerCase().trim().replace(/\s+/g, '-').substring(0, 100);
}

function getCachedRoadmap(prompt: string): any | null {
  const key = getCacheKey(prompt);
  const cached = roadmapCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  roadmapCache.delete(key);
  return null;
}

function setCachedRoadmap(prompt: string, data: any): void {
  const key = getCacheKey(prompt);
  roadmapCache.set(key, { data, timestamp: Date.now() });
  
  // Cleanup old entries (keep max 100)
  if (roadmapCache.size > 100) {
    const oldestKey = roadmapCache.keys().next().value;
    if (oldestKey) roadmapCache.delete(oldestKey);
  }
}

// Extract tags from title and description
function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const commonTags = [
    'react', 'node', 'javascript', 'typescript', 'python', 'java', 'go', 'rust',
    'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'aws', 'docker', 'kubernetes',
    'machine learning', 'ai', 'data science', 'web development', 'mobile', 'ios', 'android',
    'database', 'sql', 'mongodb', 'api', 'rest', 'graphql', 'security', 'testing'
  ];
  
  return commonTags.filter(tag => text.includes(tag)).slice(0, 10);
}

// Helper function to normalize and validate categories
function validateCategory(inputCategory: string): string {
  const lowerCategory = inputCategory.toLowerCase().trim();
  
  // Handle common variations
  if (lowerCategory.includes("web") && lowerCategory.includes("dev")) {
    return "web-development";
  }
  if (lowerCategory.includes("front") || lowerCategory.includes("ui")) {
    return "frontend";
  }
  if (lowerCategory.includes("back")) {
    return "backend";
  }
  if (lowerCategory.includes("mobile") || lowerCategory.includes("app")) {
    return "mobile-development";
  }
  if (lowerCategory.includes("data") || lowerCategory.includes("science")) {
    return "data-science";
  }
  if (lowerCategory.includes("security") || lowerCategory.includes("cyber")) {
    return "cybersecurity";
  }
  if (lowerCategory.includes("machine") || lowerCategory.includes("ml")) {
    return "machine-learning";
  }
  if (lowerCategory.includes("ai") || lowerCategory.includes("artificial")) {
    return "ai";
  }
  if (lowerCategory.includes("devops") || lowerCategory.includes("ops")) {
    return "devops";
  }
  if (lowerCategory.includes("cloud")) {
    return "cloud";
  }
  if (lowerCategory.includes("program")) {
    return "programming";
  }
  
  // Check exact matches
  const matchedCategory = validCategories.find(cat => 
    cat.toLowerCase() === lowerCategory
  );
  
  return matchedCategory || "programming";
}

interface EstimatedDuration {
  value: number;
  unit: "hours" | "days" | "weeks" | "months";
}

interface RoadmapNodeInput {
  title: string;
  description?: string;
  nodeType?: "milestone" | "topic" | "skill" | "project" | "checkpoint";
  estimatedDuration?: EstimatedDuration;
  importance?: "low" | "medium" | "high" | "critical";
  difficulty?: "beginner" | "intermediate" | "advanced";
  children?: RoadmapNodeInput[];
  resources?: Array<{
    title: string;
    url: string;
    resourceType: string;
    description?: string;
  }>;
}

interface GenerateRoadmapOptions {
  userPrompt: string;
  userId?: mongoose.Types.ObjectId;
  isCommunityContributed?: boolean;
  socketId?: string; // Add socketId to options
}

interface AIRoadmapResponse {
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedDuration?: EstimatedDuration;
  nodes: RoadmapNodeInput[];
}

function fallbackResourcesForNode(title: string): Array<{
  title: string;
  url: string;
  resourceType: string;
  description?: string;
}> {
  const t = title.toLowerCase();
  if (t.includes("react")) {
    return [
      { title: "React Docs", url: "https://react.dev/learn", resourceType: "documentation", description: "Official React docs" },
      { title: "React Full Course", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", resourceType: "video", description: "Practical React course" },
    ];
  }
  if (t.includes("node") || t.includes("express")) {
    return [
      { title: "Node.js Learn", url: "https://nodejs.org/en/learn", resourceType: "documentation", description: "Official Node.js learning path" },
      { title: "Node.js Crash Course", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", resourceType: "video", description: "Backend fundamentals" },
    ];
  }
  if (t.includes("python")) {
    return [
      { title: "Python Tutorial", url: "https://docs.python.org/3/tutorial/", resourceType: "documentation", description: "Official tutorial" },
      { title: "Python for Everybody", url: "https://www.py4e.com/", resourceType: "course", description: "Beginner-friendly course" },
    ];
  }
  return [
    { title: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/", resourceType: "course", description: "Hands-on learning paths" },
    { title: "MDN Web Docs", url: "https://developer.mozilla.org/", resourceType: "documentation", description: "Trusted technical docs" },
  ];
}

function normalizeResourceUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return "";
}

// Progress tracking steps with more granular updates
const progressSteps = [
  { key: "searching", label: "Searching existing roadmaps", progress: 5 },
  { key: "analyzing", label: "Analyzing prompt", progress: 15 },
  { key: "researching", label: "Researching content", progress: 30 },
  { key: "structuring", label: "Structuring roadmap", progress: 50 },
  { key: "generating", label: "Generating details", progress: 70 },
  { key: "saving", label: "Saving roadmap", progress: 85 },
  { key: "finalizing", label: "Finalizing", progress: 95 },
  { key: "complete", label: "Complete", progress: 100 }
];

// Helper function to emit progress updates with debounce
let lastEmitTime = 0;
const EMIT_DEBOUNCE = 100; // ms

function emitProgress(socketId: string, step: string, progress: number, message?: string) {
  const now = Date.now();
  if (socketId && io && (now - lastEmitTime > EMIT_DEBOUNCE || step === 'error' || step === 'complete')) {
    lastEmitTime = now;
    io.to(socketId).emit("roadmap-progress", { step, progress, message });
    console.log(`[Progress] ${step}: ${progress}% ${message || ''}`);
  }
}

// Helper to detect category from prompt - MOVED OUTSIDE
function detectCategory(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('react') || p.includes('vue') || p.includes('angular') || p.includes('frontend') || p.includes('css') || p.includes('html') || p.includes('tailwind')) return 'frontend';
  if (p.includes('node') || p.includes('express') || p.includes('django') || p.includes('flask') || p.includes('backend') || p.includes('api') || p.includes('server')) return 'backend';
  if (p.includes('python')) return 'programming';
  if (p.includes('java') && !p.includes('javascript')) return 'programming';
  if (p.includes('c++') || p.includes('rust') || p.includes('go lang') || p.includes('golang')) return 'programming';
  if (p.includes('data science') || p.includes('pandas') || p.includes('numpy') || p.includes('analytics') || p.includes('data analyst')) return 'data-science';
  if (p.includes('machine learning') || p.includes('ml') || p.includes('tensorflow') || p.includes('pytorch') || p.includes('deep learning')) return 'machine-learning';
  if (p.includes('ai') || p.includes('artificial intelligence') || p.includes('gpt') || p.includes('llm') || p.includes('chatbot')) return 'ai';
  if (p.includes('devops') || p.includes('docker') || p.includes('kubernetes') || p.includes('ci/cd') || p.includes('jenkins')) return 'devops';
  if (p.includes('cloud') || p.includes('aws') || p.includes('azure') || p.includes('gcp') || p.includes('serverless')) return 'cloud';
  if (p.includes('mobile') || p.includes('android') || p.includes('ios') || p.includes('flutter') || p.includes('react native') || p.includes('swift') || p.includes('kotlin')) return 'mobile-development';
  if (p.includes('security') || p.includes('cyber') || p.includes('hacking') || p.includes('penetration') || p.includes('ethical')) return 'cybersecurity';
  if (p.includes('blockchain') || p.includes('web3') || p.includes('solidity') || p.includes('ethereum') || p.includes('crypto')) return 'blockchain';
  if (p.includes('design') || p.includes('ui') || p.includes('ux') || p.includes('figma') || p.includes('graphic')) return 'design';
  if (p.includes('full stack') || p.includes('fullstack') || p.includes('mern') || p.includes('mean')) return 'web-development';
  return 'web-development';
}

// Helper to detect difficulty - MOVED OUTSIDE
function detectDifficulty(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('beginner') || p.includes('basics') || p.includes('introduction') || p.includes('start') || p.includes('learn') || p.includes('new to')) return 'beginner';
  if (p.includes('advanced') || p.includes('expert') || p.includes('master') || p.includes('senior') || p.includes('pro')) return 'advanced';
  if (p.includes('intermediate') || p.includes('mid-level') || p.includes('improve')) return 'intermediate';
  return 'beginner';
}

// Build the AI prompt
function buildAIPrompt(userPrompt: string): string {
  const category = detectCategory(userPrompt);
  const difficulty = detectDifficulty(userPrompt);
  
  return `Create a comprehensive learning roadmap for: "${userPrompt}"

Return ONLY valid JSON in this exact format:
{
  "title": "Clear professional title",
  "description": "2-3 sentence overview of what learner will achieve",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "estimatedDuration": {"value": 12, "unit": "weeks"},
  "nodes": [
    {
      "title": "Topic Name",
      "description": "What will be learned and why it matters",
      "nodeType": "topic",
      "estimatedDuration": {"value": 2, "unit": "weeks"},
      "importance": "critical",
      "difficulty": "beginner",
      "resources": [
        {"title": "Resource Name", "url": "https://real-url.com", "resourceType": "documentation", "description": "Brief description"}
      ],
      "children": [
        {
          "title": "Subtopic",
          "description": "Specific skill description",
          "nodeType": "skill",
          "estimatedDuration": {"value": 3, "unit": "days"},
          "resources": [{"title": "Guide", "url": "https://real-url.com", "resourceType": "article", "description": "Description"}],
          "children": []
        }
      ]
    }
  ]
}

REQUIREMENTS:
1. Create 5-7 main nodes covering the complete learning path
2. Each node should have 2-3 children (subtopics)
3. Include 2-4 resources per node with REAL URLs from:
   - MDN Web Docs (developer.mozilla.org)
   - Official docs (react.dev, nodejs.org, python.org, etc.)
   - YouTube (Traversy Media, Fireship, freeCodeCamp, Web Dev Simplified)
   - freeCodeCamp, Codecademy, Scrimba, The Odin Project
4. Progress from basics to advanced
5. Include at least one "project" type node
6. Use importance: "critical", "high", or "medium"
7. Resource types: documentation, video, course, article, tool, book
8. Output ONLY valid JSON, no markdown or explanations`;
}

export async function generateRoadmap(options: GenerateRoadmapOptions) {
  const {
    userPrompt,
    userId,
    isCommunityContributed = false,
    socketId
  } = options;

  try {
    // Get socket ID for progress updates
    const userSocketId = userId ? userSocketMap.get(userId.toString()) ?? "" : socketId ?? "";
    emitProgress(userSocketId, "searching", 5, "Starting roadmap generation...");

    // STEP 0: Check memory cache first (fastest)
    const cachedRoadmap = getCachedRoadmap(userPrompt);
    if (cachedRoadmap) {
      emitProgress(userSocketId, "complete", 100, "Found cached roadmap!");
      return cachedRoadmap;
    }

    // STEP 1: Check for exact match in database
    emitProgress(userSocketId, "searching", 10, "Searching for existing roadmap...");
    
    try {
      const exactMatch = await findExactRoadmap(userPrompt);
      if (exactMatch) {
        setCachedRoadmap(userPrompt, exactMatch);
        emitProgress(userSocketId, "complete", 100, "Found existing roadmap!");
        return exactMatch;
      }
    } catch (searchError) {
      console.warn("Exact match search failed, continuing:", searchError);
    }

    // STEP 2: Generate new roadmap with AI
    emitProgress(userSocketId, "generating", 25, "Creating roadmap with AI...");

    // Build the prompt using the helper functions (defined at module level)
    const analysisPrompt = buildAIPrompt(userPrompt);

    let aiResponse: AIRoadmapResponse;

    try {
      emitProgress(userSocketId, "generating", 40, "Generating with AI...");

      // Try GPT-4o-mini first (fast + quality), fallback to gpt-4-turbo, then gpt-3.5-turbo
      let completion;
      const models = ["gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
      let lastError: any = null;

      for (const model of models) {
        try {
          console.log(`Trying model: ${model}`);
          completion = await openai.chat.completions.create({
            model: model,
            messages: [
              { 
                role: "system", 
                content: `You are an expert educator creating learning roadmaps. Include REAL resource URLs from MDN, YouTube (Traversy Media, freeCodeCamp), react.dev, nodejs.org, python.org, etc. Output ONLY valid JSON, no markdown.` 
              },
              { role: "user", content: analysisPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          });
          console.log(`Success with model: ${model}`);
          break; // Success, exit loop
        } catch (modelError: any) {
          console.warn(`Model ${model} failed:`, modelError.message);
          lastError = modelError;
          if (model === models[models.length - 1]) {
            throw lastError; // All models failed
          }
          emitProgress(userSocketId, "generating", 45, `Trying alternative model...`);
        }
      }

      if (!completion) {
        throw new Error("All AI models failed");
      }

      emitProgress(userSocketId, "structuring", 60, "Processing response...");

      const content = completion.choices[0]?.message?.content?.trim() ?? "";
      
      if (!content) {
        throw new Error("AI returned empty response");
      }

      // Parse and validate response
      try {
        aiResponse = JSON.parse(content) as AIRoadmapResponse;
      } catch (parseError) {
        console.error("JSON parse error, content:", content.substring(0, 500));
        throw new Error("AI returned invalid JSON format");
      }

      // Validate required fields
      if (!aiResponse.title || !aiResponse.nodes) {
        throw new Error("Invalid roadmap structure - missing title or nodes");
      }

      if (!Array.isArray(aiResponse.nodes) || aiResponse.nodes.length === 0) {
        throw new Error("Roadmap must contain at least one node");
      }

      // Normalize and validate
      aiResponse.category = validateCategory(aiResponse.category || "other");
      aiResponse.difficulty = aiResponse.difficulty || "beginner";
      aiResponse.estimatedDuration = {
        value: aiResponse.estimatedDuration?.value || 8,
        unit: aiResponse.estimatedDuration?.unit || "weeks",
      };
      
      if (!validDifficulties.includes(aiResponse.difficulty)) {
        aiResponse.difficulty = "beginner";
      }

      aiResponse.nodes = validateNodes(aiResponse.nodes);

      emitProgress(userSocketId, "saving", 75, "Saving roadmap...");

    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate roadmap";
      console.error("AI Generation Error:", errorMessage);
      emitProgress(userSocketId, "error", 0, `Generation failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    emitProgress(userSocketId, "saving", 80, "Saving roadmap to database...");

    // Create the roadmap document
    let roadmapDoc;
    const roadmapTitle = aiResponse.title;
    
    // Ensure estimatedDuration has proper defaults
    const estimatedDuration = {
      value: aiResponse.estimatedDuration?.value || 8,
      unit: aiResponse.estimatedDuration?.unit || "weeks"
    };

    // Get cover image based on category
    const coverImage = getCoverImage(aiResponse.category);
    
    try {
      roadmapDoc = await Roadmap.create({
        title: roadmapTitle,
        description: aiResponse.description || "A learning roadmap generated by AI",
        category: aiResponse.category,
        difficulty: aiResponse.difficulty,
        estimatedDuration,
        coverImage,
        isPublished: true, // Auto-publish generated roadmaps
        publishedAt: new Date(),
        isCommunityContributed,
        contributor: userId,
        stats: {
          views: 1,
          completions: 0,
          averageRating: 4.5,
          ratingsCount: 0,
        },
        version: 1,
        tags: extractTags(aiResponse.title, aiResponse.description),
        prerequisites: [],
      });
    } catch (error: any) {
      // Handle duplicate - create with unique suffix
      if (error.code === 11000) {
        const uniqueTitle = `${aiResponse.title} - ${Date.now().toString(36)}`;
        roadmapDoc = await Roadmap.create({
          title: uniqueTitle,
          description: aiResponse.description || "A learning roadmap generated by AI",
          category: aiResponse.category,
          difficulty: aiResponse.difficulty,
          estimatedDuration,
          coverImage,
          isPublished: true,
          publishedAt: new Date(),
          isCommunityContributed,
          contributor: userId,
          stats: { views: 1, completions: 0, averageRating: 4.5, ratingsCount: 0 },
          version: 1,
          tags: extractTags(uniqueTitle, aiResponse.description),
          prerequisites: [],
        });
      } else {
        emitProgress(userSocketId, "error", 0, "Failed to save roadmap");
        throw new Error("Failed to save roadmap. Please try again.");
      }
    }

    emitProgress(userSocketId, "saving", 80, "Saving learning nodes...");

    let positionCounter = 0;

    // Optimized batch save for nodes
    const saveNodes = async (
      nodes: RoadmapNodeInput[],
      roadmapId: mongoose.Types.ObjectId,
      depth: number = 0,
      parentNodeId?: mongoose.Types.ObjectId,
      dependencies: mongoose.Types.ObjectId[] = []
    ): Promise<void> => {
      for (const node of nodes) {
        // Batch create resources
        let resourceIds: mongoose.Types.ObjectId[] = [];
        if (node.resources && node.resources.length > 0) {
          const resourceDocs = node.resources.map(resource => ({
            title: resource.title,
            description: resource.description || "",
            url: resource.url,
            resourceType: validResourceTypes.includes(resource.resourceType?.toLowerCase()) 
              ? resource.resourceType.toLowerCase() 
              : "other",
            contentType: "free",
            isCommunityContributed: true,
            contributor: userId,
            isApproved: true, // Auto-approve AI resources
            difficulty: node.difficulty || "beginner",
            stats: { views: 0, clicks: 0, rating: 0, ratingsCount: 0 },
          }));
          
          try {
            const createdResources = await Resource.insertMany(resourceDocs, { ordered: false });
            resourceIds = createdResources.map(r => r._id as mongoose.Types.ObjectId);
          } catch (resourceError: any) {
            // Log but continue - some resources may have failed
            console.warn("Some resources failed to create:", resourceError.message);
          }
        }

        // Create the node
        const nodeDoc = await RoadmapNode.create({
          roadmap: roadmapId,
          title: node.title,
          description: node.description || "",
          depth,
          position: positionCounter++,
          nodeType: validNodeTypes.includes(node.nodeType || "") ? node.nodeType : "topic",
          estimatedDuration: node.estimatedDuration,
          isOptional: node.importance === "low",
          resources: resourceIds,
          prerequisites: parentNodeId ? [parentNodeId] : [],
          dependencies: [...dependencies],
          metadata: {
            keywords: node.title.toLowerCase().split(/\s+/).slice(0, 5),
            difficulty: node.difficulty || "beginner",
            importance: node.importance || "medium",
          },
          updatedBy: userId,
        });

        // Process children recursively
        if (node.children && node.children.length > 0) {
          await saveNodes(
            node.children,
            roadmapId,
            depth + 1,
            nodeDoc._id,
            node.nodeType === "milestone" ? [nodeDoc._id] : dependencies
          );
        }
      }
    };

    try {
      await saveNodes(aiResponse.nodes, roadmapDoc._id as mongoose.Types.ObjectId);

      emitProgress(userSocketId, "finalizing", 90, "Finalizing roadmap...");

      // Update the roadmap with the generated date
      roadmapDoc.lastUpdated = new Date();
      roadmapDoc.updatedBy = userId;
      await roadmapDoc.save();

      // Populate the returned document with nodes and resources
      const populatedRoadmap = await Roadmap.findById(roadmapDoc._id)
        .populate("contributor", "username avatar")
        .populate("updatedBy", "username avatar")
        .lean();

      // Fetch nodes with hierarchy
      const nodes = await RoadmapNode.find({ roadmap: roadmapDoc._id })
        .populate("resources", "title url resourceType description")
        .populate("prerequisites", "title depth position")
        .populate("dependencies", "title depth position")
        .sort({ depth: 1, position: 1 })
        .lean();

      // Build hierarchical structure
      const buildHierarchy = (flatNodes: any[], depth = 0, parentId?: string): any[] => {
        return flatNodes
          .filter(n => n.depth === depth && 
            (depth === 0 || n.prerequisites?.some((p: any) => p._id?.toString() === parentId)))
          .map(n => ({
            ...n,
            children: buildHierarchy(flatNodes, depth + 1, n._id.toString())
          }));
      };

      const hierarchicalNodes = buildHierarchy(nodes);

      // Cache the result
      const result = {
        ...populatedRoadmap,
        nodes: hierarchicalNodes,
        flatNodes: nodes
      };
      
      setCachedRoadmap(userPrompt, result);
      
      emitProgress(userSocketId, "complete", 100, "Roadmap ready!");

      return result;
    } catch (error: any) {
      // Cleanup if something went wrong
      try {
        await RoadmapNode.deleteMany({ roadmap: roadmapDoc._id });
        await Roadmap.findByIdAndDelete(roadmapDoc._id);
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
      
      const errorMsg = error.message || "Failed to save roadmap structure";
      emitProgress(userSocketId, "error", 0, `Failed to save roadmap: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    const userSocketId = userId ? userSocketMap.get(userId?.toString()) ?? "" : "";

    emitProgress(userSocketId, "error", 0, `Roadmap generation failed: ${error.message}`);
    throw error;
  }
}

// Helper function to validate and clean nodes
function validateNodes(nodes: RoadmapNodeInput[]): RoadmapNodeInput[] {
  return nodes.map(node => {
    // Validate node type
    if (!validNodeTypes.includes(node.nodeType || "")) {
      node.nodeType = "topic"; // Default to topic
    }

    // Validate difficulty
    if (node.difficulty && !["beginner", "intermediate", "advanced"].includes(node.difficulty)) {
      node.difficulty = "beginner";
    }

    // Validate and clean resources
    if (node.resources) {
      node.resources = node.resources
        .filter(resource => resource && resource.title && resource.url) // Remove invalid resources
        .map(resource => ({
          ...resource,
          url: normalizeResourceUrl(resource.url),
          resourceType: resource.resourceType && validResourceTypes.includes(resource.resourceType.toLowerCase())
            ? resource.resourceType.toLowerCase()
            : "other"
        }))
        .filter(resource => resource.url);
    }

    if (!node.resources || node.resources.length < 2) {
      const fallback = fallbackResourcesForNode(node.title);
      node.resources = [...(node.resources || []), ...fallback].slice(0, 4);
    }

    if (!node.estimatedDuration || node.estimatedDuration.value === undefined || node.estimatedDuration.value === null) {
      node.estimatedDuration = {
        value: node.nodeType === "project" ? 2 : 1,
        unit: "weeks",
      };
    }

    // Validate children recursively
    if (node.children && node.children.length > 0) {
      node.children = validateNodes(node.children);
    }

    return node;
  });
}

// Enhanced function to get roadmap with hierarchical nodes
export async function getRoadmapWithNodes(roadmapId: string) {
  const roadmap = await Roadmap.findById(roadmapId)
    .populate("contributor", "username avatar")
    .populate("updatedBy", "username avatar");

  if (!roadmap) {
    throw new Error("Roadmap not found");
  }

  // Get all nodes for this roadmap
  const nodes = await RoadmapNode.find({ roadmap: roadmapId })
    .populate("resources")
    .populate("prerequisites", "title depth position")
    .populate("dependencies", "title depth position")
    .sort({ depth: 1, position: 1 });

  // Convert to hierarchical structure
  const buildHierarchy = (
    nodes: (mongoose.Document & IRoadmapNode)[],
    depth = 0,
    parentId?: mongoose.Types.ObjectId
  ): any[] => {
   return nodes
  .filter(node => 
    node.depth === depth && 
    (depth === 0 || 
     (parentId && Array.isArray(node.prerequisites) && node.prerequisites.some(prereq => prereq.equals(parentId))))
  ) // ✅ closing .filter()
  .map(node => ({
    ...node.toObject(),
    children: buildHierarchy(nodes, depth + 1, node._id)
  }));
  };

  const hierarchicalNodes = buildHierarchy(nodes);

  return {
    roadmap,
    nodes: hierarchicalNodes,
    flatNodes: nodes,
  };
}
