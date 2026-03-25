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
  "devops",
  "mobile",
  "data-science",
  "design",
  "product-management",
  "cybersecurity",
  "cloud",
  "blockchain",
  "other"
];

const validDifficulties = ["beginner", "intermediate", "advanced", "expert"];
const validNodeTypes = ["topic", "skill", "milestone", "project", "checkpoint"];

// Helper function to normalize and validate categories
function validateCategory(inputCategory: string): string {
  const lowerCategory = inputCategory.toLowerCase();
  
  // Handle common variations
  if (lowerCategory.includes("front") || lowerCategory.includes("ui")) {
    return "frontend";
  }
  if (lowerCategory.includes("back")) {
    return "backend";
  }
  if (lowerCategory.includes("data")) {
    return "data-science";
  }
  if (lowerCategory.includes("security")) {
    return "cybersecurity";
  }
  
  // Check exact matches
  const matchedCategory = validCategories.find(cat => 
    cat.toLowerCase() === lowerCategory
  );
  
  return matchedCategory || "other";
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

// Progress tracking steps
const progressSteps = [
  { key: "analyzing", label: "Analyzing prompt", progress: 10 },
  { key: "researching", label: "Researching content", progress: 25 },
  { key: "structuring", label: "Structuring roadmap", progress: 45 },
  { key: "generating", label: "Generating details", progress: 70 },
  { key: "finalizing", label: "Finalizing roadmap", progress: 90 },
  { key: "complete", label: "Complete", progress: 100 }
];

// Helper function to emit progress updates
function emitProgress(socketId: string, step: string, progress: number, error?: string) {
  if (socketId && io) {
    io.to(socketId).emit("roadmap-progress", { step, progress, error });
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
    // Emit initial progress
    const userSocketId = userId ? userSocketMap.get(userId.toString()) ?? "" : socketId ?? "";
    emitProgress(userSocketId, "analyzing", 5);

    // STEP 1: Check for exact match first
    emitProgress(userSocketId, "searching", 10, "Searching for existing roadmap...");
    
    const exactMatch = await findExactRoadmap(userPrompt);
    if (exactMatch) {
      emitProgress(userSocketId, "complete", 100, "Found existing roadmap!");
      return exactMatch;
    }

    // STEP 2: Search for similar roadmaps
    emitProgress(userSocketId, "searching", 15, "Checking similar roadmaps...");
    
    const similarRoadmaps = await findSimilarRoadmaps(userPrompt, 0.7);
    
    // If we find a high-quality similar roadmap, return it
    if (similarRoadmaps.length > 0) {
      const bestMatch = similarRoadmaps[0];
      
      // Only return if quality is good (not flagged for regeneration)
      if (!bestMatch.roadmap.needsRegeneration && bestMatch.similarity >= 0.8) {
        emitProgress(userSocketId, "complete", 100, "Found similar roadmap!");
        
        // Increment view count
        await Roadmap.findByIdAndUpdate(bestMatch.roadmap._id, {
          $inc: { 'stats.views': 1 }
        });
        
        return bestMatch.roadmap;
      }
    }

    // STEP 3: No suitable roadmap found, generate new one
    emitProgress(userSocketId, "generating", 20, "Generating new roadmap...");

    // Enhanced prompt with strict validation instructions
    const analysisPrompt = `
You are an expert learning roadmap analyzer. Analyze the following user request and create a detailed roadmap.

STRICT RULES:
1. CATEGORIES: Must be one of these exact values (choose the closest match):
   - ${validCategories.join(", ")}

2. RESOURCE TYPES: Must be one of these exact values:
   - ${validResourceTypes.join(", ")}

3. DIFFICULTY LEVELS: Must be one of:
   - ${validDifficulties.join(", ")}

4. NODE TYPES: Must be one of:
   - ${validNodeTypes.join(", ")}

STRUCTURE REQUIREMENTS:
- Title (clear and concise)
- Description (1-2 sentences)
- Node type (from allowed values)
- Estimated duration (value and unit)
- Importance level (low, medium, high, critical)
- Difficulty (from allowed values)
- Resources (when applicable, with valid types)

User Request: "${userPrompt}"

Return your response as a JSON object with this exact structure:
{
  "title": "Roadmap Title",
  "description": "Roadmap description",
  "category": "selected-category-from-allowed-values",
  "difficulty": "selected-difficulty-from-allowed-values",
  "nodes": [
    {
      "title": "Node title",
      "description": "Node description",
      "nodeType": "allowed-node-type",
      "estimatedDuration": { "value": number, "unit": "hours/days/weeks" },
      "importance": "low/medium/high/critical",
      "difficulty": "allowed-difficulty",
      "resources": [
        {
          "title": "Resource title",
          "url": "https://example.com",
          "resourceType": "allowed-resource-type",
          "description": "Resource description"
        }
      ],
      "children": []
    }
  ]
}
`;

    let aiResponse: AIRoadmapResponse;

    try {
      // Emit researching progress
      emitProgress(userSocketId, "researching", 25);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are a helpful assistant that outputs JSON and strictly follows all validation rules." 
            },
            { role: "user", content: analysisPrompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        } as any);

        clearTimeout(timeoutId);

        // Emit structuring progress
        emitProgress(userSocketId, "structuring", 35);

        const content = completion.choices[0]?.message?.content?.trim() ?? "";
        
        if (!content) {
          throw new Error("AI returned empty response");
        }

        aiResponse = JSON.parse(content) as AIRoadmapResponse;

        // Validate and normalize the AI response
        if (!aiResponse.title || !aiResponse.category || !aiResponse.nodes) {
          throw new Error("Invalid roadmap structure: missing required fields");
        }

        // Validate nodes array
        if (!Array.isArray(aiResponse.nodes) || aiResponse.nodes.length === 0) {
          throw new Error("Roadmap must contain at least one node");
        }

        // Normalize and validate category
        aiResponse.category = validateCategory(aiResponse.category);

        // Validate difficulty
        if (!validDifficulties.includes(aiResponse.difficulty)) {
          aiResponse.difficulty = "beginner"; // Default to beginner if invalid
        }

        // Validate all nodes and resources
        aiResponse.nodes = validateNodes(aiResponse.nodes);

        // Emit generating progress
        emitProgress(userSocketId, "generating", 60);

      } catch (apiError: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout specifically
        if (apiError.name === "AbortError") {
          throw new Error("Request timeout - AI service took too long. Please try again.");
        }
        
        // Handle rate limits
        if (apiError.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        
        // Handle authentication errors
        if (apiError.status === 401) {
          throw new Error("AI service authentication failed. Please contact support.");
        }
        
        throw apiError;
      }

    } catch (error: any) {
      const errorMessage = error.message || "Failed to analyze user request";
      console.error("Error analyzing user prompt:", error);
      emitProgress(userSocketId, "error", 0, `AI Analysis Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Create the roadmap document with duplicate title handling
    let roadmapDoc;
    let roadmapTitle = aiResponse.title;
    
    try {
      roadmapDoc = await Roadmap.create({
        title: roadmapTitle,
        description: aiResponse.description || "A learning roadmap generated by AI",
        category: aiResponse.category,
        difficulty: aiResponse.difficulty,
        isPublished: false,
        isCommunityContributed,
        contributor: isCommunityContributed ? userId : undefined,
        stats: {
          views: 0,
          completions: 0,
          averageRating: 0,
          ratingsCount: 0,
        },
        version: 1,
        tags: [],
        prerequisites: [],
      });
    } catch (error: any) {
      // Handle duplicate key error by appending timestamp
      if (error.code === 11000 && error.keyPattern?.title) {
        const timestamp = new Date().toLocaleString();
        roadmapTitle = `${aiResponse.title} (${timestamp})`;
        
        try {
          roadmapDoc = await Roadmap.create({
            title: roadmapTitle,
            description: aiResponse.description || "A learning roadmap generated by AI",
            category: aiResponse.category,
            difficulty: aiResponse.difficulty,
            isPublished: false,
            isCommunityContributed,
            contributor: isCommunityContributed ? userId : undefined,
            stats: {
              views: 0,
              completions: 0,
              averageRating: 0,
              ratingsCount: 0,
            },
            version: 1,
            tags: [],
            prerequisites: [],
          });
        } catch (retryError: any) {
          emitProgress(userSocketId, "error", 0, "Failed to create roadmap after retry");
          throw new Error("Failed to save roadmap. Please try again.");
        }
      } else {
        emitProgress(userSocketId, "error", 0, "Failed to save roadmap");
        throw new Error("Failed to save roadmap. Please try again.");
      }
    }

    let positionCounter = 0;

    // Recursive function to save nodes and their children
    const saveNodes = async (
      nodes: RoadmapNodeInput[],
      roadmapId: mongoose.Types.ObjectId,
      depth: number = 0,
      parentNodeId?: mongoose.Types.ObjectId,
      dependencies: mongoose.Types.ObjectId[] = []
    ): Promise<void> => {
      for (const node of nodes) {
        // Create resources if provided
        let resourceIds: mongoose.Types.ObjectId[] = [];
        if (node.resources && node.resources.length > 0) {
          for (const resource of node.resources) {
            try {
              const newResource = await Resource.create({
                title: resource.title,
                description: resource.description,
                url: resource.url,
                resourceType: resource.resourceType,
                contentType: "free",
                isCommunityContributed: true,
                contributor: userId,
                isApproved: !isCommunityContributed,
                difficulty: node.difficulty || "beginner",
                stats: {
                  views: 0,
                  clicks: 0,
                  rating: 0,
                  ratingsCount: 0,
                },
              });
              resourceIds.push(newResource._id as mongoose.Types.ObjectId);
            } catch (resourceError) {
              console.error("Failed to create resource:", resourceError);
              emitProgress(userSocketId, "error", 0, `Failed to create resource: ${resourceError}`);
            }
          }
        }

        // Create the node
        const nodeDoc = await RoadmapNode.create({
          roadmap: roadmapId,
          title: node.title,
          description: node.description || "",
          depth,
          position: positionCounter++,
          nodeType: node.nodeType || "topic",
          estimatedDuration: node.estimatedDuration,
          isOptional: node.importance === "low",
          resources: resourceIds,
          prerequisites: parentNodeId ? [parentNodeId] : [],
          dependencies: [...dependencies],
          metadata: {
            keywords: [],
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

      // Update the roadmap with the generated date
      roadmapDoc.lastUpdated = new Date();
      roadmapDoc.updatedBy = userId;
      await roadmapDoc.save();

      // Emit finalizing progress
      emitProgress(userSocketId, "finalizing", 95);

      // Populate the returned document with nodes and resources
      const populatedRoadmap = await Roadmap.findById(roadmapDoc._id)
        .populate("contributor", "username avatar")
        .populate("updatedBy", "username avatar")
        .lean();

      // Manually fetch and populate nodes with their resources
      const nodes = await RoadmapNode.find({ roadmap: roadmapDoc._id })
        .populate("resources", "title url resourceType description")
        .populate("prerequisites", "title depth position")
        .populate("dependencies", "title depth position")
        .sort({ depth: 1, position: 1 })
        .lean();

      // Emit complete progress
      emitProgress(userSocketId, "complete", 100);

      return {
        ...populatedRoadmap,
        nodes: nodes
      };
    } catch (error: any) {
      // Cleanup if something went wrong
      try {
        await RoadmapNode.deleteMany({ roadmap: roadmapDoc._id });
        await Resource.deleteMany({ contributor: userId, isApproved: false });
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

    // Validate resources
    if (node.resources) {
      node.resources = node.resources.map(resource => ({
        ...resource,
        resourceType: validResourceTypes.includes(resource.resourceType.toLowerCase())
          ? resource.resourceType.toLowerCase()
          : "other"
      }));
    }

    // Validate children recursively
    if (node.children) {
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