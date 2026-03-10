import type { IUser } from "./user.types";

export interface authState{
    user:IUser | null ;
    isLoading :boolean;
    isAuthenticated :boolean ;
    


} 