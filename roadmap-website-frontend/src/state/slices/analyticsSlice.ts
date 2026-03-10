import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helper/axiosInstance";
import type {
  AnalyticsData,
  AnalyticsState,
} from "@/types/user/analytics/analyticsSlice.types";

const initialState: AnalyticsState = {
  isLoading: false,
  analyticsList: [],
  selectedAnalytics: null,
  error: null,
};

export const fetchAllAnalytics = createAsyncThunk(
  "analytics/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/analytics", {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAnalyticsByDate = createAsyncThunk(
  "analytics/fetchByDate",
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/analytics/${date}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const upsertAnalytics = createAsyncThunk(
  "analytics/upsert",
  async (analyticsData: AnalyticsData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/analytics",
        analyticsData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAnalytics = createAsyncThunk(
  "analytics/delete",
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/analytics/${date}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchAllAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyticsList = action.payload;
      })

      .addCase(fetchAllAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAnalyticsByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchAnalyticsByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAnalytics = action.payload;
      })

      .addCase(fetchAnalyticsByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(upsertAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(upsertAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAnalytics = action.payload;
      })

      .addCase(upsertAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(deleteAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyticsList = state.analyticsList.filter(
          (item) => item.date !== action.meta.arg
        );
      })

      .addCase(deleteAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
