import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Mail, Calendar, Shield, CheckCircle, XCircle,
  Settings, BookOpen, TrendingUp, Bookmark, Clock, Award, Edit2, X, Save,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import axiosInstance from "@/helper/axiosInstance";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-5 py-12 space-y-5">
          <Skeleton className="h-48 w-full rounded-2xl bg-foreground/[0.06]" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-foreground/[0.06]" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl bg-foreground/[0.06]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="glass-strong rounded-2xl p-8 max-w-sm w-full text-center">
          <User className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Not Logged In</h2>
          <p className="text-muted-foreground text-sm mb-5">Please sign in to view your profile</p>
          <button
            onClick={() => navigate("/login", { state: { from: location } })}
            className="w-full py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin":      return "bg-red-500/15 text-red-400 border-red-500/25";
      case "instructor": return "bg-violet-500/15 text-violet-400 border-violet-500/25";
      default:           return "bg-orange-500/15 text-orange-400 border-orange-500/25";
    }
  };

  const startEdit = () => { setUsernameInput(user?.username || ""); setEmailInput(user?.email || ""); setIsEditing(true); };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const form = new FormData();
      if (usernameInput) form.append("username", usernameInput);
      if (emailInput) form.append("email", emailInput);
      const file = fileRef.current?.files?.[0];
      if (file) form.append("profileUrl", file);
      const res = await axiosInstance.put("/user/me", form, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success) { toast.success("Profile updated"); setIsEditing(false); await refreshUser(); }
      else toast.error("Failed to update profile");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const quickActions = [
    { icon: TrendingUp, label: "Progress", sub: "Dashboard", path: "/progress", color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: BookOpen,   label: "Browse",   sub: "Roadmaps",  path: "/roadmaps",  color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Bookmark,   label: "Explore",  sub: "Resources", path: "/resources", color: "text-rose-400",   bg: "bg-rose-500/10" },
    { icon: Award,      label: "Status",   sub: user.isVerified ? "Verified" : "Unverified", path: "", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const infoFields = [
    { icon: User,          label: "Username",     value: user.username },
    { icon: Mail,          label: "Email",        value: user.email },
    { icon: Shield,        label: "Role",         value: user.Role,      className: "capitalize" },
    { icon: user.isVerified ? CheckCircle : XCircle, label: "Verification", value: user.isVerified ? "Verified" : "Not Verified", iconClass: user.isVerified ? "text-green-400" : "text-amber-400" },
    { icon: Calendar,      label: "Member Since", value: formatDate(user.createdAt) },
    { icon: Clock,         label: "Last Updated", value: formatDate(user.updatedAt) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-violet-600/[0.04] blur-[110px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-500/[0.03] blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 space-y-5">

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-orange-500/30 via-rose-500/20 to-violet-600/30 relative">
            <div className="absolute inset-0 bg-gradient-brand opacity-20" />
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-12 left-6">
              <Avatar className="w-24 h-24 border-4 border-card shadow-xl">
                <AvatarImage src={user.profileUrl || undefined} alt={user.username} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-violet-500 text-white text-3xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="pt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>{user.username}</h1>
                  {user.isVerified
                    ? <CheckCircle className="w-5 h-5 text-green-400" />
                    : <XCircle className="w-5 h-5 text-amber-400" />
                  }
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />{user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${roleColor(user.Role)} capitalize border text-xs px-3 py-1`}>
                  <Shield className="w-3 h-3 mr-1.5" />{user.Role}
                </Badge>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass border border-border text-foreground hover:bg-foreground/[0.06] transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          {quickActions.map((a, i) => (
            <div
              key={i}
              onClick={() => a.path && navigate(a.path)}
              className={`glass card-gradient-border rounded-2xl p-5 text-center ${a.path ? "cursor-pointer hover:shadow-lg transition-all duration-200" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center mx-auto mb-3`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{a.label}</p>
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>{a.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Account Details */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <User className="w-4 h-4 text-orange-400" /> Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {infoFields.map((field, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-border">
                <field.icon className={`w-4 h-4 flex-shrink-0 ${(field as any).iconClass || "text-orange-400"}`} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className={`text-sm font-medium text-foreground ${(field as any).className || ""} truncate`}>{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Username", value: usernameInput, onChange: setUsernameInput },
                { label: "Email",    value: emailInput,    onChange: setEmailInput },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-foreground/[0.04] border border-border text-foreground text-sm focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Profile Image</label>
                <input ref={fileRef} type="file" accept="image/*" className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20" />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-medium rounded-xl glass border border-border text-foreground hover:bg-foreground/[0.06]">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <Settings className="w-4 h-4 text-orange-400" /> Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "View Progress",    icon: TrendingUp, path: "/progress" },
              { label: "Generate Roadmap", icon: BookOpen,   path: "/generate-roadmap" },
              { label: "Browse Resources", icon: Bookmark,   path: "/resources" },
            ].map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl glass border border-border text-foreground hover:bg-foreground/[0.06] hover:border-orange-500/30 hover:text-orange-400 transition-all duration-200"
              >
                <a.icon className="w-4 h-4" /> {a.label}
              </button>
            ))}
            <LogoutButton />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
