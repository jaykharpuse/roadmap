
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchResourceById, upvoteResource, downvoteResource } from "@/state/slices/resourceSlice";
import { checkResourceBookmarked, createResourceBookmark, deleteResourceBookmark } from "@/state/slices/resourceBookmarkSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Bookmark, BookmarkX, ThumbsUp, ThumbsDown, ExternalLink,
  Eye, Star, Users, Calendar, Clock, Globe, ChevronRight, BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import ResourceReviews from "@/components/ResourceReviews";
import { motion } from "framer-motion";

const difficultyStyle = (d?: string) => {
  switch (d?.toLowerCase()) {
    case "beginner":     return "bg-green-500/15 text-green-400 border-green-500/25";
    case "intermediate": return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "advanced":     return "bg-rose-500/15 text-rose-400 border-rose-500/25";
    case "expert":       return "bg-red-500/15 text-red-400 border-red-500/25";
    default:             return "bg-orange-500/15 text-orange-400 border-orange-500/25";
  }
};

const contentTypeStyle = (t?: string) => {
  switch (t?.toLowerCase()) {
    case "free":         return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    case "paid":         return "bg-violet-500/15 text-violet-400 border-violet-500/25";
    case "freemium":     return "bg-blue-500/15 text-blue-400 border-blue-500/25";
    case "subscription": return "bg-orange-500/15 text-orange-400 border-orange-500/25";
    default:             return "bg-foreground/[0.06] text-muted-foreground border-border";
  }
};

const ResourceDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { resource, loading } = useAppSelector((state) => state.resource);
  const { user } = useAuth();
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [downvoteLoading, setDownvoteLoading] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isFavoriteInput, setIsFavoriteInput] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchResourceById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (resource && user?._id) {
      const uid = user._id.toString();
      setHasUpvoted(resource.upvotes?.some((x: any) => x.toString() === uid) || false);
      setHasDownvoted(resource.downvotes?.some((x: any) => x.toString() === uid) || false);
    }
  }, [resource, user?._id]);

  useEffect(() => {
    if (resource?._id && user?._id) {
      dispatch(checkResourceBookmarked(resource._id)).unwrap()
        .then((res) => setIsBookmarked(res.isBookmarked))
        .catch(() => setIsBookmarked(false));
    }
  }, [resource?._id, user?._id, dispatch]);

  if (loading || !resource) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  const handleUpvote = () => {
    if (!user) { toast.error("Please login to vote"); navigate("/login", { state: { from: location } }); return; }
    if (!resource._id || upvoteLoading) return;
    const prev = { up: hasUpvoted, down: hasDownvoted };
    setHasUpvoted(!hasUpvoted);
    if (hasDownvoted) setHasDownvoted(false);
    setUpvoteLoading(true);
    dispatch(upvoteResource(resource._id)).unwrap()
      .catch((e) => { setHasUpvoted(prev.up); setHasDownvoted(prev.down); toast.error(e?.message || "Failed"); })
      .finally(() => setUpvoteLoading(false));
  };

  const handleDownvote = () => {
    if (!user) { toast.error("Please login to vote"); navigate("/login", { state: { from: location } }); return; }
    if (!resource._id || downvoteLoading) return;
    const prev = { up: hasUpvoted, down: hasDownvoted };
    setHasDownvoted(!hasDownvoted);
    if (hasUpvoted) setHasUpvoted(false);
    setDownvoteLoading(true);
    dispatch(downvoteResource(resource._id)).unwrap()
      .catch((e) => { setHasUpvoted(prev.up); setHasDownvoted(prev.down); toast.error(e?.message || "Failed"); })
      .finally(() => setDownvoteLoading(false));
  };

  const handleAddBookmark = () => {
    if (!user) { toast.error("Please login"); navigate("/login", { state: { from: location } }); return; }
    if (!resource._id) return;
    setBookmarkLoading(true);
    setIsBookmarkModalOpen(false);
    setIsBookmarked(true);
    dispatch(createResourceBookmark({
      resource: resource._id,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      notes: notesInput?.trim() || undefined,
      isFavorite: isFavoriteInput,
    } as any)).unwrap()
      .then(() => { setTagsInput(""); setNotesInput(""); setIsFavoriteInput(false); toast.success("Bookmarked!"); })
      .catch((e) => { setIsBookmarked(false); toast.error(e?.message || "Failed"); })
      .finally(() => setBookmarkLoading(false));
  };

  const handleRemoveBookmark = () => {
    if (!user || !resource._id) return;
    setBookmarkLoading(true);
    setIsRemoveConfirmOpen(false);
    setIsBookmarked(false);
    dispatch(deleteResourceBookmark(resource._id)).unwrap()
      .then(() => toast.success("Bookmark removed"))
      .catch((e) => { setIsBookmarked(true); toast.error(e?.message || "Failed"); })
      .finally(() => setBookmarkLoading(false));
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, url: window.location.href });
        toast.success("Shared!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch { toast.error("Failed to share"); }
  };

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const metaItems = [
    { icon: Users,    label: "Author",    value: resource.author || "Unknown" },
    { icon: Calendar, label: "Published", value: formatDate(resource.publishedDate) },
    { icon: Clock,    label: "Duration",  value: resource.duration?.value ? `${resource.duration.value} ${resource.duration.unit}` : "N/A" },
    { icon: Globe,    label: "Language",  value: resource.language ? resource.language.toUpperCase() : "N/A" },
  ];

  const stats = [
    { icon: Eye,      label: "Views",   value: (resource.stats?.views || 0).toLocaleString(),     color: "text-orange-400",  bg: "bg-orange-500/10" },
    { icon: Star,     label: "Rating",  value: (resource.stats?.rating || 0).toFixed(1),           color: "text-amber-400",   bg: "bg-amber-500/10" },
    { icon: ThumbsUp, label: "Upvotes", value: resource.upvotes?.length || 0,                       color: "text-green-400",   bg: "bg-green-500/10" },
    { icon: Users,    label: "Reviews", value: resource.stats?.ratingCount || 0,                    color: "text-violet-400",  bg: "bg-violet-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-600/[0.04] blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8"
        >
          <Link to="/resources" className="hover:text-orange-400 transition-colors">Resources</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground capitalize">{resource.resourceType || "Resource"}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div
            className="lg:col-span-2 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Card */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.difficulty && (
                  <Badge className={`capitalize text-xs border ${difficultyStyle(resource.difficulty)}`}>{resource.difficulty}</Badge>
                )}
                {resource.contentType && (
                  <Badge className={`capitalize text-xs border ${contentTypeStyle(resource.contentType)}`}>{resource.contentType}</Badge>
                )}
                {resource.isApproved && (
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-xs border">✓ Verified</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {resource.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed">{resource.description}</p>
            </div>

            {/* Thumbnail */}
            {resource.thumbnail?.url && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass">
                <img
                  src={resource.thumbnail.url}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {/* About */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="w-1 h-5 bg-gradient-to-b from-orange-400 to-rose-500 rounded-full" />
                About this resource
              </h2>
              <p className="text-muted-foreground leading-relaxed">{resource.description}</p>
            </div>

            {/* Metadata */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-orange-400 to-rose-500 rounded-full" />
                Resource Details
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {metaItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-border hover:border-orange-500/25 transition-colors">
                    <item.icon className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {resource.tags && resource.tags.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-foreground/[0.03] border-border text-muted-foreground hover:border-orange-500/30 hover:text-orange-400 transition-colors cursor-pointer text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reviews */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="w-1 h-5 bg-gradient-to-b from-orange-400 to-rose-500 rounded-full" />
                Reviews
              </h2>
              {resource?._id ? <ResourceReviews resourceId={resource._id} /> : null}
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="sticky top-8 space-y-5">
              {/* Stats */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-orange-400 to-rose-500 rounded-full" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-foreground/[0.03] border border-border">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg ${s.bg}`}>
                          <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                        </div>
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="glass rounded-2xl p-5 space-y-3">
                {/* Open Resource */}
                <button
                  onClick={() => window.open(resource.url, "_blank")}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Resource
                </button>

                {/* Vote row */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleUpvote}
                    disabled={upvoteLoading}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                      hasUpvoted
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "glass border-border text-foreground hover:border-green-500/30 hover:text-green-400"
                    } disabled:opacity-50`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{resource.upvotes?.length || 0}</span>
                  </button>
                  <button
                    onClick={handleDownvote}
                    disabled={downvoteLoading}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                      hasDownvoted
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "glass border-border text-foreground hover:border-red-500/30 hover:text-red-400"
                    } disabled:opacity-50`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{resource.downvotes?.length || 0}</span>
                  </button>
                </div>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl glass border border-border text-foreground hover:border-orange-500/30 hover:text-orange-400 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                {/* Bookmark */}
                {!isBookmarked ? (
                  <button
                    onClick={() => setIsBookmarkModalOpen(true)}
                    disabled={bookmarkLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl glass border border-border text-foreground hover:border-orange-500/30 hover:text-orange-400 transition-all disabled:opacity-50"
                  >
                    <Bookmark className="w-4 h-4" />
                    {bookmarkLoading ? "Saving..." : "Add Bookmark"}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRemoveConfirmOpen(true)}
                    disabled={bookmarkLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-50"
                  >
                    <BookmarkX className="w-4 h-4" />
                    {bookmarkLoading ? "Removing..." : "Remove Bookmark"}
                  </button>
                )}
              </div>

              {/* Related placeholder */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  Related Resources
                </h3>
                <p className="text-xs text-muted-foreground">
                  Browse more resources in{" "}
                  <Link to="/resources" className="text-orange-400 hover:underline">the library</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bookmark Modal */}
      <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to bookmarks</DialogTitle>
            <DialogDescription>Provide optional details before saving this resource.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="frontend, react, learning" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Why this resource is useful..." value={notesInput} onChange={(e) => setNotesInput(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="favorite">Mark as favorite</Label>
              <Switch id="favorite" checked={isFavoriteInput} onCheckedChange={setIsFavoriteInput} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsBookmarkModalOpen(false)} className="px-4 py-2 text-sm rounded-lg glass border border-border text-foreground hover:bg-foreground/[0.06]">Cancel</button>
            <button onClick={handleAddBookmark} disabled={bookmarkLoading || !resource._id} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white disabled:opacity-50">Save Bookmark</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirm */}
      <AlertDialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
            <AlertDialogDescription>This resource will be removed from your bookmarks.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveBookmark} className="bg-red-500 hover:bg-red-600">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourceDetails;
