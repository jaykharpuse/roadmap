import type { RoadmapDetailsResponse } from "./roadmap-details";
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
    roadmap:RoadmapDetailsResponse | null;
    paginationMeta : IPaginationMeta | null;
    error: string | null;
    lastGenerationError: string | null;
    generationAttempts: number;
    maxGenerationAttempts: number;
}