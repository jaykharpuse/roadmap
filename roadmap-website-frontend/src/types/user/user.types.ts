export interface IUser {
  _id: string;
  username: string;
  email: string;
  profileUrl?: string;
  isVerified: boolean;
  Role: "student" | "admin" | "instructor";
  googleId?: string;
  authProvider: "local" | "google" | "both";
  createdAt: string;
  updatedAt: string;
}
