import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Mail, Calendar, Shield, CheckCircle, XCircle,
  Settings, BookOpen, TrendingUp, Bookmark, Clock, Award, Edit2, X, Save,
  Link2, Link2Off, KeyRound,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import axiosInstance from "@/helper/axiosInstance";
import { toast } from "sonner";
import { motion } from "framer-motion";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { linkGoogleAccount, unlinkGoogleAccount, setPasswordForGoogleUser } from "@/state/slices/authSlice";

const UserProfile: React.FC = () => {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [googleLinking, setGoogleLinking] = useState(false);
  const [googleUnlinking, setGoogleUnlinking] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);

  const handleLinkGoogle = async (access_token: string) => {
    setGoogleLinking(true);
    dispatch(linkGoogleAccount({ access_token }))
      .unwrap()
      .then(async () => {
        toast.success("Google account linked successfully");
        await refreshUser();
      })
      .catch((err: any) => {
        toast.error("Failed to link Google account", { description: err });
      })
      .finally(() => setGoogleLinking(false));
  };

  const handleUnlinkGoogle = async () => {
    setGoogleUnlinking(true);
    dispatch(unlinkGoogleAccount())
      .unwrap()
      .then(async () => {
        toast.success("Google account unlinked");
        await refreshUser();
      })
      .catch((err: any) => {
        toast.error("Failed to unlink Google account", { description: err });
      })
      .finally(() => setGoogleUnlinking(false));
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }
    setSettingPassword(true);
    dispatch(setPasswordForGoogleUser({ password: newPassword }))
      .unwrap()
      .then(async () => {
        toast.success("Password set successfully");
        setShowSetPassword(false);
        setNewPassword("");
        await refreshUser();
      })
      .catch((err: any) => {
        toast.error("Failed to set password", { description: err });
      })
      .finally(() => setSettingPassword(false));
  };

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

  const providerLabel: Record<string, string> = {
    local: "Email & Password",
    google: "Google",
    both: "Email & Google",
  };

  const infoFields = [
    { icon: User,          label: "Username",     value: user.username },
    { icon: Mail,          label: "Email",        value: user.email },
    { icon: Shield,        label: "Role",         value: user.Role,      className: "capitalize" },
    { icon: user.isVerified ? CheckCircle : XCircle, label: "Verification", value: user.isVerified ? "Verified" : "Not Verified", iconClass: user.isVerified ? "text-green-400" : "text-amber-400" },
    { icon: Link2,         label: "Auth Method",  value: providerLabel[user.authProvider] || user.authProvider, className: "capitalize" },
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

        {/* Connected Accounts */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <Link2 className="w-4 h-4 text-orange-400" /> Connected Accounts
          </h2>

          <div className="space-y-4">
            {/* Google Account Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-foreground/[0.03] border border-border">
              <div className="flex items-center gap-3">
                {/* Google Icon */}
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Google</p>
                  <p className="text-xs text-muted-foreground">
                    {user.googleId ? "Connected — sign in with your Google account" : "Not connected"}
                  </p>
                </div>
                {user.googleId && (
                  <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>

              {user.googleId ? (
                <button
                  onClick={handleUnlinkGoogle}
                  disabled={googleUnlinking}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg glass border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                >
                  <Link2Off className="w-3.5 h-3.5" />
                  {googleUnlinking ? "Unlinking..." : "Disconnect"}
                </button>
              ) : (
                <div className="sm:w-52">
                  <GoogleAuthButton
                    variant="link"
                    loading={googleLinking}
                    onAccessToken={handleLinkGoogle}
                    onError={() => toast.error("Google connection was cancelled")}
                  />
                </div>
              )}
            </div>

            {/* Set Password for Google-only users */}
            {user.authProvider === "google" && (
              <div className="p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Password Login</p>
                      <p className="text-xs text-muted-foreground">Set a password to also sign in with email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSetPassword(!showSetPassword)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg glass border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Set Password
                  </button>
                </div>

                {showSetPassword && (
                  <div className="mt-4 flex gap-3">
                    <input
                      type="password"
                      placeholder="Enter new password (min 5 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl bg-foreground/[0.04] border border-border text-foreground text-sm focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
                    />
                    <button
                      onClick={handleSetPassword}
                      disabled={settingPassword}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white transition-colors disabled:opacity-50"
                    >
                      {settingPassword ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setShowSetPassword(false); setNewPassword(""); }}
                      className="px-3 py-2 text-xs rounded-xl glass border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

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
