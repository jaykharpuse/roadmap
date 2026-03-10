export interface IUser {
  _id: string;           
  username: string;
  email: string;
  profileUrl?: string;    
  isVerified: boolean;
  Role: "student" | "admin" | "instructor";

  

 
  createdAt: string;       
  updatedAt: string;       
}
