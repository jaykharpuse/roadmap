
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchResourceById, upvoteResource, downvoteResource } from "@/state/slices/resourceSlice";
import { checkResourceBookmarked, createResourceBookmark, deleteResourceBookmark } from "@/state/slices/resourceBookmarkSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Share2, Bookmark, ThumbsUp, ThumbsDown, ExternalLink, Eye, Star, Users, Calendar, Clock, Globe } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import ResourceReviews from "@/components/ResourceReviews";

// RelatedResources component
function RelatedResources() {
  const relatedResources = [
    {
      id: 1,
      title: "React Performance Optimization",
      type: "article",
      difficulty: "intermediate",
    },
    {
      id: 2,
      title: "TypeScript Advanced Patterns",
      type: "course",
      difficulty: "advanced",
    },
    {
      id: 3,
      title: "CSS Modern Techniques",
      type: "video",
      difficulty: "beginner",
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#E2E8F0] flex items-center gap-2">
          <span className="w-1 h-5 bg-[#60A5FA] rounded-full"></span>
          Related Resources
        </h3>
        <Button variant="ghost" size="sm" className="text-[#60A5FA] hover:text-[#3B82F6] hover:bg-[#0F172A]">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {relatedResources.map((rel) => (
          <div
            key={rel.id}
            className="group p-4 rounded-lg border border-[#334155] bg-[#0F172A] hover:bg-[#1E293B] hover:border-[#60A5FA]/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[#E2E8F0] group-hover:text-[#60A5FA] transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#94A3B8] capitalize">{rel.type}</span>
                  <span className="text-xs px-2 py-1 rounded bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20">{rel.difficulty}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#60A5FA] transition-colors flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ResourceActions component
interface ResourceActionsProps {
  resource: any;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  isBookmarked: boolean;
  onAddBookmark: () => void;
  onRemoveBookmark: () => void;
  bookmarkLoading: boolean;
  upvoteLoading: boolean;
  downvoteLoading: boolean;
}
function ResourceActions({ resource, hasUpvoted, hasDownvoted, onUpvote, onDownvote, isBookmarked, onAddBookmark, onRemoveBookmark, bookmarkLoading, upvoteLoading, downvoteLoading }: ResourceActionsProps) {
  const handleOpenResource = () => {
    window.open(resource.url, "_blank");
  };
  const handleShare = async () => {
    const shareData = {
      title: resource.title,
      text: `Check out this resource: ${resource.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (error: any) {
        // User cancelled the share or error occurred
        if (error.name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to clipboard copy for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };
  return (
    <div className="space-y-3">
      <Button
        onClick={handleOpenResource}
        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-6 rounded-lg transition-all hover:shadow-lg hover:shadow-[#3B82F6]/20"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Resource
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onUpvote}
          disabled={upvoteLoading}
          variant="outline"
          className={`rounded-lg py-5 border transition-all ${
            hasUpvoted
              ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
              : "bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50"
          } ${upvoteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <ThumbsUp className={`w-4 h-4 mr-2 ${upvoteLoading ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">{resource.upvotes?.length || 0}</span>
        </Button>
        <Button
          onClick={onDownvote}
          disabled={downvoteLoading}
          variant="outline"
          className={`rounded-lg py-5 border transition-all ${
            hasDownvoted
              ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
              : "bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50"
          } ${downvoteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <ThumbsDown className={`w-4 h-4 mr-2 ${downvoteLoading ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">{resource.downvotes?.length || 0}</span>
        </Button>
      </div>
      <Button
        onClick={handleShare}
        variant="outline"
        className="w-full rounded-lg bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50 transition-all"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      {!isBookmarked ? (
        <Button
          variant="outline"
          className="w-full rounded-lg bg-[#0F172A] text-[#E2E8F0] border-[#334155] hover:bg-[#1E293B] hover:border-[#60A5FA]/50 transition-all"
          onClick={onAddBookmark}
          disabled={bookmarkLoading}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          {bookmarkLoading ? "Saving..." : "Add Bookmark"}
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full rounded-lg bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
          onClick={onRemoveBookmark}
          disabled={bookmarkLoading}
        >
          <Bookmark className="w-4 h-4 mr-2 fill-current" />
          {bookmarkLoading ? "Removing..." : "Remove Bookmark"}
        </Button>
      )}
    </div>
  );
}

// ResourceHeader component
interface ResourceHeaderProps {
  resource: any;
}
function ResourceHeader({ resource }: ResourceHeaderProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "expert":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30";
    }
  };
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "free":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "paid":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "freemium":
        return "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30";
      case "subscription":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      default:
        return "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30";
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={`${getDifficultyColor(resource.difficulty)} capitalize font-medium`}>
          {resource.difficulty}
        </Badge>
        <Badge variant="outline" className={`${getContentTypeColor(resource.contentType)} capitalize font-medium`}>
          {resource.contentType}
        </Badge>
        {resource.isApproved && (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 font-medium">
            <span className="mr-1">✓</span> Verified
          </Badge>
        )}
      </div>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#E2E8F0] leading-tight mb-3">
          {resource.title}
        </h1>
        <p className="text-base text-[#CBD5E1] leading-relaxed">{resource.description}</p>
      </div>
    </div>
  );
}

// ResourceMetadata component
interface ResourceMetadataProps {
  resource: any;
}
function ResourceMetadata({ resource }: ResourceMetadataProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const metadataItems = [
    { icon: Users, label: "Author", value: resource.author || "Unknown" },
    { icon: Calendar, label: "Published", value: formatDate(resource.publishedDate) },
    { icon: Clock, label: "Duration", value: resource.duration?.value && resource.duration?.unit ? `${resource.duration.value} ${resource.duration.unit}` : "N/A" },
    { icon: Globe, label: "Language", value: resource.language ? resource.language.toUpperCase() : "N/A" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[#E2E8F0] mb-4 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1 h-4 bg-[#60A5FA] rounded-full"></span>
          Resource Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {metadataItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-[#60A5FA]/50 transition-all"
              >
                <Icon className="w-4 h-4 text-[#60A5FA] mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#94A3B8]">{item.label}</span>
                  <span className="text-sm font-medium text-[#E2E8F0]">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#E2E8F0] uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-[#60A5FA] rounded-full"></span>
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag: string, idx: number) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30 hover:bg-[#60A5FA]/20 hover:border-[#60A5FA]/50 transition-all cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ResourceStats component
interface ResourceStatsProps {
  resource: any;
}
function ResourceStats({ resource }: ResourceStatsProps) {
  const stats = [
    {
      icon: Eye,
      label: "Views",
      value: resource.stats?.views?.toLocaleString() || 0,
      color: "text-[#60A5FA]",
      bgColor: "bg-[#60A5FA]/10",
    },
    {
      icon: Star,
      label: "Rating",
      value: resource.stats?.rating?.toFixed(1) || "0.0",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      icon: ThumbsUp,
      label: "Upvotes",
      value: resource.upvotes?.length || 0,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      icon: Users,
      label: "Reviews",
      value: resource.stats?.ratingCount || 0,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#E2E8F0] uppercase tracking-wide flex items-center gap-2">
        <span className="w-1 h-4 bg-[#60A5FA] rounded-full"></span>
        Statistics
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-[#60A5FA]/50 transition-all">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${stat.bgColor}`}>
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <span className="text-xs text-[#94A3B8]">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-[#E2E8F0] ml-1">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


const ResourceDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { resource, loading, error } = useAppSelector((state) => state.resource);
  const {user}= useAuth();
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [downvoteLoading, setDownvoteLoading] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [isFavoriteInput, setIsFavoriteInput] = useState<boolean>(false);

  useEffect(() => {
    if (id) dispatch(fetchResourceById(id));
  }, [dispatch, id]);

  // Check if user has upvoted/downvoted
  useEffect(() => {
    if (resource && user?._id) {
      const userIdString = user._id.toString();
      setHasUpvoted(resource.upvotes?.some((id: any) => id.toString() === userIdString) || false);
      setHasDownvoted(resource.downvotes?.some((id: any) => id.toString() === userIdString) || false);
    }
  }, [resource, user?._id]);

  useEffect(() => {
    if (resource?._id && user?._id) {
      dispatch(checkResourceBookmarked(resource._id)).unwrap().then((res) => {
        setIsBookmarked(res.isBookmarked);
      }).catch(() => {
        setIsBookmarked(false);
      });
    }
  }, [resource?._id, user?._id, dispatch]);

  if (loading || !resource) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-96 w-full bg-[#101828]" />
      </div>
    );
  }

  const handleUpvote = () => {
    if (!user) {
      toast.error("Please login to upvote this resource");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!resource._id || upvoteLoading) return;
    
    // Optimistic update
    const previousUpvoted = hasUpvoted;
    const previousDownvoted = hasDownvoted;
    setHasUpvoted(!hasUpvoted);
    if (hasDownvoted) setHasDownvoted(false);
    setUpvoteLoading(true);
    
    dispatch(upvoteResource(resource._id))
      .unwrap()
      .then(() => {
        setUpvoteLoading(false);
      })
      .catch((error) => {
        // Revert on error
        setHasUpvoted(previousUpvoted);
        setHasDownvoted(previousDownvoted);
        setUpvoteLoading(false);
        toast.error(error?.message || "Failed to upvote resource");
      });
  };

  const handleDownvote = () => {
    if (!user) {
      toast.error("Please login to downvote this resource");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!resource._id || downvoteLoading) return;
    
    // Optimistic update
    const previousUpvoted = hasUpvoted;
    const previousDownvoted = hasDownvoted;
    setHasDownvoted(!hasDownvoted);
    if (hasUpvoted) setHasUpvoted(false);
    setDownvoteLoading(true);
    
    dispatch(downvoteResource(resource._id))
      .unwrap()
      .then(() => {
        setDownvoteLoading(false);
      })
      .catch((error) => {
        // Revert on error
        setHasUpvoted(previousUpvoted);
        setHasDownvoted(previousDownvoted);
        setDownvoteLoading(false);
        toast.error(error?.message || "Failed to downvote resource");
      });
  };

  const handleAddBookmark = () => {
    if (!user) {
      toast.error("Please login to bookmark this resource");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!resource._id) return;
    
    setBookmarkLoading(true);
    setIsBookmarkModalOpen(false);
    setIsBookmarked(true);
    const payload = {
      resource: resource._id,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      notes: notesInput?.trim() || undefined,
      isFavorite: isFavoriteInput,
    };
    dispatch(createResourceBookmark(payload as any))
      .unwrap()
      .then(() => {
        setTagsInput("");
        setNotesInput("");
        setIsFavoriteInput(false);
        toast.success("Resource bookmarked successfully!");
      })
      .catch((error) => {
        setIsBookmarked(false);
        toast.error(error?.message || "Failed to bookmark resource");
      })
      .finally(() => {
        setBookmarkLoading(false);
      });
  };

  const handleRemoveBookmark = () => {
    if (!user) {
      toast.error("Please login to manage bookmarks");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!resource._id) return;
    setBookmarkLoading(true);
    setIsRemoveConfirmOpen(false);
    setIsBookmarked(false);
    dispatch(deleteResourceBookmark(resource._id))
      .unwrap()
      .then(() => {
        toast.success("Bookmark removed successfully!");
      })
      .catch((error) => {
        setIsBookmarked(true);
        toast.error(error?.message || "Failed to remove bookmark");
      })
      .finally(() => {
        setBookmarkLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617]">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-[#E2E8F0]/60">
          <a href="/resources" className="hover:text-[#60A5FA] transition-colors">Resources</a>
          <span>/</span>
          <span className="text-[#60A5FA] capitalize">{resource.resourceType}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
              <ResourceHeader resource={resource} />
            </div>

            {/* Thumbnail */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#334155] bg-[#1E293B] shadow-xl">
              <img
                src={resource.thumbnail?.url || "/placeholder.svg"}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-[#E2E8F0] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#60A5FA] rounded-full"></span>
                About this resource
              </h2>
              <p className="text-[#CBD5E1] leading-relaxed">{resource.description}</p>
            </div>

            {/* Metadata */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
              <ResourceMetadata resource={resource} />
            </div>

            {/* Related Resources */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
              <RelatedResources />
            </div>

            {/* Resource Reviews */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
              <ResourceReviews resourceId={resource._id} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Stats Card */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
                <ResourceStats resource={resource} />
              </div>

              {/* Action Buttons */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
                <ResourceActions
                  resource={resource}
                  hasUpvoted={hasUpvoted}
                  hasDownvoted={hasDownvoted}
                  onUpvote={handleUpvote}
                  onDownvote={handleDownvote}
                  isBookmarked={isBookmarked}
                  onAddBookmark={() => setIsBookmarkModalOpen(true)}
                  onRemoveBookmark={() => setIsRemoveConfirmOpen(true)}
                  bookmarkLoading={bookmarkLoading}
                  upvoteLoading={upvoteLoading}
                  downvoteLoading={downvoteLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          </div>
        )}
      </div>
      {/* Bookmark Modal */}
      <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to bookmarks</DialogTitle>
            <DialogDescription>
              Provide optional details before saving this resource to your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="frontend, react, learning"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Why this resource is useful or how you'll approach it..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="favorite">Mark as favorite</Label>
              <Switch id="favorite" checked={isFavoriteInput} onCheckedChange={setIsFavoriteInput} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookmarkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBookmark} disabled={bookmarkLoading || !resource._id}>
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Remove Bookmark Confirm */}
      <AlertDialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This resource will be removed from your bookmarks. You can add it again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveBookmark} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourceDetails;
