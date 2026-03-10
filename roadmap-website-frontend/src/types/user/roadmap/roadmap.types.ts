type RoadmapCategory =
  | "frontend"
  | "backend"
  | "devops"
  | "mobile"
  | "data-science"
  | "design"
  | "product-management"
  | "cyber-security"
  | "cloud"
  | "blockchain"
  | "other";

type RoadmapDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

interface ContributorLite {
  _id: string;
  username: string;
  avatar?: string;
}

export interface IRoadmap {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  longDescription?: string;
  category: RoadmapCategory;
  difficulty?: RoadmapDifficulty;
  estimatedDuration?: {
    value: number;
    unit: "hours" | "days" | "weeks" | "months";
  };
  coverImage?: {
    public_id: string;
    url: string;
  };
  isFeatured?: boolean;
  isCommunityContributed?: boolean;
  contributor?: ContributorLite | null; // populated select("username avatar")
  tags?: string[];
  prerequisites?: string[]; // roadmap ids
  stats?: {
    views: number;
    completions: number;
    averageRating: number;
    ratingsCount: number;
  };
  version?: number;
  isPublished?: boolean;
  publishedAt?: string;   // Dates will be strings once serialized to JSON
  lastUpdated?: string;
  updatedBy?: string | null;

  // added by `{ timestamps: true }`
  createdAt: string;
  updatedAt: string;
}