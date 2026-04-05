"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import jsPDF from "jspdf"

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
  Share2,
  Download,
  CheckCircle2,
  Circle,
  FileDown,
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

const getSafeInitial = (value?: string) => {
  if (!value || typeof value !== "string" || value.trim().length === 0) return "U"
  return value.trim().charAt(0).toUpperCase()
}

const formatSafeDate = (value?: string | Date) => {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()
}

const formatDurationLabel = (
  duration?: { value?: number; unit?: string } | null,
  fallbackText = "Self-paced",
) => {
  if (!duration || duration.value === undefined || duration.value === null) return fallbackText
  return `${duration.value} ${duration.unit || "weeks"}`
}

const normalizeResourceUrl = (url?: string) => {
  if (!url || typeof url !== "string") return "#"
  const trimmed = url.trim()
  if (!trimmed) return "#"
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return "#"
}

// Components
const RoadmapHeader = ({ roadmap }: { roadmap: RoadmapDetails | null }) => {
  if (!roadmap) return null
  return (
    <div className="relative">
      <div className="h-64 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg overflow-hidden">
        {roadmap.coverImage && (
          <img
            src={roadmap.coverImage.url || ""}
            alt={roadmap.title || "Roadmap"}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-2 mb-3">
          {roadmap.category && (
            <Badge variant="secondary" className="capitalize">
              {roadmap.category}
            </Badge>
          )}
          {roadmap.isFeatured && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Featured</Badge>
          )}
          {roadmap.difficulty && (
            <Badge className={`border ${getDifficultyColor(roadmap.difficulty)} capitalize`}>{roadmap.difficulty}</Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">{roadmap.title || "Untitled Roadmap"}</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">{roadmap.description || ""}</p>
      </div>
    </div>
  )
}

const StatsCard = ({ stats }: { stats: RoadmapStats | null | undefined }) => {
  if (!stats) return null
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{(stats.views ?? 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Views</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{(stats.completions ?? 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Completions</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{(stats.averageRating ?? 0).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{(stats.ratingsCount ?? 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Reviews</div>
          </div>
      </div>
    </CardContent>
  </Card>
  )
}

const ProgressStatsCard = ({ stats }: { stats: IUserProgressStatsResponse | null | undefined }) => {
  if (!stats) return null
  const completedNodes = stats.completedNodes ?? 0
  const totalNodes = stats.totalNodes ?? 0
  const completedResources = stats.completedResources ?? 0
  const totalResources = stats.totalResources ?? 0
  const completionPercentage = stats.completionPercentage ?? 0
  const inProgressNodes =
    ("inProgressNodes" in stats ? (stats as { inProgressNodes?: number }).inProgressNodes : 0) ?? 0
  const skippedNodes =
    ("skippedNodes" in stats ? (stats as { skippedNodes?: number }).skippedNodes : 0) ?? 0

  // Calculate progress circle values
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Circular Progress */}
        <div className="flex justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className="text-primary transition-all duration-500"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{completionPercentage}%</span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Topics Completed
              </span>
              <span className="text-foreground font-medium">
                {completedNodes} / {totalNodes}
              </span>
            </div>
            <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Resources Completed
              </span>
              <span className="text-foreground font-medium">
                {completedResources} / {totalResources}
              </span>
            </div>
            <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${totalResources > 0 ? (completedResources / totalResources) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-lg font-bold text-green-400">{completedNodes}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
            <div className="flex justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-blue-400">{inProgressNodes}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-center">
            <div className="flex justify-center mb-1">
              <Circle className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-lg font-bold text-orange-400">{totalNodes - completedNodes - inProgressNodes - skippedNodes}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center py-2 px-3 bg-primary/5 rounded-lg border border-primary/10">
          {completionPercentage === 0 && (
            <p className="text-sm text-muted-foreground">🚀 Ready to start your learning journey?</p>
          )}
          {completionPercentage > 0 && completionPercentage < 25 && (
            <p className="text-sm text-muted-foreground">🌱 Great start! Keep going!</p>
          )}
          {completionPercentage >= 25 && completionPercentage < 50 && (
            <p className="text-sm text-muted-foreground">💪 You're making solid progress!</p>
          )}
          {completionPercentage >= 50 && completionPercentage < 75 && (
            <p className="text-sm text-muted-foreground">🔥 Halfway there! Amazing work!</p>
          )}
          {completionPercentage >= 75 && completionPercentage < 100 && (
            <p className="text-sm text-muted-foreground">⭐ Almost done! Final stretch!</p>
          )}
          {completionPercentage === 100 && (
            <p className="text-sm text-muted-foreground">🏆 Congratulations! You've mastered this roadmap!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const NodeCard = ({
  node,
  nodeProgress,
  getNodeProgressById,
  depth = 0,
  roadmapId,
  isAuthenticated,
  navigate,
}: {
  node: RoadmapNode
  nodeProgress?: INodeProgressResponse
  getNodeProgressById?: (nodeId: string) => INodeProgressResponse | undefined
  depth?: number
  roadmapId?: string
  isAuthenticated?: boolean
  navigate?: (path: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1) // Auto-expand first level
  const [isHovered, setIsHovered] = useState(false)
  const currentStatus = nodeProgress?.status || "not_started"
  const dispatch = useAppDispatch()
  const hasChildren = node.children && node.children.length > 0
  const hasResources = node.resources && node.resources.length > 0

  const handleProgressChange = (status: ProgressStatus) => {
    if (!isAuthenticated) {
      toast.error("Please login to track your progress")
      navigate?.("/login")
      return
    }
    dispatch(updateUserProgress({ roadmapId: roadmapId ?? "", nodeId: node._id, status }))
      .unwrap()
      .then(() => {
        toast.success("Progress updated!")
      })
      .catch(() => {
        toast.error("Failed to update progress")
      })
  }

  const getStatusColor = () => {
    switch (currentStatus) {
      case "completed":
        return "border-l-green-500 bg-green-500/5"
      case "in_progress":
        return "border-l-blue-500 bg-blue-500/5"
      case "skipped":
        return "border-l-yellow-500 bg-yellow-500/5"
      default:
        return "border-l-gray-500"
    }
  }

  const handleNodeClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div style={{ marginLeft: `${Math.min(depth * 16, 64)}px` }}>
      <Card 
        className={`mb-3 border-l-4 transition-all duration-200 cursor-pointer hover:shadow-md ${getStatusColor()} ${isHovered ? 'ring-1 ring-primary/30' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleNodeClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Expand/Collapse Button */}
                {hasChildren && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                    className="p-1 h-7 w-7 rounded-full hover:bg-primary/10"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}

                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full ${
                  currentStatus === "completed" ? "bg-green-500" : 
                  currentStatus === "in_progress" ? "bg-blue-500 animate-pulse" : 
                  "bg-gray-400"
                }`} />

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground truncate">{node.title}</h3>

                {/* Badges */}
                {node.nodeType && (
                  <Badge variant="outline" className="capitalize text-xs shrink-0">
                    {node.nodeType}
                  </Badge>
                )}

                {node.isOptional && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Optional
                  </Badge>
                )}
              </div>

              {/* Description */}
              {node.description && (
                <p className="text-sm text-muted-foreground mb-3 ml-6 line-clamp-2">{node.description}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm ml-6">
                {node.estimatedDuration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{formatDurationLabel(node.estimatedDuration, "Self-paced")}</span>
                  </div>
                )}

                {node.metadata?.difficulty && (
                  <Badge className={`border text-xs ${getDifficultyColor(node.metadata.difficulty)}`}>
                    {node.metadata.difficulty}
                  </Badge>
                )}

                {node.metadata?.importance && node.metadata.importance !== "medium" && (
                  <div className={`flex items-center gap-1 text-xs ${getImportanceColor(node.metadata.importance)}`}>
                    <AlertCircle className="h-3 w-3" />
                    {node.metadata.importance}
                  </div>
                )}

                {hasChildren && (
                  <span className="text-xs text-muted-foreground">
                    {node.children?.length} subtopic{node.children?.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Resources - Always show when available */}
              {hasResources && (
                <div className="mt-3 ml-6" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Resources ({node.resources?.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {node.resources?.slice(0, 4).map((resource) => (
                      <a
                        key={resource._id}
                        href={normalizeResourceUrl(resource.url || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getResourceIcon(resource.type || resource.resourceType || "other")}
                        <span className="max-w-[150px] truncate">{resource.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    ))}
                    {node.resources && node.resources.length > 4 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{node.resources.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Selector */}
            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <ProgressSelector currentStatus={currentStatus} onStatusChange={handleProgressChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children - Animated */}
      {isExpanded && hasChildren && (
        <div className="ml-4 pl-4 border-l-2 border-dashed border-muted-foreground/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {node.children?.map((child) => (
            <NodeCard
              key={child._id}
              node={child}
              nodeProgress={getNodeProgressById?.(child._id)}
              getNodeProgressById={getNodeProgressById}
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
            Estimated Duration: {formatDurationLabel(roadmap.estimatedDuration, "Self-paced")}
          </span>
        </div>
      )}

      {roadmap.contributor && (
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-primary" />
          <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={roadmap.contributor.avatar || ""} />
                <AvatarFallback>{getSafeInitial(roadmap.contributor.username)}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">Created by {roadmap.contributor.username}</span>
            </div>
          </div>
        )}

      {roadmap.lastUpdated && (
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            Last updated: {formatSafeDate(roadmap.lastUpdated)}
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
                <AvatarImage src={review.user?.avatar || ""} />
                <AvatarFallback>{getSafeInitial(review.user?.username)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{review.user?.username || "Anonymous"}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{formatSafeDate(review.createdAt as any)}</span>
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
      .unwrap()
      .then(() => {
        axiosInstance.post('/api/recently-viewed', { roadmapId }).catch(() => {})
        if (isAuthenticated) {
          dispatch(fetchUserProgress(roadmapId)).catch(() => {})
        }
      })
      .catch(() => toast.error("Failed to fetch roadmap details"))
  }, [roadmapId, dispatch, isAuthenticated])

  useEffect(() => {
    socket.on("progressUpdated", ({ roadmapId: id, nodeId, status }) => {
      console.log("this is a socket event ", roadmapId, nodeId, status)
      if (id === roadmapId) {
        setUserProgress((prev) => {
          if (!prev) return prev

          return {
            ...prev,
            nodes: prev.nodes.map((node) => {
              const currentNodeId = typeof node.node === "string" ? node.node : node.node?._id
              return currentNodeId === nodeId ? { ...node, status } : node
            }),
          }
        })
      }
    })

    // cleanup socket listener on unmount
    return () => {
      socket.off("progressUpdated")
    }
  }, [roadmapId])

  // Keep memoized progress map and accessor as hooks at top-level
  

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

  // Share roadmap handler
  const handleShareRoadmap = async () => {
    const roadmapTitle =
      (RoadmapDetails && "roadmap" in RoadmapDetails ? RoadmapDetails.roadmap?.title : RoadmapDetails?.title) ||
      "Roadmap";
    const shareUrl = window.location.href;
    const shareData = {
      title: roadmapTitle,
      text: `Check out this learning roadmap: ${roadmapTitle}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled or share failed
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to share");
      }
    }
  };

  // Generate PDF from roadmap data
  const generatePDFRoadmap = (roadmapData: any, allNodes: any[]) => {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const maxWidth = 180;

    // Helper to add new page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(41, 128, 185);
    pdf.text(roadmapData.title || "Learning Roadmap", margin, yPosition);
    yPosition += 12;

    // Category & Difficulty badges
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const metaText = `${roadmapData.category || 'General'} | ${roadmapData.difficulty || 'Beginner'}`;
    pdf.text(metaText, margin, yPosition);
    yPosition += 8;

    // Duration
    if (roadmapData.estimatedDuration?.value) {
      pdf.text(`Duration: ${roadmapData.estimatedDuration.value} ${roadmapData.estimatedDuration.unit || 'weeks'}`, margin, yPosition);
      yPosition += 8;
    }

    // Description
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    if (roadmapData.description) {
      const descLines = pdf.splitTextToSize(roadmapData.description, maxWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += (descLines.length * 5) + 10;
    }

    // Divider
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, 195, yPosition);
    yPosition += 10;

    // Learning Path Header
    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.text("Learning Path", margin, yPosition);
    yPosition += 12;

    // Process nodes recursively
    const processNodes = (nodeList: any[], depth: number = 0) => {
      nodeList.forEach((node: any, index: number) => {
        checkPageBreak(35);
        
        const indent = margin + (depth * 10);
        const nodeNum = depth === 0 ? `${index + 1}.` : `•`;

        // Node title
        pdf.setFontSize(depth === 0 ? 13 : 11);
        pdf.setTextColor(depth === 0 ? 41 : 80, depth === 0 ? 128 : 80, depth === 0 ? 185 : 80);
        pdf.text(`${nodeNum} ${node.title || 'Untitled'}`, indent, yPosition);
        yPosition += 6;

        // Node description
        if (node.description) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          const nodeLines = pdf.splitTextToSize(node.description, maxWidth - indent);
          pdf.text(nodeLines, indent + 5, yPosition);
          yPosition += (nodeLines.length * 4) + 3;
        }

        // Duration if available
        if (node.estimatedDuration?.value) {
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text(`Duration: ${node.estimatedDuration.value} ${node.estimatedDuration.unit || 'days'}`, indent + 5, yPosition);
          yPosition += 5;
        }

        // Resources
        const resources = node.resources || [];
        if (resources.length > 0) {
          checkPageBreak(resources.length * 5 + 5);
          pdf.setFontSize(9);
          pdf.setTextColor(46, 134, 193);
          pdf.text("Resources:", indent + 5, yPosition);
          yPosition += 4;

          resources.slice(0, 5).forEach((resource: any) => {
            checkPageBreak(5);
            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 80);
            const resourceTitle = resource.title || 'Resource';
            const resourceUrl = resource.url || '';
            pdf.text(`- ${resourceTitle}`, indent + 10, yPosition);
            yPosition += 3;
            if (resourceUrl) {
              pdf.setTextColor(100, 149, 237);
              try {
                pdf.textWithLink(resourceUrl.substring(0, 60) + (resourceUrl.length > 60 ? '...' : ''), indent + 15, yPosition, { url: resourceUrl });
              } catch {
                pdf.text(resourceUrl.substring(0, 60) + (resourceUrl.length > 60 ? '...' : ''), indent + 15, yPosition);
              }
              yPosition += 4;
            }
          });
          yPosition += 3;
        }

        yPosition += 4;

        // Process children
        if (node.children && node.children.length > 0) {
          processNodes(node.children, depth + 1);
        }
      });
    };

    processNodes(allNodes);

    // Footer
    checkPageBreak(20);
    yPosition = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${new Date().toLocaleDateString()} | Roadmap Learning Platform`, margin, yPosition);

    return pdf;
  };

  // Download roadmap as PDF or JSON
  const handleDownloadRoadmap = (format: "pdf" | "json" = "pdf") => {
    if (!RoadmapDetails) {
      toast.error("No roadmap data available");
      return;
    }

    const roadmap = (RoadmapDetails as any)?.roadmap || RoadmapDetails;
    const allNodes = (RoadmapDetails as any)?.nodes || [];
    const roadmapData = {
      _id: roadmap?._id,
      title: roadmap?.title,
      description: roadmap?.description,
      longDescription: roadmap?.longDescription,
      category: roadmap?.category,
      difficulty: roadmap?.difficulty,
      estimatedDuration: roadmap?.estimatedDuration,
      tags: roadmap?.tags || [],
      prerequisites: roadmap?.prerequisites || [],
      nodes: allNodes,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.1",
    };

    const filename = (roadmapData.title || 'roadmap').replace(/\s+/g, '-').toLowerCase();

    if (format === "pdf") {
      try {
        const pdf = generatePDFRoadmap(roadmapData, allNodes);
        pdf.save(`${filename}.pdf`);
        toast.success("📄 Roadmap downloaded as PDF!");
      } catch (error) {
        console.error("PDF generation error:", error);
        toast.error("Failed to generate PDF. Downloading as JSON instead.");
        handleDownloadRoadmap("json");
      }
    } else {
      const blob = new Blob([JSON.stringify(roadmapData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("📁 Roadmap downloaded as JSON!");
    }
  };

  // 👉 Now conditionally render after all hooks
  if (!RoadmapDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading roadmap details...</p>
        </div>
      </div>
    )
  }

  // Handle both structures: direct roadmap or nested { roadmap, nodes }
  const nodes = RoadmapDetails.nodes || []
  const roadmap =
    RoadmapDetails && "roadmap" in RoadmapDetails ? RoadmapDetails.roadmap : RoadmapDetails

  // Validate we have minimum required data
  if (!roadmap?._id && !roadmap?.title) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Roadmap data not available</p>
          <Button onClick={() => navigate('/roadmaps')} variant="outline">
            Browse Roadmaps
          </Button>
        </div>
      </div>
    )
  }

  const progressMap = useMemo(() => {
    const map = new Map<string, INodeProgressResponse>()
    userProgress?.nodes?.forEach((entry: any) => {
      const id = typeof entry.node === "string" ? entry.node : entry.node?._id
      if (id) map.set(id, entry)
    })
    return map
  }, [userProgress])

  const getNodeProgress = (nodeId: string): INodeProgressResponse | undefined => {
    return progressMap.get(nodeId)
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
                      getNodeProgressById={getNodeProgress}
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
                  {(userProgress?.stats?.completedNodes ?? 0) > 0 ? "Continue Learning" : "Start Learning"}
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

                <Button 
                  variant="outline" 
                  className="w-full bg-transparent hover:bg-primary/10"
                  onClick={handleShareRoadmap}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Roadmap
                </Button>

                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent hover:bg-primary/10"
                    onClick={() => handleDownloadRoadmap("pdf")}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent hover:bg-primary/10"
                    onClick={() => handleDownloadRoadmap("json")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </div>
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
