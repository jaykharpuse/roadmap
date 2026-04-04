import axiosInstance from "@/helper/axiosInstance";
import type { roadmapState } from "@/types/user/roadmap/roadmapSlice.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as {
      response?: { data?: { message?: string; error?: string; details?: string } };
    }).response;

    return (
      response?.data?.message ||
      response?.data?.error ||
      response?.data?.details ||
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const initialState: roadmapState = {
  isLoading: false,
  roadmaps: [],
  trendingRoadmaps: [],
  roadmap: null,
  paginationMeta: null,
  error: null,
  lastGenerationError: null,
  generationAttempts: 0,
  maxGenerationAttempts: 3,
};

export const getRoadmaps = createAsyncThunk(
  "roadmap/getroadmaps",
  async (page: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/roadmap/", {
        withCredentials: true,
        params: { page },
        timeout: 15000,
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getTrendingRoadmaps = createAsyncThunk(
  "roadmap/getTrending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/roadmap/trending", {
        withCredentials: true,
        timeout: 10000,
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const seedRoadmaps = createAsyncThunk(
  "roadmap/seed",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/roadmap/seed", {}, {
        withCredentials: true,
        timeout: 10000,
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getRoadMapDetails = createAsyncThunk(
  "roadmap/getRoadMapDetails",
  async (roadMapId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/roadmap/${roadMapId}`, {
        withCredentials: true,
        timeout: 15000,
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const generateRoadmap = createAsyncThunk(
  "roadmap/generateroadmap",
  async (
    payload: { prompt: string; isCommunityContributed?: boolean; retryAttempt?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        "/roadmap/generate",
        {
          userPrompt: payload.prompt,
          isCommunityContributed: payload.isCommunityContributed || false,
        },
        { 
          withCredentials: true,
          timeout: 90000, // 90 second timeout for faster generation
        }
      );

      // Check if response contains error despite 2xx status
      if (!response.data?.success && response.data?.error) {
        throw new Error(response.data.message || response.data.error);
      }

      return response.data?.data || response.data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      // Return structured error with retry info
      return rejectWithValue({
        message: errorMessage,
        retryAttempt: payload.retryAttempt || 1,
        canRetry: (payload.retryAttempt || 1) < 3,
      });
    }
  }
);

export const roadmapSlice = createSlice({
  name: "roadmap",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.lastGenerationError = null;
    },
    resetGenerationState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.lastGenerationError = null;
      state.generationAttempts = 0;
    },
  },
  extraReducers(builder) {
    builder
      // Get Roadmaps
      .addCase(getRoadmaps.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoadmaps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getRoadmaps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.roadmaps = action.payload?.roadmaps || [];
        state.paginationMeta = {
          page: action.payload?.page || 1,
          totalPages: action.payload?.totalPages || 1,
          totalItems: action.payload?.totalItems || 0,
        };
      })
      // Get Trending Roadmaps
      .addCase(getTrendingRoadmaps.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrendingRoadmaps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trendingRoadmaps = action.payload?.roadmaps || [];
      })
      .addCase(getTrendingRoadmaps.rejected, (state) => {
        state.isLoading = false;
      })
      // Seed Roadmaps
      .addCase(seedRoadmaps.fulfilled, (state) => {
        state.isLoading = false;
      })
      // Get Roadmap Details
      .addCase(getRoadMapDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoadMapDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getRoadMapDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.roadmap = action.payload?.data || action.payload || null;
      })
      // Generate Roadmap
      .addCase(generateRoadmap.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.lastGenerationError = null;
        state.generationAttempts = (action.meta.arg?.retryAttempt || 1);
      })
      .addCase(generateRoadmap.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        state.lastGenerationError = payload?.message || action.payload as string;
        state.error = payload?.message || action.payload as string;
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lastGenerationError = null;
        state.generationAttempts = 0;
        state.roadmap = action.payload?.data || action.payload || null;
      });
  },
});

export const { clearError, resetGenerationState } = roadmapSlice.actions;
export default roadmapSlice.reducer;
