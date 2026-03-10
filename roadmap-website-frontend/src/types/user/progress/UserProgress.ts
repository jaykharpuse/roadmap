export type ProgressStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface IResourceProgressResponse {
  resource: string; // ObjectId as string
  status: ProgressStatus;
  completedAt?: string; // ISO Date
}

export interface INodeResponse {
  _id: string;
  title: string;
  description: string;
  nodeType: string;
  id: string;
}

export interface INodeProgressResponse {
  node: INodeResponse;
  status: ProgressStatus;
  startedAt?: string; // ISO Date
  completedAt?: string; // ISO Date
  notes?: string;
  resources: IResourceProgressResponse[];
}

export interface IRoadmapResponse {
  _id: string;
  title: string;
  category: string;
  slug: string;
  id: string;
  contributor?: {
    _id: string;
    username: string;
  };
}

export interface IUserProgressStatsResponse {
  totalNodes: number;
  completedNodes: number;
  completionPercentage: number;
  totalResources: number;
  completedResources: number;
}

export interface IUserProgressResponse {
  _id: string;
  user: string; // ObjectId as string
  roadmap: IRoadmapResponse;
  nodes: INodeProgressResponse[];
  currentNodes: INodeResponse[];
  isCompleted: boolean;
  completedAt?: string; // ISO Date
  startedAt: string; // ISO Date
  lastUpdated?: string; // ISO Date
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
  stats: IUserProgressStatsResponse;
  __v: number;
  id: string;
}
