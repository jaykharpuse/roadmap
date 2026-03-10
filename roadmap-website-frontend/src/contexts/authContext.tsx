import React, { createContext, useContext, useEffect, useState } from "react";

import type { IUser } from "@/types/user/user.types";
import axiosInstance from "@/helper/axiosInstance";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/user/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      // Don't show error toast on initial load - it's normal if not logged in
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get("/user/me", { withCredentials: true });
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// @refresh reset
// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
