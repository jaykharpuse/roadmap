import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'; 
import type { PayloadAction } from '@reduxjs/toolkit';
import axios  from 'axios';
import type { Notification } from '@/types/user/Notification/notification';



interface NotificationState {
     notification: Notification[]; 
     loading: boolean; 
      error: string | null; 
}


const initialState: NotificationState = {
      notification: [], 
      loading: false, 
      error: null, 
}; 



export const fetchNotifications = createAsyncThunk(
      'notifications/fetchNotifications', 
        async(userId: string, thunkAPI) => {
              try{
                  const res = await axios.get(`/api/notification/${userId}`); 
                  return res.data as Notification[]; 
              }  catch(err: any){
                 return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch notifications'); 
              }
        }
); 


export const markNotificationAsRead = createAsyncThunk(
      'notification/markAsRead', 
       async(notificationId: string, thunkAPI) => {
          try{
              const res = await axios.patch(`/api/notification/read/${notificationId}`); 
              return res.data as Notification;
          } catch(err: any){
             return thunkAPI.rejectWithValue(err.response?.data || 'Failed to mark notification as read'); 
          }
       }
); 



export const markAllNotificationAsRead = createAsyncThunk(
      'notifications/markAllAsRead', 
      async(userId: string, thunkAPI) => {
          try{
              const res = await axios.patch(`/api/notification/read-all/${userId}`); 
              return res.data as Notification[]; 
          }  catch(err: any){
              return thunkAPI.rejectWithValue(err.response?.data || 'failed to mark all as read '); 
          }
      }
);



export const deleteNotification = createAsyncThunk(
      'notification/deleteNotification', 
      async(notificationId: string, thunkAPI) => {
           try{
              await axios.delete(`/api/notification/${notificationId}`); 
              return notificationId; 
           }  catch(err: any){
             return thunkAPI.rejectWithValue(err.response?.data || 'failed to delete notification'); 
           }
      }
); 



const notificationSlice = createSlice({
      name: 'notifications', 
      initialState, 
      reducers: {}, 
      extraReducers: (builder)=> {
          builder 
           .addCase(fetchNotifications.pending, (state) => {
             state.loading = true; 
             state.error= null; 
           })

           .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
              state.loading = false; 
              state.notification = action.payload; 
           })

           .addCase(fetchNotifications.rejected, (state, action) => {
              state.loading = false; 
              state.error = action.payload as string; 
           })


           .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
              const index = state.notification.findIndex(n => n._id === action.payload._id); 
              if(index !== -1){
                  state.notification[index] = action.payload; 
              }
           })


           .addCase(markAllNotificationAsRead.fulfilled, (state, _action: PayloadAction<Notification[]>) => {
              state.notification = state.notification.map(n => ({
                  ...n, 
                  isRead: true, 
                  readAt: new Date().toISOString() 
              }) ); 
           })


           .addCase(deleteNotification.fulfilled, (state, action:PayloadAction<string>) => {
               state.notification = state.notification.filter(n => n._id !== action.payload); 
           }); 
      }, 
}); 


export default notificationSlice.reducer; 

