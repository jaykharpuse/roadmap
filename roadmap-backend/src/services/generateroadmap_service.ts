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
  nodes: RoadmapNodeInput[];
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

function emitProgress(socketId: string, step: string, progress: number, error?: string) {
  const now = Date.now();
  if (socketId && io && (now - lastEmitTime > EMIT_DEBOUNCE || step === 'error' || step === 'complete')) {
    lastEmitTime = now;
    io.to(socketId).emit("roadmap-progress", { step, progress, error });
    console.log(`[Progress] ${step}: ${progress}% ${error || ''}`);
  }
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

    // STEP 2: Search for similar roadmaps - SKIP for speed
    // Similar search takes time, skip to direct generation
    
    // STEP 3: Generate new roadmap with AI (FAST MODE)
    emitProgress(userSocketId, "generating", 25, "Creating roadmap...");

    // Improved prompt for BETTER quality with resources
    const analysisPrompt = `Create a comprehensive learning roadmap for: "${userPrompt}"

Return JSON:
{
  "title": "Clear descriptive title for ${userPrompt}",
  "description": "2-3 sentence overview of what learner will achieve",
  "category": "one of: ${validCategories.slice(0, 8).join(', ')}",
  "difficulty": "beginner or intermediate or advanced",
  "estimatedDuration": {"value": 8, "unit": "weeks"},
  "nodes": [
    {
      "title": "Topic Name",
      "description": "What learner will learn in this topic",
      "nodeType": "topic",
      "estimatedDuration": {"value": 1, "unit": "weeks"},
      "importance": "critical or high or medium",
      "difficulty": "beginner",
      "resources": [
        {"title": "Official Documentation", "url": "https://docs.example.com", "resourceType": "documentation", "description": "Start here"},
        {"title": "Video Tutorial", "url": "https://youtube.com/watch?v=example", "resourceType": "video", "description": "Visual learning"},
        {"title": "Practice Course", "url": "https://example.com/course", "resourceType": "course", "description": "Hands-on practice"}
      ],
      "children": [
        {
          "title": "Subtopic",
          "description": "Specific skill within the topic",
          "nodeType": "skill",
          "estimatedDuration": {"value": 2, "unit": "days"},
          "resources": [{"title": "Guide", "url": "https://example.com", "resourceType": "article", "description": "Learn this skill"}],
          "children": []
        }
      ]
    }
  ]
}

Requirements:
- Create 5-7 main nodes covering the complete learning path
- Each main node should have 2-3 children (subtopics)
- Include 3-4 resources per main node (mix of documentation, videos, courses, articles)
- Use REAL working URLs from popular sites (MDN, YouTube, freeCodeCamp, official docs, etc.)
- Progress from fundamentals to advanced topics
- Mark foundational topics as "critical" importance
- Include at least one "project" type node for hands-on practice
- Resource types: documentation, video, course, article, tool, book
- JSON only, no markdown or explanations`;

    let aiResponse: AIRoadmapResponse;

    try {
      emitProgress(userSocketId, "generating", 40, "Creating with AI...");

      // Use gpt-3.5-turbo for FAST generation (much faster than gpt-4)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125", // Latest fast model with better quality
        messages: [
          { 
            role: "system", 
            content: "You are an expert educator creating comprehensive learning roadmaps. Include real, working resource URLs from popular learning platforms. Output valid JSON only." 
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3500, // Increased for more resources
        response_format: { type: "json_object" },
      } as any);

      emitProgress(userSocketId, "structuring", 60, "Processing response...");

      const content = completion.choices[0]?.message?.content?.trim() ?? "";
      
      if (!content) {
        throw new Error("AI returned empty response");
      }

      // Parse and validate response
      try {
        aiResponse = JSON.parse(content) as AIRoadmapResponse;
      } catch (parseError) {
        console.error("JSON parse error, content:", content.substring(0, 200));
        throw new Error("AI returned invalid JSON format");
      }

      // Validate required fields
      if (!aiResponse.title || !aiResponse.nodes) {
        throw new Error("Invalid roadmap structure");
      }

      if (!Array.isArray(aiResponse.nodes) || aiResponse.nodes.length === 0) {
        throw new Error("Roadmap must contain at least one node");
      }

      // Normalize and validate
      aiResponse.category = validateCategory(aiResponse.category || "other");
      aiResponse.difficulty = aiResponse.difficulty || "beginner";
      
      if (!validDifficulties.includes(aiResponse.difficulty)) {
        aiResponse.difficulty = "beginner";
      }

      aiResponse.nodes = validateNodes(aiResponse.nodes);

      emitProgress(userSocketId, "saving", 75, "Saving roadmap...");

    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate";
      console.error("AI Error:", error);
      
      // Try with gpt-4-turbo as fallback
      if (error.status === 404 || errorMessage.includes("model")) {
        console.log("Trying gpt-4-turbo...");
        emitProgress(userSocketId, "generating", 45, "Trying alternative...");
        
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
              { role: "system", content: "Create learning roadmaps. Output JSON only." },
              { role: "user", content: analysisPrompt }
            ],
            temperature: 0.5,
            max_tokens: 2000,
            response_format: { type: "json_object" },
          } as any);
          
          const content = completion.choices[0]?.message?.content?.trim() ?? "";
          aiResponse = JSON.parse(content) as AIRoadmapResponse;
          aiResponse.category = validateCategory(aiResponse.category || "other");
          aiResponse.nodes = validateNodes(aiResponse.nodes);
        } catch (retryError: any) {
          emitProgress(userSocketId, "error", 0, `AI Error: ${retryError.message}`);
          throw new Error(retryError.message || "Failed to generate roadmap");
        }
      } else {
        emitProgress(userSocketId, "error", 0, `AI Analysis Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    }

    emitProgress(userSocketId, "saving", 70, "Saving roadmap to database...");

    // Create the roadmap document
    let roadmapDoc;
    const roadmapTitle = aiResponse.title;
    
    try {
      roadmapDoc = await Roadmap.create({
        title: roadmapTitle,
        description: aiResponse.description || "A learning roadmap generated by AI",
        category: aiResponse.category,
        difficulty: aiResponse.difficulty,
        isPublished: true, // Auto-publish generated roadmaps
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
          isPublished: true,
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
          resourceType: resource.resourceType && validResourceTypes.includes(resource.resourceType.toLowerCase())
            ? resource.resourceType.toLowerCase()
            : "other"
        }));
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