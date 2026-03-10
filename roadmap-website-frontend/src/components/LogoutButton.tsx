import React from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { logoutUser } from "@/state/slices/authSlice";
import { toast } from "sonner";

const LogoutButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        toast.success("Logged out successfully");
        window.location.reload();
      })
      .catch((error: any) => {
        toast.error("Logout Error", { description: error });
      });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-2 py-1.5 text-[#E2E8F0] hover:text-[#60A5FA] bg-transparent border-none outline-none"
      style={{ fontSize: '1rem', fontWeight: 500 }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
