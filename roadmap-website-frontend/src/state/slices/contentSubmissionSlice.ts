import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { ContentSubmission } from "@/types/user/submission/contentSubmission";

export interface ContentSubmissionState {
  submissions: ContentSubmission[];
  loading: boolean;
  error: string | null;
}

const initialState: ContentSubmissionState = {
  submissions: [],
  loading: false,
  error: null,
};

export const fetchSubmissions = createAsyncThunk(
  "submissions/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/api/content-submission");
      return res.data as ContentSubmission[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to fetch submissions"
      );
    }
  }
);

export const createSubmission = createAsyncThunk(
  "submissions/create",
  async (submissionData: Partial<ContentSubmission>, thunkAPI) => {
    try {
      const res = await axios.post("/api/content-submission", submissionData);
      return res.data as ContentSubmission;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to create submission"
      );
    }
  }
);

export const updateSubmission = createAsyncThunk(
  "submissions/update",
  async (
    { id, updates }: { id: string; updates: Partial<ContentSubmission> },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`/api/content-submission/${id}`, updates);
      return res.data as ContentSubmission;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to update submission"
      );
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  "submissions/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`/api/content-submission/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to delete submission"
      );
    }
  }
);

const contentSubmissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubmissions.fulfilled,
        (state, action: PayloadAction<ContentSubmission[]>) => {
          state.loading = false;
          state.submissions = action.payload;
        }
      )
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(createSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createSubmission.fulfilled,
        (state, action: PayloadAction<ContentSubmission>) => {
          state.loading = false;
          state.submissions.push(action.payload);
        }
      )
      .addCase(createSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(
        updateSubmission.fulfilled,
        (state, action: PayloadAction<ContentSubmission>) => {
          state.loading = false;
          const index = state.submissions.findIndex(
            (sub) => sub._id === action.payload._id
          );
          if (index !== -1) {
            state.submissions[index] = action.payload;
          }
        }
      )
      .addCase(updateSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    
      .addCase(
        deleteSubmission.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.submissions = state.submissions.filter(
            (sub) => sub._id !== action.payload
          );
        }
      )
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default contentSubmissionSlice.reducer;
