import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helper/axiosInstance";

export interface ResourceBookmark {
  _id: string;
  user: string;
  resource: string;
  tags?: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResourceBookmarkState {
  bookmarks: ResourceBookmark[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourceBookmarkState = {
  bookmarks: [],
  loading: false,
  error: null,
};

export const fetchResourceBookmarks = createAsyncThunk(
  "resourceBookmarks/fetchResourceBookmarks",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/resource-bookmarks`);
      return response.data as ResourceBookmark[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "failed to fetch resource bookmarks");
    }
  }
);

export const createResourceBookmark = createAsyncThunk(
  "resourceBookmarks/createResourceBookmark",
  async (data: Partial<ResourceBookmark>, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/api/resource-bookmarks/create`, data, { withCredentials: true });
      return response.data.data as ResourceBookmark;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "failed to create resource bookmark");
    }
  }
);

export const deleteResourceBookmark = createAsyncThunk(
  "resourceBookmarks/deleteResourceBookmark",
  async (resourceId: string, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/resource-bookmarks/${resourceId}`, { withCredentials: true });
      return resourceId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to delete resource bookmark");
    }
  }
);

export const checkResourceBookmarked = createAsyncThunk(
  "resourceBookmarks/checkResourceBookmarked",
  async (resourceId: string, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/resource-bookmarks/check/${resourceId}`, { withCredentials: true });
      return response.data as { isBookmarked: boolean };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "failed to check resource bookmark");
    }
  }
);

const resourceBookmarkSlice = createSlice({
  name: "resourceBookmarks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResourceBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload;
      })
      .addCase(fetchResourceBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createResourceBookmark.fulfilled, (state, action) => {
        state.bookmarks.push(action.payload);
      })
      .addCase(deleteResourceBookmark.fulfilled, (state, action) => {
        state.bookmarks = state.bookmarks.filter((b) => b.resource !== action.payload);
      });
  },
});

export default resourceBookmarkSlice.reducer;
