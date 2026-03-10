// Types for Roadmap and related components
 export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
 export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
 export type NodeDifficulty = 'beginner' | 'intermediate' | 'advanced';
 export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';
 export type NodeType = 'skill' | 'project' | 'milestone' | 'checkpoint' | 'concept';
 export type ResourceType = 'video' | 'course' | 'article' | 'documentation' | 'other';

export interface Duration {
  value?: number;
  unit: DurationUnit;
}

export interface Image {
  public_id: string;
  url: string;
}

export interface Contributor {
  _id: string;
  username: string;
  avatar?: string;
}

export interface RoadmapStats {
  ratingCount?: number;
  views: number;
  completions: number;
  averageRating: number;
  ratingsCount: number;
}

export interface ReviewUser {
  _id: string;
  username: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  user: ReviewUser;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NodeMetadata {
  difficulty?: NodeDifficulty;
  importance?: ImportanceLevel;
  keywords?: string[];
}

export interface Resource {
  _id: string;
  title: string;
  url: string;
  type: ResourceType;
  description?: string;
}

export interface Prerequisite {
  _id: string;
  title: string;
  slug?: string;
}

export interface RoadmapNode {
  _id: string;
  roadmap: string;
  title: string;
  description?: string;
  depth: number;
  position: number;
  nodeType?: NodeType;
  isOptional?: boolean;
  estimatedDuration?: Duration;
  metadata?: NodeMetadata;
  resources?: Resource[];
  dependencies?: RoadmapNode[];
  prerequisites?: Prerequisite[];
  children?: RoadmapNode[];
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
}

export interface RoadmapDetails {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  slug: string;
  category: string;
  difficulty?: RoadmapDifficulty;
  estimatedDuration?: Duration;
  coverImage?: Image;
  isFeatured?: boolean;
  isCommunityContributed?: boolean;
  contributor?: Contributor;
  tags?: string[];
  prerequisites?: Prerequisite[];
  version?: number;
  isPublished?: boolean;
  lastUpdated?: string | Date;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  stats?: RoadmapStats;
  reviews?: Review[];
  __v?: number;
  id?: string;
  nodes?: RoadmapNode[];
}

export interface RoadmapDetailsResponse {
  roadmap: RoadmapDetails;
  nodes: RoadmapNode[];
}