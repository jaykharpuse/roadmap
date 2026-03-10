export type NotificationType = 
| 'system' 
| 'progress' 
| 'roadmap_update' 
| 'new_resource' 
| 'community' 
| 'promotional'; 


export interface Notification {
     _id: string; 
     user: string; 
     title: string; 
     message: string; 
     type: NotificationType; 
     isRead: boolean; 
     readAt?: string; 
     actionUrl?:string; 
     icon?: string; 
     metadata?: Record<string, any>; 
     createdAt: string; 
     updatedAt: string; 
}