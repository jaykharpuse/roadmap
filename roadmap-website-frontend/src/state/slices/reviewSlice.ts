import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Review } from '../../types/user/review/review';
import axiosInstance from '@/helper/axiosInstance';

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
};



export const fetchReviewsByRoadmap = createAsyncThunk(
  'reviews/fetchByRoadmap',
  async (roadmapId: string, thunkAPI) => {
    try {
      const res = await axios.get(`/api/reviews/roadmap/${roadmapId}`);
      return res.data as Review[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData: Partial<Review>, thunkAPI) => {
    try {
      const res = await axios.post('/api/reviews', reviewData);
      return res.data as Review;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, data }: { id: string; data: Partial<Review> }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/api/reviews/${id}`, data);
      return res.data as Review;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`/api/reviews/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || 'Failed to delete review');
    }
  }
);


const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByRoadmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByRoadmap.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByRoadmap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.reviews.push(action.payload);
      })

      .addCase(updateReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) state.reviews[index] = action.payload;
      })

      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      });
  },
});

export default reviewSlice.reducer;
