export interface Bookmark {
      _id: string; 
      user: string; 
      roadmap: Roadmap | string; 
      tags?: string[]; 
      notes?: string;  
      isFavorite: boolean; 
      createdAt: string; 
      updatedAt: string; 
}

export interface Roadmap {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  isFeatured: boolean;
  isCommunityContributed: boolean;
  contributor: {
    _id: string;
    username: string;
  };
  tags: string[];
  prerequisites: string[];  // list of prerequisite roadmap IDs or titles
  version: number;
  isPublished: boolean;
  lastUpdated: string;       // ISO date string
  updatedBy: string;         // user ID who updated
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  slug: string;
  estimatedDuration?: {
    value: number;
    unit: "days" | "weeks" | "months";
  };
  coverImage?: {
    public_id: string;
    url: string;
  };
  stats?: {
    views: number;
    completions: number;
    averageRating: number;
    ratingCount: number;
  };
}
