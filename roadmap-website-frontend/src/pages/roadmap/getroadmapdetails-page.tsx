"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import {
  Star,
  Clock,
  Users,
  Eye,
  Trophy,
  BookOpen,
  Play,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Calendar,
  UserIcon,
  Tag,
  AlertCircle,
  Target,
  TrendingUp,
  BookmarkPlus,
  BookmarkMinus,
} from "lucide-react"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { getRoadMapDetails } from "@/state/slices/roadmapSlice"
import { fetchUserProgress, startRoadmap, updateUserProgress } from "@/state/slices/userProgressSlice"
import axiosInstance from "@/helper/axiosInstance"
import { toast } from "sonner"
import { useAuth } from "@/contexts/authContext"
import type {
  ImportanceLevel,
  NodeDifficulty,
  Review,
  RoadmapDetails,
  RoadmapDifficulty,
  RoadmapNode,
  RoadmapStats,
} from "@/types/user/roadmap/roadmap-details"
import type {
  INodeProgressResponse,
  IUserProgressStatsResponse,
  ProgressStatus,
} from "@/types/user/progress/UserProgress"
import { ProgressSelector } from "./progress-selector"
import { socket } from "@/helper/useSocket"
import { checkIsBookMarked, CreateBookMark, deleteBookmark } from "@/state/slices/bookmarkSlice"

export interface IBookmarkRequest {
  roadmap: string
  tags?: string[]
  notes?: string
  isFavorite?: boolean
}

// Helper functions
const getDifficultyColor = (difficulty?: RoadmapDifficulty | NodeDifficulty) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "intermediate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "advanced":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "expert":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getImportanceColor = (importance?: ImportanceLevel) => {
  switch (importance) {
    case "critical":
      return "text-red-400"
    case "high":
      return "text-orange-400"
    case "medium":
      return "text-yellow-400"
    case "low":
      return "text-green-400"
    default:
      return "text-gray-400"
  }
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play className="h-4 w-4" />
    case "course":
      return <BookOpen className="h-4 w-4" />
    case "article":
      return <FileText className="h-4 w-4" />
    case "documentation":
      return <FileText className="h-4 w-4" />
    default:
      return <ExternalLink className="h-4 w-4" />
  }
}

