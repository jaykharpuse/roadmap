import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'; 
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/helper/axiosInstance';
import type {Resource} from '@/types/user/Resource/Resource'; 

export interface ResourceReview {
  _id: string;
  resource: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  title?: string;
  review: string;
  pros?: string[];
  cons?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResourceState {
      resources: Resource[];
      resource: Resource | null;
      resourceReviews: ResourceReview[];
      userResourceReviews: ResourceReview[];
      loading : boolean; 
      error: string | null; 
}


const initialState: ResourceState = {
      resources: [], 
      resource: null,
      resourceReviews: [],
      userResourceReviews: [],
      loading: false, 
      error: null, 
};


export const fetchResources = createAsyncThunk(
        'resources/fetchResources', 
         async(_ , thunkAPI) => {
           try{
              const res = await axiosInstance.get('/api/resources'); 
              return res.data as Resource[]; 
           }  catch(err: any){
              return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch resources'); 
           }
         }
);
// Get single resource
export const fetchResourceById = createAsyncThunk(
   'resources/fetchResourceById',
   async (id: string, thunkAPI) => {
      try {
         const res = await axiosInstance.get(`/api/resources/${id}`);
         return res.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch resource');
      }
   }
);

// Create resource
export const createResource = createAsyncThunk(
   'resources/createResource',
   async (resource: Partial<Resource>, thunkAPI) => {
      try {
         const res = await axiosInstance.post('/api/resources', resource, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to create resource');
      }
   }
);

// Update resource
export const updateResource = createAsyncThunk(
   'resources/updateResource',
   async ({ id, updates }: { id: string; updates: Partial<Resource> }, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resources/${id}`, updates, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to update resource');
      }
   }
);

// Delete resource
export const deleteResource = createAsyncThunk(
   'resources/deleteResource',
   async (id: string, thunkAPI) => {
      try {
         await axiosInstance.delete(`/api/resources/${id}`, { withCredentials: true });
         return id;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to delete resource');
      }
   }
);

// Upvote resource
export const upvoteResource = createAsyncThunk(
   'resources/upvoteResource',
   async (resourceId: string, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resources/${resourceId}/upvote`, {}, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to upvote resource');
      }
   }
);

// Downvote resource
export const downvoteResource = createAsyncThunk(
   'resources/downvoteResource',
   async (resourceId: string, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resources/${resourceId}/downvote`, {}, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to downvote resource');
      }
   }
);

// Fetch resource reviews
export const fetchResourceReviews = createAsyncThunk(
   'resources/fetchResourceReviews',
   async (resourceId: string, thunkAPI) => {
      try {
         const res = await axiosInstance.get(`/api/resource-reviews/resource/${resourceId}`);
         return res.data.data as ResourceReview[];
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch resource reviews');
      }
   }
);

// Create resource review
export const createResourceReview = createAsyncThunk(
   'resources/createResourceReview',
   async (reviewData: {
      resource: string;
      rating: number;
      title?: string;
      review: string;
      pros?: string[];
      cons?: string[];
   }, thunkAPI) => {
      try {
         const res = await axiosInstance.post('/api/resource-reviews', reviewData, { withCredentials: true });
         return res.data.data as ResourceReview;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to create resource review');
      }
   }
);

// Update resource review
export const updateResourceReview = createAsyncThunk(
   'resources/updateResourceReview',
   async ({ reviewId, updates }: {
      reviewId: string;
      updates: {
         rating?: number;
         title?: string;
         review?: string;
         pros?: string[];
         cons?: string[];
      }
   }, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resource-reviews/${reviewId}`, updates, { withCredentials: true });
         return res.data.data as ResourceReview;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to update resource review');
      }
   }
);

// Delete resource review
export const deleteResourceReview = createAsyncThunk(
   'resources/deleteResourceReview',
   async (reviewId: string, thunkAPI) => {
      try {
         await axiosInstance.delete(`/api/resource-reviews/${reviewId}`, { withCredentials: true });
         return reviewId;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to delete resource review');
      }
   }
);

// Fetch user resource reviews
export const fetchUserResourceReviews = createAsyncThunk(
   'resources/fetchUserResourceReviews',
   async (_, thunkAPI) => {
      try {
         const res = await axiosInstance.get('/api/resource-reviews/user', { withCredentials: true });
         return res.data.data as ResourceReview[];
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch user resource reviews');
      }
   }
);




