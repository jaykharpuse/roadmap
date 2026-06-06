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
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] focus:outline-none transition-colors duration-200">
          {user.profileUrl ? (
            <img
              src={user.profileUrl}
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover border border-orange-500/30"
            />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-rose-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {(user.username || "U").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden md:inline text-sm text-white/70 font-medium">
            {user.username}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[180px] bg-[#111116] border border-white/[0.08] text-white/80 shadow-xl shadow-black/40 rounded-xl py-1.5">
        <DropdownMenuItem
          className="text-sm hover:bg-white/[0.06] hover:text-orange-400 rounded-lg mx-1 cursor-pointer"
          onClick={() => navigate("/progress")}
        >
          Progress Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm hover:bg-white/[0.06] hover:text-orange-400 rounded-lg mx-1 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm hover:bg-white/[0.06] hover:text-rose-400 rounded-lg mx-1 cursor-pointer"
          asChild
        >
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
