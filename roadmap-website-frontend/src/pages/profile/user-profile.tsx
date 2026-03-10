import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Settings,
  BookOpen,
  TrendingUp,
  Bookmark,
  Clock,
  Award,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import axiosInstance from "@/helper/axiosInstance";
import { toast } from "sonner";

const UserProfile: React.FC = () => {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full bg-[#1E293B]" />
            <Skeleton className="h-48 w-full bg-[#1E293B]" />
            <Skeleton className="h-32 w-full bg-[#1E293B]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617] flex items-center justify-center">
        <Card className="bg-[#1E293B] border-[#334155] max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-[#60A5FA] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">
              Not Logged In
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Please login to view your profile
            </p>
            <Button
              onClick={() => navigate("/login", { state: { from: location } })}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "instructor":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30";
    }
  };

  const startEdit = () => {
    setUsernameInput(user?.username || "");
    setEmailInput(user?.email || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const form = new FormData();
      if (usernameInput) form.append("username", usernameInput);
      if (emailInput) form.append("email", emailInput);
      const file = fileRef.current?.files?.[0];
      if (file) form.append("profileUrl", file);

      const res = await axiosInstance.put("/user/me", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success("Profile updated");
        setIsEditing(false);
        // refresh auth user
        await refreshUser();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <Card className="bg-[#1E293B] border-[#334155] overflow-hidden mb-6">
          {/* Cover Image / Gradient */}
          <div className="h-32 bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899]" />

          <CardContent className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <Avatar className="w-32 h-32 border-4 border-[#1E293B] shadow-xl">
                <AvatarImage
                  src={user.profileUrl || undefined}
                  alt={user.username}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#3B82F6] text-white text-4xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="pt-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-[#E2E8F0]">
                      {user.username}
                    </h1>
                    {user.isVerified ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-[#94A3B8] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Badge
                    variant="outline"
                    className={`${getRoleBadgeColor(user.Role)} capitalize px-4 py-2 text-sm font-medium`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {user.Role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card
            className="bg-[#1E293B] border-[#334155] cursor-pointer hover:border-[#60A5FA]/50 transition-all"
            onClick={() => navigate("/progress")}
          >
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-[#60A5FA] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">Progress</p>
              <p className="text-lg font-semibold text-[#E2E8F0]">Dashboard</p>
            </CardContent>
          </Card>

          <Card
            className="bg-[#1E293B] border-[#334155] cursor-pointer hover:border-[#60A5FA]/50 transition-all"
            onClick={() => navigate("/roadmaps")}
          >
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">Browse</p>
              <p className="text-lg font-semibold text-[#E2E8F0]">Roadmaps</p>
            </CardContent>
          </Card>

          <Card
            className="bg-[#1E293B] border-[#334155] cursor-pointer hover:border-[#60A5FA]/50 transition-all"
            onClick={() => navigate("/resources")}
          >
            <CardContent className="p-4 text-center">
              <Bookmark className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">Explore</p>
              <p className="text-lg font-semibold text-[#E2E8F0]">Resources</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">Status</p>
              <p className="text-lg font-semibold text-[#E2E8F0]">
                {user.isVerified ? "Verified" : "Unverified"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <Card className="bg-[#1E293B] border-[#334155] mb-6">
          <CardHeader>
            <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
              <User className="w-5 h-5 text-[#60A5FA]" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <User className="w-5 h-5 text-[#60A5FA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Username</p>
                  <p className="text-[#E2E8F0] font-medium">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <Mail className="w-5 h-5 text-[#60A5FA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Email</p>
                  <p className="text-[#E2E8F0] font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <Shield className="w-5 h-5 text-[#60A5FA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Role</p>
                  <p className="text-[#E2E8F0] font-medium capitalize">
                    {user.Role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                {user.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="text-xs text-[#94A3B8]">Verification</p>
                  <p className="text-[#E2E8F0] font-medium">
                    {user.isVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <Calendar className="w-5 h-5 text-[#60A5FA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Member Since</p>
                  <p className="text-[#E2E8F0] font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <Clock className="w-5 h-5 text-[#60A5FA]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Last Updated</p>
                  <p className="text-[#E2E8F0] font-medium">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Edit Form */}
        {isEditing && (
          <Card className="bg-[#1E293B] border-[#334155] mb-6">
            <CardHeader>
              <CardTitle className="text-[#E2E8F0]">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs text-[#94A3B8]">Username</label>
                  <input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full mt-1 p-3 rounded bg-[#0F172A] border border-[#334155] text-[#E2E8F0]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8]">Email</label>
                  <input
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full mt-1 p-3 rounded bg-[#0F172A] border border-[#334155] text-[#E2E8F0]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8]">Profile Image</label>
                  <input ref={fileRef} type="file" accept="image/*" className="w-full mt-1 text-sm text-[#E2E8F0]" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#60A5FA]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50"
                onClick={() => navigate("/progress")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Progress
              </Button>

              <Button
                variant="outline"
                className="bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50"
                onClick={() => navigate("/generate-roadmap")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Generate Roadmap
              </Button>

              <Button
                variant="outline"
                className="bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50"
                onClick={startEdit}
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>

              <LogoutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
