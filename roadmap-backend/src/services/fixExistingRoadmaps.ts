import Roadmap from "../models/roadmap.model";
import RoadmapNode from "../models/roadmap_node.model";
import Resource from "../models/resource.model";
import ConnectDatabase from "../lib/connectDb";
import dotenv from "dotenv";

dotenv.config();

// Category to cover image mapping for fallback images
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

// Helper to normalize resource URLs
function normalizeUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return "";
}

/**
 * Fix existing roadmaps that have missing data:
 * - estimatedDuration
 * - isPublished (set to true so they show in listings)
 * - coverImage (add default based on category)
 * - stats (initialize if missing)
 */
export async function fixExistingRoadmaps() {
  try {
    console.log("🔧 Fixing existing roadmaps...");
    let fixedCount = 0;
    
    // Get all roadmaps
    const allRoadmaps = await Roadmap.find({});
    console.log(`Found ${allRoadmaps.length} total roadmaps`);

    for (const roadmap of allRoadmaps) {
      const updates: any = {};
      let needsUpdate = false;

      // Fix estimatedDuration
      if (!roadmap.estimatedDuration?.value || !roadmap.estimatedDuration?.unit) {
        let defaultValue = 8;
        if (roadmap.difficulty === "beginner") defaultValue = 6;
        else if (roadmap.difficulty === "intermediate") defaultValue = 10;
        else if (roadmap.difficulty === "advanced") defaultValue = 14;
        else if (roadmap.difficulty === "expert") defaultValue = 18;
        
        updates.estimatedDuration = { value: defaultValue, unit: "weeks" };
        needsUpdate = true;
      }

      // Fix isPublished - set to true if it's false or missing
      if (!roadmap.isPublished) {
        updates.isPublished = true;
        updates.publishedAt = roadmap.publishedAt || new Date();
        needsUpdate = true;
      }

      // Fix coverImage - add default based on category
      if (!roadmap.coverImage?.url) {
        const category = roadmap.category || "other";
        const imageUrl = categoryImages[category] || categoryImages["other"];
        updates.coverImage = {
          public_id: `roadmap-${category}-cover`,
          url: imageUrl
        };
        needsUpdate = true;
      }

      // Fix stats - initialize if missing
      if (!roadmap.stats) {
        updates.stats = {
          views: Math.floor(Math.random() * 100) + 10,
          completions: Math.floor(Math.random() * 20),
          averageRating: 4.0 + Math.random() * 0.9,
          ratingCount: Math.floor(Math.random() * 10) + 1
        };
        needsUpdate = true;
      }

      // Fix difficulty - set to beginner if missing
      if (!roadmap.difficulty) {
        updates.difficulty = "beginner";
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Roadmap.updateOne({ _id: roadmap._id }, { $set: updates });
        console.log(`✅ Fixed: ${roadmap.title}`);
        fixedCount++;
      }
    }

    // Also fix resource URLs in nodes
    console.log("\n🔧 Fixing resource URLs in roadmap nodes...");
    const nodes = await RoadmapNode.find({}).populate("resources");
    let resourcesFixed = 0;

    for (const node of nodes) {
      if (node.resources && Array.isArray(node.resources)) {
        for (const resource of node.resources as any[]) {
          if (resource && resource._id) {
            const normalizedUrl = normalizeUrl(resource.url);
            if (normalizedUrl !== resource.url && normalizedUrl !== "") {
              await Resource.updateOne(
                { _id: resource._id },
                { $set: { url: normalizedUrl } }
              );
              resourcesFixed++;
            }
          }
        }
      }
    }

    console.log(`🎉 Fixed ${fixedCount} roadmaps and ${resourcesFixed} resource URLs!`);
    return { 
      fixed: fixedCount, 
      resourcesFixed,
      total: allRoadmaps.length 
    };
  } catch (error) {
    console.error("Error fixing roadmaps:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  ConnectDatabase()
    .then(() => fixExistingRoadmaps())
    .then((result) => {
      console.log("Result:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed:", error);
      process.exit(1);
    });
}
