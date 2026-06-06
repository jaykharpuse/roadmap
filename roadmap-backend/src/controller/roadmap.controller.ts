import { NextFunction, Request, Response } from "express";
import Roadmap from "../models/roadmap.model";
import mongoose from "mongoose";
import RoadmapNode from "../models/roadmap_node.model";
import { reqwithuser } from "../middleware/auth.middleware";
import Errorhandler from "../util/Errorhandler.util";
import Review from "../models/review.model";
import "../models/resource.model";
import { generateRoadmap } from "../services/generateroadmap_service";
import Resource from "../models/resource.model";
import { userSocketMap } from "../index";
import { fixExistingRoadmaps } from "../services/fixExistingRoadmaps";

// Fix existing roadmaps with missing data
export const fixRoadmaps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fixExistingRoadmaps();
    res.status(200).json({
      success: true,
      message: `Fixed ${result.fixed} roadmaps`,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const getRoadmapsPaginated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filters: any = { isPublished: true };

    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.difficulty) {
      filters.difficulty = req.query.difficulty;
    }
    if (req.query.search) {
      filters.title = { $regex: req.query.search, $options: "i" };
    }

    const total = await Roadmap.countDocuments(filters);
    const roadmaps = await Roadmap.find(filters)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("contributor", "username avatar");

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      roadmaps,
    });
  } catch (error) {
    next(error);
  }
};
export const generateRoadmapWithAi = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userPrompt, isCommunityContributed = false } = req.body;
    const userId = req.user?._id;

    // Validate input
    if (!userPrompt || typeof userPrompt !== "string" || userPrompt.trim() === "") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid input",
        message: "Please provide a clear description of what you want to learn"
      });
    }

    if (userPrompt.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        error: "Input too short",
        message: "Please provide a detailed description (at least 10 characters)"
      });
    }

    if (userPrompt.trim().length > 500) {
      return res.status(400).json({ 
        success: false,
        error: "Input too long",
        message: "Please keep your description under 500 characters"
      });
    }

    // Get socketId from user's socket mapping or fallback
    const socketId = req.user?._id ? userSocketMap.get(req.user._id.toString()) : undefined;

    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Roadmap generation timeout - please try again")), 120000); // 2 min timeout
    });

    const generationPromise = generateRoadmap({
      userPrompt: userPrompt.trim(),
      userId,
      isCommunityContributed,
      socketId,
    });

    const roadmap = await Promise.race([generationPromise, timeoutPromise]);
    
    res.status(201).json({
      success: true,
      message: "Roadmap generated successfully",
      data: roadmap
    });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || "Failed to generate roadmap";
    
    console.error("Error generating roadmap:", {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // User-friendly error messages
    let userMessage = "Failed to generate roadmap. Please try again.";
    
    if (message.includes("timeout") || message.includes("AbortError")) {
      userMessage = "Generation took too long. Please try again with a simpler description.";
    } else if (message.includes("authentication") || message.includes("API key")) {
      userMessage = "Service configuration error. Please contact support.";
    } else if (message.includes("rate limit") || message.includes("429")) {
      userMessage = "Too many requests. Please wait a moment and try again.";
    } else if (message.includes("invalid") || message.includes("structure")) {
      userMessage = "Failed to generate valid roadmap. Please try with different keywords.";
    }
    
    res.status(status).json({ 
      success: false,
      error: message,
      message: userMessage
    });
  }
};
export const createRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      longDescription,
      category,
      difficulty,
      estimatedDuration,
      coverImage,
      tags,
      prerequisites = [],
      isPublished,
      isFeatured,
      isCommunityContributed,
      nodes = [],
    } = req.body;

    const contributor = (req as any).user._id;

    // 1. Create Roadmap
    const roadmap = new Roadmap({
      title,
      description,
      longDescription,
      category,
      difficulty,
      estimatedDuration,
      coverImage,
      isPublished,
      isFeatured,
      isCommunityContributed,
      contributor,
      tags,
      prerequisites,
      lastUpdated: new Date(),
      updatedBy: contributor,
    });

    await roadmap.save({ session });

    // 2. Create Nodes (if any)
    const nodeDocs = nodes.map((node: any) => ({
      ...node,
      roadmap: roadmap._id,
      updatedBy: contributor,
    }));

    if (nodeDocs.length > 0) {
      await RoadmapNode.insertMany(nodeDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const fullRoadmap = await Roadmap.findById(roadmap._id)
      .populate("contributor", "username email profileUrl")
      .populate({
        path: "nodes",
        model: "RoadmapNode",
      });

    res.status(201).json({
      message: "Roadmap created successfully",
      roadmap: fullRoadmap,
    });
  } catch (err) {
    console.error("Error creating roadmap:", err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Failed to create roadmap", error: err });
  }
};

export const getRoadmapDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = req.params;

    const roadmap = await Roadmap.findOne(
      mongoose.Types.ObjectId.isValid(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: idOrSlug }
    )
      .populate("contributor", "username avatar")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "username avatar" },
      });

    if (!roadmap) {
      res.status(404).json({ message: "Roadmap not found" });
      return;
    }

    const nodes = await RoadmapNode.find({ roadmap: roadmap._id })
      .populate({
        path: "resources",
        select: "-upvotes -downvotes",
      })
      .populate("dependencies prerequisites", "title _id")
      .sort({ depth: 1, position: 1 });

    const buildTree = () => {
      const nodeMap: Record<string, any> = {};
      const roots: any[] = [];

      nodes.forEach((node) => {
        nodeMap[node._id.toString()] = { ...node.toObject(), children: [] };
      });

      nodes.forEach((node) => {
        node.dependencies?.forEach((dep: any) => {
          const parent = nodeMap[dep._id.toString()];
          if (parent) {
            parent.children.push(nodeMap[node._id.toString()]);
          }
        });
      });

      nodes.forEach((node) => {
        if (!node.dependencies?.length) {
          roots.push(nodeMap[node._id.toString()]);
        }
      });

      return roots;
    };

    return res.status(200).json({
      success: true,
      data: {
        ...roadmap.toObject(),
        nodes: buildTree(),
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateRoadmapWithNodes = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roadmapId } = req.params;
    const { roadmapUpdates, nodes } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return next(new Errorhandler(404, "Roadmap not found"));

    // Basic update
    // Object.assign(roadmap, roadmapUpdates);

    if (roadmapUpdates && typeof roadmapUpdates === "object") {
      for (const [key, value] of Object.entries(roadmapUpdates)) {
        roadmap.set(key, value);
      }
    }

    roadmap.version = (roadmap.version ?? 0) + 1;
    roadmap.lastUpdated = new Date();
    roadmap.updatedBy = (req.user as { _id: mongoose.Types.ObjectId })?._id;
    await roadmap.save();

    // Bulk update nodes
    if (Array.isArray(nodes)) {
      const bulkOps = nodes.map((node) => ({
        updateOne: {
          filter: { _id: node._id, roadmap: roadmapId },
          update: {
            $set: { ...node, updatedBy: req.user?._id, updatedAt: new Date() },
          },
        },
      }));
      await RoadmapNode.bulkWrite(bulkOps);
    }

    const updateRoadmap = await Roadmap.findById(roadmapId).populate(
      "contributor",
      "username"
    );
    const updatedNodes = await RoadmapNode.find({
      roadmap: roadmapId,
    });

    res.status(200).json({
      success: true,
      message: "Roadmap and nodes updated successfully",
      roadmap: updateRoadmap,
      nodes: updatedNodes,
    });
  } catch (error) {
    next(error);
  }
};
export const getRoadmapReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roadmapId } = req.params;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sort =
      typeof req.query.sort === "string" ? req.query.sort : "-createdAt";
    const minRating = parseInt(req.query.minRating as string) || 1;
    const isVerified = req.query.isVerified === "true" ? true : undefined;

    // Filtering conditions
    const filter: any = {
      roadmap: roadmapId,
      rating: { $gte: minRating },
    };

    if (isVerified !== undefined) filter.isVerified = isVerified;

    // Query & paginate reviews
    const reviewsPromise = Review.find(filter)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .populate("user", "username avatar");

    // Count for pagination
    const countPromise = Review.countDocuments(filter);

    // Aggregated rating breakdown
    const ratingStatsPromise = Review.aggregate([
      { $match: { roadmap: new mongoose.Types.ObjectId(roadmapId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const [reviews, total, ratingStats] = await Promise.all([
      reviewsPromise,
      countPromise,
      ratingStatsPromise,
    ]);

    const totalPages = Math.ceil(total / limit);

    const breakdown: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingStats.forEach((stat) => {
      breakdown[stat._id] = stat.count;
    });

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages,
      breakdown,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /roadmaps/:roadmapId
export const deleteRoadmap = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roadmapId } = req.params;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return next(new Errorhandler(404, "Roadmap not found"));

    // Optionally: check ownership or admin role
    if (
      !req.user ||
      (roadmap.contributor?.toString() !== req.user._id.toString() &&
        req.user.Role !== "admin")
    ) {
      return next(new Errorhandler(403, "Unauthorized to delete roadmap"));
    }

    await RoadmapNode.deleteMany({ roadmap: roadmapId });
    await roadmap.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Roadmap deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// PATCH /roadmaps/:roadmapId
export const updateRoadmap = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roadmapId } = req.params;
    const updates = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return next(new Errorhandler(404, "Roadmap not found"));

    if (
      !req.user ||
      (roadmap.contributor?.toString() !== req.user._id.toString() &&
        req.user.Role !== "admin")
    ) {
      console.error("Unauthorized to update roadmap", {
        roadmapId,
        userId: req.user?._id,
      });
      return next(new Errorhandler(403, "Unauthorized to update roadmap"));
    }

    Object.assign(roadmap, updates);
    roadmap.version = (roadmap.version ?? 0) + 1;
    roadmap.lastUpdated = new Date();
    roadmap.updatedBy = req.user._id;

    await roadmap.save();

    res
      .status(200)
      .json({ success: true, message: "Roadmap updated", roadmap });
  } catch (err) {
    next(err);
  }
};

// PATCH /roadmaps/:id/publish

export const togglePublishRoadmap = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return next(new Errorhandler(404, "Roadmap not found"));

    if (!req.user || req.user.Role !== "admin") {
      return next(
        new Errorhandler(403, "only main can publish/unpublish roadmaps")
      );
    }

    roadmap.isPublished = isPublished;
    roadmap.publishedAt = isPublished ? new Date() : undefined;
    await roadmap.save();

    res.status(200).json({
      success: true,
      message: `Roadmap ${
        isPublished ? "published" : "unpublished"
      } successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// Upvote roadmap
export const upvoteRoadmap = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new Errorhandler(401, "User not authenticated"));
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return next(new Errorhandler(404, "Roadmap not found"));
    }

    // Remove from downvotes if exists
    if (roadmap.downvotes) {
      roadmap.downvotes = roadmap.downvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Toggle upvote
    if (!roadmap.upvotes) {
      roadmap.upvotes = [];
    }

    const upvoteIndex = roadmap.upvotes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    if (upvoteIndex > -1) {
      roadmap.upvotes.splice(upvoteIndex, 1);
    } else {
      roadmap.upvotes.push(userId);
    }

    await roadmap.save();

    res.status(200).json({
      success: true,
      upvotes: roadmap.upvotes.length,
      downvotes: roadmap.downvotes?.length || 0,
      qualityScore: roadmap.qualityScore,
    });
  } catch (err) {
    next(err);
  }
};

// Downvote roadmap
export const downvoteRoadmap = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next(new Errorhandler(401, "User not authenticated"));
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return next(new Errorhandler(404, "Roadmap not found"));
    }

    // Remove from upvotes if exists
    if (roadmap.upvotes) {
      roadmap.upvotes = roadmap.upvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Toggle downvote
    if (!roadmap.downvotes) {
      roadmap.downvotes = [];
    }

    const downvoteIndex = roadmap.downvotes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    if (downvoteIndex > -1) {
      roadmap.downvotes.splice(downvoteIndex, 1);
    } else {
      roadmap.downvotes.push(userId);
    }

    await roadmap.save();

    res.status(200).json({
      success: true,
      upvotes: roadmap.upvotes?.length || 0,
      downvotes: roadmap.downvotes.length,
      qualityScore: roadmap.qualityScore,
      needsRegeneration: roadmap.needsRegeneration,
    });
  } catch (err) {
    next(err);
  }
};

// Regenerate poor quality roadmap
export const regenerateRoadmap = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const oldRoadmap = await Roadmap.findById(id);
    if (!oldRoadmap) {
      return next(new Errorhandler(404, "Roadmap not found"));
    }

    // Check if regeneration is needed or user is admin
    if (!oldRoadmap.needsRegeneration && req.user?.Role !== "admin") {
      return next(
        new Errorhandler(
          403,
          "Roadmap does not need regeneration or you lack permissions"
        )
      );
    }

    // Store old stats
    const previousDownvotes = oldRoadmap.downvotes?.length || 0;

    // Delete old nodes and resources
    await RoadmapNode.deleteMany({ roadmap: id });
    await Resource.deleteMany({ contributor: oldRoadmap.contributor });

    // Generate new roadmap content
    const userPrompt = `${oldRoadmap.title} - ${oldRoadmap.description}`;
    const socketId = userId ? userSocketMap.get(userId.toString()) : undefined;
    const newRoadmap = await generateRoadmap({
      userPrompt,
      userId,
      isCommunityContributed: oldRoadmap.isCommunityContributed || false,
      socketId,
    });

    // Update the roadmap with regeneration history
    oldRoadmap.version = (oldRoadmap.version || 1) + 1;
    oldRoadmap.needsRegeneration = false;
    oldRoadmap.upvotes = [];
    oldRoadmap.downvotes = [];
    oldRoadmap.qualityScore = 0;
    oldRoadmap.lastUpdated = new Date();
    oldRoadmap.updatedBy = userId;

    if (!oldRoadmap.regenerationHistory) {
      oldRoadmap.regenerationHistory = [];
    }

    oldRoadmap.regenerationHistory.push({
      regeneratedAt: new Date(),
      reason: "Quality threshold reached (100+ downvotes)",
      previousDownvotes,
    });

    await oldRoadmap.save();

    res.status(200).json({
      success: true,
      message: "Roadmap regenerated successfully",
      roadmap: oldRoadmap,
    });
  } catch (err) {
    next(err);
  }
};

// Get trending roadmaps (most viewed/upvoted)
export const getTrendingRoadmaps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get roadmaps sorted by views and upvotes
    const roadmaps = await Roadmap.find({ isPublished: true })
      .sort({ 'stats.views': -1, createdAt: -1 })
      .limit(limit)
      .populate("contributor", "username avatar")
      .select("title description category difficulty tags stats coverImage slug createdAt");
    
    res.status(200).json({
      success: true,
      roadmaps,
    });
  } catch (err) {
    next(err);
  }
};

// Category to cover image mapping
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

// Seed sample roadmaps for new users
export const seedSampleRoadmaps = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if sample roadmaps already exist
    const existingCount = await Roadmap.countDocuments({ isPublished: true });
    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: `Already have ${existingCount} roadmaps`,
        count: existingCount,
      });
    }
    
    // Sample roadmaps to seed
    const sampleRoadmaps = [
      {
        title: "Complete Web Development Roadmap 2024",
        description: "Learn full-stack web development from scratch. Master HTML, CSS, JavaScript, React, Node.js and databases.",
        category: "web-development",
        difficulty: "beginner",
        tags: ["web", "javascript", "react", "nodejs", "fullstack"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 12, unit: "weeks" },
        coverImage: { public_id: "roadmap-web-development-cover", url: categoryImages["web-development"] },
        stats: { views: 150, completions: 25, averageRating: 4.7, ratingCount: 18 },
      },
      {
        title: "Python for Data Science",
        description: "Master Python for data analysis, machine learning and AI. Learn NumPy, Pandas, Scikit-learn and TensorFlow.",
        category: "data-science",
        difficulty: "intermediate",
        tags: ["python", "data-science", "machine-learning", "ai"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 10, unit: "weeks" },
        coverImage: { public_id: "roadmap-data-science-cover", url: categoryImages["data-science"] },
        stats: { views: 120, completions: 18, averageRating: 4.5, ratingCount: 12 },
      },
      {
        title: "React.js Complete Guide",
        description: "Build modern web applications with React. Learn hooks, state management, routing and best practices.",
        category: "frontend",
        difficulty: "intermediate",
        tags: ["react", "javascript", "frontend", "web"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 8, unit: "weeks" },
        coverImage: { public_id: "roadmap-frontend-cover", url: categoryImages["frontend"] },
        stats: { views: 100, completions: 15, averageRating: 4.6, ratingCount: 10 },
      },
      {
        title: "DevOps and Cloud Computing",
        description: "Learn Docker, Kubernetes, CI/CD, AWS, and modern DevOps practices for scalable deployments.",
        category: "devops",
        difficulty: "intermediate",
        tags: ["devops", "docker", "kubernetes", "aws", "cloud"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 14, unit: "weeks" },
        coverImage: { public_id: "roadmap-devops-cover", url: categoryImages["devops"] },
        stats: { views: 90, completions: 12, averageRating: 4.4, ratingCount: 8 },
      },
      {
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile apps for iOS and Android using React Native and Expo.",
        category: "mobile-development",
        difficulty: "intermediate",
        tags: ["react-native", "mobile", "ios", "android"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 10, unit: "weeks" },
        coverImage: { public_id: "roadmap-mobile-development-cover", url: categoryImages["mobile-development"] },
        stats: { views: 80, completions: 10, averageRating: 4.3, ratingCount: 6 },
      },
      {
        title: "Backend Development with Node.js",
        description: "Master server-side development with Node.js, Express, databases (MongoDB, PostgreSQL), and API design.",
        category: "backend",
        difficulty: "intermediate",
        tags: ["nodejs", "express", "mongodb", "api", "backend"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 10, unit: "weeks" },
        coverImage: { public_id: "roadmap-backend-cover", url: categoryImages["backend"] },
        stats: { views: 95, completions: 14, averageRating: 4.5, ratingCount: 9 },
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Learn machine learning algorithms, neural networks, and deep learning with practical projects.",
        category: "machine-learning",
        difficulty: "advanced",
        tags: ["machine-learning", "ai", "python", "tensorflow", "neural-networks"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 16, unit: "weeks" },
        coverImage: { public_id: "roadmap-machine-learning-cover", url: categoryImages["machine-learning"] },
        stats: { views: 110, completions: 8, averageRating: 4.8, ratingCount: 15 },
      },
      {
        title: "Cybersecurity Essentials",
        description: "Learn network security, ethical hacking, penetration testing, and security best practices.",
        category: "cybersecurity",
        difficulty: "intermediate",
        tags: ["security", "hacking", "network", "penetration-testing"],
        isPublished: true,
        publishedAt: new Date(),
        isCommunityContributed: true,
        estimatedDuration: { value: 12, unit: "weeks" },
        coverImage: { public_id: "roadmap-cybersecurity-cover", url: categoryImages["cybersecurity"] },
        stats: { views: 75, completions: 6, averageRating: 4.4, ratingCount: 5 },
      },
    ];
    
    const created = await Roadmap.insertMany(sampleRoadmaps);
    
    res.status(201).json({
      success: true,
      message: `Created ${created.length} sample roadmaps`,
      count: created.length,
    });
  } catch (err) {
    next(err);
  }
};
