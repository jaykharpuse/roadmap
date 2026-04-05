import type { RoadmapDetailsResponse, RoadmapDetails } from "./roadmap-details";
import type { IRoadmap } from "./roadmap.types";
export interface IPaginationMeta {
  page: number;
  totalPages: number;
  totalItems: number;
}
export interface roadmapState{
    isLoading : boolean;
    roadmaps:IRoadmap[];
    trendingRoadmaps:IRoadmap[];
    roadmap:RoadmapDetailsResponse | RoadmapDetails | null;
    paginationMeta : IPaginationMeta | null;
    error: string | null;
    lastGenerationError: string | null;
    generationAttempts: number;
    maxGenerationAttempts: number;
}
