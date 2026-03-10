import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/authContext";
import LogoutButton from "@/components/LogoutButton";
import { useNavigate } from "react-router-dom";

const ProfileDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1E293B] focus:outline-none">
          {user.profileUrl ? (
            <img
              src={user.profileUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-blue-400"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user.username?.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden md:inline text-[#E2E8F0] font-medium">{user.username}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[180px] bg-[#1E293B] border border-[#334155] text-[#E2E8F0] shadow-lg rounded-md">
        <DropdownMenuItem className="hover:bg-[#0F172A] hover:text-[#60A5FA]" onClick={() => navigate("/progress")}>Progress Dashboard</DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-[#0F172A] hover:text-[#60A5FA]" onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-[#0F172A] hover:text-[#60A5FA]" asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
