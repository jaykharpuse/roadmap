import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import roadmapReducer from "./slices/roadmapSlice"; 
import  analyticsReducer  from './slices/analyticsSlice';
import bookmarkReducer from './slices/bookmarkSlice'; 
import resourceBookmarkReducer from './slices/resourceBookmarkSlice';
import notificationReducer from './slices/notificationSlice';
import reviewReducer from './slices/reviewSlice';  
import resourceReducer from './slices/resourceSlice';
import contentSubmissionReducer from './slices/contentSubmissionSlice';  
import userProgressReducer from './slices/userProgressSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roadmap:roadmapReducer,
    analytics: analyticsReducer, 
    bookmark: bookmarkReducer,
    resourceBookmark: resourceBookmarkReducer,
    notification: notificationReducer,
    review: reviewReducer,
    resource: resourceReducer,
    contentSubmission: contentSubmissionReducer, 
    userProgress: userProgressReducer,    
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