const resourceSlice = createSlice({
      name: 'resources', 
      initialState, 
      reducers: {}, 
         extraReducers: (builder) => {
            builder
               // Fetch all resources
               .addCase(fetchResources.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(fetchResources.fulfilled, (state, action: PayloadAction<Resource[]>) => {
                  state.loading = false;
                  state.resources = action.payload;
               })
               .addCase(fetchResources.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Fetch single resource
               .addCase(fetchResourceById.pending, (state) => {
                  state.loading = true;
                  state.error = null;
                  state.resource = null;
               })
               .addCase(fetchResourceById.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resource = action.payload;
               })
               .addCase(fetchResourceById.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
                  state.resource = null;
               })

               // Create resource
               .addCase(createResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(createResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resources.push(action.payload);
               })
               .addCase(createResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Update resource
               .addCase(updateResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(updateResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resources = state.resources.map(r => r._id === action.payload._id ? action.payload : r);
               })
               .addCase(updateResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Delete resource
               .addCase(deleteResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(deleteResource.fulfilled, (state, action: PayloadAction<string>) => {
                  state.loading = false;
                  state.resources = state.resources.filter(r => r._id !== action.payload);
               })
               .addCase(deleteResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Upvote resource
               .addCase(upvoteResource.pending, (state) => {
                  state.error = null;
               })
               .addCase(upvoteResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.resources = state.resources.map(r => r._id === action.payload._id ? action.payload : r);
                  // Also update the current resource if it matches
                  if (state.resource?._id === action.payload._id) {
                     state.resource = action.payload;
                  }
               })
               .addCase(upvoteResource.rejected, (state, action) => {
                  state.error = action.payload as string;
               })

               // Downvote resource
               .addCase(downvoteResource.pending, (state) => {
                  state.error = null;
               })
               .addCase(downvoteResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.resources = state.resources.map(r => r._id === action.payload._id ? action.payload : r);
                  // Also update the current resource if it matches
                  if (state.resource?._id === action.payload._id) {
                     state.resource = action.payload;
                  }
               })
               .addCase(downvoteResource.rejected, (state, action) => {
                  state.error = action.payload as string;
               })

               // Fetch resource reviews
               .addCase(fetchResourceReviews.pending, (state) => {
                  state.error = null;
               })
               .addCase(fetchResourceReviews.fulfilled, (state, action: PayloadAction<ResourceReview[]>) => {
                  state.resourceReviews = action.payload;
               })
               .addCase(fetchResourceReviews.rejected, (state, action) => {
                  state.error = action.payload as string;
               })

               // Create resource review
               .addCase(createResourceReview.pending, (state) => {
                  state.error = null;
               })
               .addCase(createResourceReview.fulfilled, (state, action: PayloadAction<ResourceReview>) => {
                  state.resourceReviews.push(action.payload);
                  state.userResourceReviews.push(action.payload);
               })
               .addCase(createResourceReview.rejected, (state, action) => {
                  state.error = action.payload as string;
               })

               // Update resource review
               .addCase(updateResourceReview.pending, (state) => {
                  state.error = null;
               })
               .addCase(updateResourceReview.fulfilled, (state, action: PayloadAction<ResourceReview>) => {
                  state.resourceReviews = state.resourceReviews.map(r => r._id === action.payload._id ? action.payload : r);
                  state.userResourceReviews = state.userResourceReviews.map(r => r._id === action.payload._id ? action.payload : r);
               })
               .addCase(updateResourceReview.rejected, (state, action) => {
                  state.error = action.payload as string;
               })

               // Delete resource review
               .addCase(deleteResourceReview.pending, (state) => {
                  state.error = null;
               })
               .addCase(deleteResourceReview.fulfilled, (state, action: PayloadAction<string>) => {
                  state.resourceReviews = state.resourceReviews.filter(r => r._id !== action.payload);
                  state.userResourceReviews = state.userResourceReviews.filter(r => r._id !== action.payload);
               })
               .addCase(deleteResourceReview.rejected, (state, action) => {
                  state.error = action.payload as string;
               })

               // Fetch user resource reviews
               .addCase(fetchUserResourceReviews.pending, (state) => {
                  state.error = null;
               })
               .addCase(fetchUserResourceReviews.fulfilled, (state, action: PayloadAction<ResourceReview[]>) => {
                  state.userResourceReviews = action.payload;
               })
               .addCase(fetchUserResourceReviews.rejected, (state, action) => {
                  state.error = action.payload as string;
               });
         },
});


export default resourceSlice.reducer;