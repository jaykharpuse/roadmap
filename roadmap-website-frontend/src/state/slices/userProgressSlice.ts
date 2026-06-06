// state/slices/userProgressSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import type { IUserProgressResponse } from "../../types/user/progress/UserProgress";
export interface CourseProgress {
  id: string; // unique identifier (e.g. "frontend-dev")
  title: string; // course name
  percentage: number; // progress percentage (0–100)
  current: number; // number of lessons/modules completed
  total: number; // total lessons/modules
}
interface UserProgressState {
  progress: IUserProgressResponse | null;
  loading: boolean;
  error: string | null;
  userCourseProgress: CourseProgress[];
}

const initialState: UserProgressState = {
  progress: null,
  loading: false,
  error: null,
  userCourseProgress: [],
};
export const startRoadmap = createAsyncThunk(
  "userProgress/startRoadmap",
  async (roadmapId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/progress/user/start/${roadmapId}`,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Error:", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch user progress"
      );
    }
  }
);
export const getUserRoadmapProgressForDashBoard = createAsyncThunk(
  "userProgress/getUserRoadmapProgressForDashBoard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/progress/user/courses`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error:", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch user progress"
      );
    }
  }
);

// Fetch user progress for a roadmap
export const fetchUserProgress = createAsyncThunk(
  "userProgress/fetchUserProgress",
  async (roadmapId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/progress/user/roadmap/${roadmapId}`
      );
      return response.data as IUserProgressResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user progress"
      );
    }
  }
);
export const updateUserProgress = createAsyncThunk(
  "userProgress/updateUserProgress",
  async (
    {
      roadmapId,
      nodeId,
      status,
    }: { roadmapId: string; nodeId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/progress/user/roadmap/${roadmapId}/${nodeId}`,
        { status }
      );
      return response.data as IUserProgressResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update user progress"
      );
    }
  }
);

// Upsert user progress (completed nodes)
export const upsertUserProgress = createAsyncThunk<
  IUserProgressResponse,
  { userId: string; roadmapId: string; completedNodes: string[] },
  { rejectValue: string }
>(
  "userProgress/upsertUserProgress",
  async ({ userId, roadmapId, completedNodes }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/progress/user/${userId}/roadmap/${roadmapId}`,
        {
          completedNodes,
        }
      );
      return response.data as IUserProgressResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to upsert user progress"
      );
    }
  }
);

const userProgressSlice = createSlice({
  name: "userProgress",
  initialState,
  reducers: {
    clearProgress(state) {
      state.progress = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startRoadmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startRoadmap.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = (action.payload as any)?.progress ?? (action.payload as any);
      })
      .addCase(startRoadmap.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to start roadmap";
      })
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProgress.fulfilled,
        (state, action: PayloadAction<IUserProgressResponse>) => {
          state.loading = false;
          state.progress = (action.payload as any)?.progress ?? action.payload;
        }
      )
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch user progress";
      })
      .addCase(updateUserProgress.pending, (state) => {
        state.error = null;
      })
      .addCase(updateUserProgress.fulfilled, (state, action: PayloadAction<IUserProgressResponse>) => {
        state.progress = (action.payload as any)?.progress ?? action.payload;
      })
      .addCase(updateUserProgress.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to update progress";
      })

      .addCase(
        upsertUserProgress.fulfilled,
        (state, action: PayloadAction<IUserProgressResponse>) => {
          state.progress = action.payload;
        }
      )
      .addCase(
        getUserRoadmapProgressForDashBoard.fulfilled,
        (state, action) => {
          state.userCourseProgress = action.payload?.courses ?? [];
        }
      );
  },
});

export const { clearProgress } = userProgressSlice.actions;

export default userProgressSlice.reducer;