// Components
const RoadmapHeader = ({ roadmap }: { roadmap: RoadmapDetails }) => (
  <div className="relative">
    <div className="h-64 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg overflow-hidden">
      {roadmap.coverImage && (
        <img
          src={roadmap.coverImage.url || "/placeholder.svg"}
          alt={roadmap.title}
          className="w-full h-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>

    <div className="absolute bottom-6 left-6 right-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="capitalize">
          {roadmap.category}
        </Badge>
        {roadmap.isFeatured && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Featured</Badge>
        )}
        <Badge className={`border ${getDifficultyColor(roadmap.difficulty)} capitalize`}>{roadmap.difficulty}</Badge>
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-2">{roadmap.title}</h1>
      <p className="text-muted-foreground text-lg max-w-3xl">{roadmap.description}</p>
    </div>
  </div>
)

const StatsCard = ({ stats }: { stats: RoadmapStats }) => (
  <Card>
    <CardContent className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.views.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Views</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.completions.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Completions</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Rating</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.ratingsCount?.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Reviews</div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const ProgressStatsCard = ({ stats }: { stats: IUserProgressStatsResponse }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Your Progress
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Nodes Completed</span>
          <span className="text-foreground font-medium">
            {stats.completedNodes} of {stats.totalNodes}
          </span>
        </div>
        <Progress value={stats.completionPercentage} className="h-2" />
        <p className="text-sm text-muted-foreground">{stats.completionPercentage}% Complete</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Resources Completed</span>
          <span className="text-foreground font-medium">
            {stats.completedResources} of {stats.totalResources}
          </span>
        </div>
        <Progress value={(stats.completedResources / stats.totalResources) * 100} className="h-2" />
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Keep up the great work!
        </div>
      </div>
    </CardContent>
  </Card>
)

const NodeCard = ({
  node,
  nodeProgress,

  depth = 0,
  roadmapId,
  isAuthenticated,
  navigate,
}: {
  node: RoadmapNode
  nodeProgress?: INodeProgressResponse
  depth?: number
  roadmapId?: string
  isAuthenticated?: boolean
  navigate?: (path: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const currentStatus = nodeProgress?.status || "not_started"
  const dispatch = useAppDispatch()
  const handleProgressChange = (status: ProgressStatus) => {
    if (!isAuthenticated) {
      toast.error("Please login to track your progress")
      navigate?.("/login")
      return
    }
    dispatch(updateUserProgress({ roadmapId: roadmapId ?? "", nodeId: node._id, status }))
      .unwrap()
      .then(() => {
        toast.success("progress updated successfully")
      })
      .catch(() => {
        toast.error("failed to update progress")
      })
  }

  return (
    <div className={`ml-${depth * 4}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Progress
                  value={currentStatus === "completed" ? 100 : currentStatus === "in_progress" ? 50 : 0}
                  className="h-4 w-4"
                />

                {node.children && node.children.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="p-1 h-6 w-6">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}

                <h3 className="text-lg font-semibold text-foreground">{node.title}</h3>

                {node.nodeType && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {node.nodeType}
                  </Badge>
                )}

                {node.isOptional && (
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>

              {node.description && <p className="text-muted-foreground mb-3 ml-8">{node.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm ml-8">
                {node.estimatedDuration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    {node.estimatedDuration.value} {node.estimatedDuration.unit}
                  </div>
                )}

                {node.metadata?.difficulty && (
                  <Badge className={`border text-xs ${getDifficultyColor(node.metadata.difficulty)}`}>
                    {node.metadata.difficulty}
                  </Badge>
                )}

                {node.metadata?.importance && (
                  <div className={`flex items-center gap-1 text-xs ${getImportanceColor(node.metadata.importance)}`}>
                    <AlertCircle className="h-3 w-3" />
                    {node.metadata.importance} priority
                  </div>
                )}
              </div>

              {node.resources && node.resources.length > 0 && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-medium text-foreground mb-2">Resources:</h4>
                  <div className="space-y-1">
                    {node.resources.map((resource) => (
                      <div key={resource._id} className="flex items-center gap-2 text-sm">
                        <span className="text-primary">{getResourceIcon(resource.type)}</span>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          {resource.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {node.dependencies && node.dependencies.length > 0 && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-medium text-foreground mb-1">Dependencies:</h4>
                  <div className="text-sm text-muted-foreground">
                    {node.dependencies.map((dep, index) => (
                      <span key={dep._id}>
                        {index > 0 && ", "}
                        <span className="text-primary">{dep.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {nodeProgress?.notes && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-medium text-foreground mb-1">Notes:</h4>
                  <p className="text-sm text-muted-foreground">{nodeProgress.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <ProgressSelector currentStatus={currentStatus} onStatusChange={handleProgressChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isExpanded && node.children && (
        <div className="ml-6">
          {node.children.map((child) => (
            <NodeCard
              key={child._id}
              node={child}
              nodeProgress={nodeProgress}
              depth={depth + 1}
              roadmapId={roadmapId}
              isAuthenticated={isAuthenticated}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const RoadmapInfo = ({ roadmap }: { roadmap: RoadmapDetails }) => (
  <Card>
    <CardHeader>
      <CardTitle>Roadmap Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {roadmap.estimatedDuration && (
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            Estimated Duration: {roadmap.estimatedDuration.value} {roadmap.estimatedDuration.unit}
          </span>
        </div>
      )}

      {roadmap.contributor && (
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-primary" />
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={roadmap.contributor.avatar || "/placeholder.svg"} />
              <AvatarFallback>{roadmap.contributor.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">Created by {roadmap.contributor.username}</span>
          </div>
        </div>
      )}

      {roadmap.lastUpdated && (
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            Last updated: {new Date(roadmap.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      )}

      {roadmap.tags && roadmap.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Tag className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {roadmap.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Reviews</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-border pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{review.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{review.user.username}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{review.createdAt.toLocaleDateString()}</span>
                </div>

                {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default function RoadmapDetailsPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const [isLoading] = useState<boolean>(false)
  const { roadmap: RoadmapDetails } = useAppSelector((state) => state.roadmap)
  const { progress } = useAppSelector((state) => state.userProgress)
  const [userProgress, setUserProgress] = useState(progress)

  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)
  const [isBookmarkMutating, setIsBookmarkMutating] = useState(false)
  const [tagsInput, setTagsInput] = useState<string>("")
  const [notesInput, setNotesInput] = useState<string>("")
  const [isFavoriteInput, setIsFavoriteInput] = useState<boolean>(false)


  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

  useEffect(() => {
    // Handle both structures: direct roadmap or nested { roadmap, nodes }
    const roadmapId = (RoadmapDetails as any)?.roadmap?._id || (RoadmapDetails as any)?._id
    if (roadmapId) {
      dispatch(checkIsBookMarked(roadmapId)).unwrap().then((res) => {
        setIsBookmarked(res.isBookmarked)
      })
    }
  }, [RoadmapDetails, dispatch])

  useEffect(() => {
    if (progress) setUserProgress(progress)
  }, [progress])

  useEffect(() => {
    if (!roadmapId) return

    dispatch(getRoadMapDetails(roadmapId))
      .then(() => {
        // record recently viewed on backend
        axiosInstance.post('/api/recently-viewed', { roadmapId }).catch(() => {})

        dispatch(fetchUserProgress(roadmapId))
          .then(() => toast.success("Fetched user progress successfully"))
          .catch(() => toast.error("Failed to fetch the user progress"))
      })
      .catch(() => toast.error("Failed to fetch roadmap details"))
  }, [roadmapId, dispatch])

  useEffect(() => {
    socket.on("progressUpdated", ({ roadmapId: id, nodeId, status }) => {
      console.log("this is a socket event ", roadmapId, nodeId, status)
      if (id === roadmapId) {
        setUserProgress((prev) => {
          if (!prev) return prev

          return {
            ...prev,
            nodes: prev.nodes.map((node) => (node.node._id === nodeId ? { ...node, status } : node)),
          }
        })
      }
    })

    // cleanup socket listener on unmount
    return () => {
      socket.off("progressUpdated")
    }
  }, [roadmapId])

  const startProgress = () => {
    if (!roadmapId) return

    if (!isAuthenticated) {
      toast.error("Please login to start learning")
      navigate("/login", { state: { from: location } })
      return
    }

    dispatch(startRoadmap(roadmapId))
      .unwrap()
      .then(() => toast.success("Roadmap started successfully"))
      .catch(() => toast.error("Failed to start roadmap"))
  }
const handleAddBookmark = () => {
  if (!roadmapId) return;

  if (!isAuthenticated) {
    toast.error("Please login to bookmark this roadmap")
    navigate("/login", { state: { from: location } })
    return
  }

  const payload: IBookmarkRequest = {
    roadmap: roadmapId,
    tags: tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    notes: notesInput?.trim() || undefined,
    isFavorite: isFavoriteInput,
  };

  // Optimistic update
  setIsBookmarkMutating(true);
  setIsBookmarkModalOpen(false);

  const prevBookmarked = isBookmarked;
  setIsBookmarked(true);
  toast.message("Adding to bookmarks...", { description: "This is an optimistic update." });

  dispatch(CreateBookMark(payload as any))
    .unwrap()
    .then(() => {
      toast.success("Added to bookmarks");
      // Clear inputs
      setTagsInput("");
      setNotesInput("");
      setIsFavoriteInput(false);
    })
    .catch(() => {
      setIsBookmarked(prevBookmarked); // revert if API fails
      toast.error("Failed to add to bookmarks");
    })
    .finally(() => {
      setIsBookmarkMutating(false);
    });
};

  const handleRemoveBookmark = () => {
    if (!roadmapId) return;

    if (!isAuthenticated) {
      toast.error("Please login to manage bookmarks")
      navigate("/login", { state: { from: location } })
      return
    }

    setIsBookmarkMutating(true);
    setIsRemoveConfirmOpen(false);

    const prevBookmarked = isBookmarked;
    setIsBookmarked(false); // optimistic update
    toast.message("Removing bookmark...", { description: "This is an optimistic update." });

    dispatch(deleteBookmark(roadmapId))
      .unwrap()
      .then(() => {
        toast.success("Removed from bookmarks");
      })
      .catch(() => {
        setIsBookmarked(prevBookmarked); // revert if API fails
        toast.error("Failed to remove bookmark");
      })
      .finally(() => {
        setIsBookmarkMutating(false);
      });
  };

  // 👉 Now conditionally render after all hooks
  if (!RoadmapDetails) {
    return <p>Loading roadmap...</p>
  }

  // Handle both structures: direct roadmap or nested { roadmap, nodes }
  const nodes = RoadmapDetails.nodes || []
  const roadmap = RoadmapDetails.roadmap || RoadmapDetails

  const getNodeProgress = (nodeId: string): INodeProgressResponse | undefined => {
    return userProgress?.nodes?.find((progress) => progress.node._id === nodeId)
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <RoadmapHeader roadmap={roadmap} />

        {/* Stats */}
        <div className="mt-8">{roadmap.stats && <StatsCard stats={roadmap.stats} />}</div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Roadmap Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Long Description */}
            {roadmap.longDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{roadmap.longDescription}</p>
                </CardContent>
              </Card>
            )}

            {/* Roadmap Nodes */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nodes.map((node) => (
                    <NodeCard
                      key={node._id}
                      node={node}
                      nodeProgress={getNodeProgress(node._id)}
                      roadmapId={roadmapId}
                      isAuthenticated={isAuthenticated}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {roadmap.reviews && roadmap.reviews.length > 0 && <ReviewsSection reviews={roadmap.reviews} />}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <RoadmapInfo roadmap={roadmap} />

            {/* Progress Stats */}
            {userProgress?.stats && <ProgressStatsCard stats={userProgress.stats} />}

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full" onClick={startProgress} disabled={isLoading}>
                  {userProgress && userProgress.stats.completedNodes > 0 ? "Continue Learning" : "Start Learning"}
                </Button>

                {!isBookmarked ? (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setIsBookmarkModalOpen(true)}
                    disabled={isBookmarkMutating}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Add to Bookmarks
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-red-500 border-red-500/40 hover:text-red-400"
                    onClick={() => setIsRemoveConfirmOpen(true)}
                    disabled={isBookmarkMutating}
                  >
                    <BookmarkMinus className="mr-2 h-4 w-4" />
                    Remove Bookmark
                  </Button>
                )}

                <Button variant="outline" className="w-full bg-transparent">
                  Share Roadmap
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to bookmarks</DialogTitle>
            <DialogDescription>
              Provide optional details before saving this roadmap to your bookmarks.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="frontend, react, career"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Why this roadmap is useful or how you'll approach it..."
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
            <Button onClick={handleAddBookmark} disabled={isBookmarkMutating || !roadmapId}>
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This roadmap will be removed from your bookmarks. You can add it again anytime.
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
  )
}
