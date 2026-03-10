
import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { getRoadmaps } from "@/state/slices/roadmapSlice"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Users,
  Eye,
  BookOpen,
  Code,
  Server,
  Smartphone,
  Database,
  Palette,
  BarChart3,
  Shield,
  Cloud,
  Coins,
  MoreHorizontal,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import type { IRoadmap } from "@/types/user/roadmap/roadmap.types"


// Category icons mapping
const categoryIcons = {
  frontend: Code,
  backend: Server,
  devops: Cloud,
  mobile: Smartphone,
  "data-science": Database,
  design: Palette,
  "product-management": BarChart3,
  cybersecurity: Shield,
  cloud: Cloud,
  blockchain: Coins,
  other: MoreHorizontal,
}

// Difficulty colors
const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30",
}

// Loading skeleton component
const RoadmapSkeleton = () => (
  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
    <CardHeader className="space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-3/4 bg-slate-700" />
        <Skeleton className="h-5 w-16 bg-slate-700" />
      </div>
      <Skeleton className="h-4 w-full bg-slate-700" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-slate-700" />
        <Skeleton className="h-4 w-20 bg-slate-700" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-16 bg-slate-700" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 bg-slate-700" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12 bg-slate-700" />
          <Skeleton className="h-4 w-12 bg-slate-700" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Road-themed loading animation
const RoadLoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6">
    <div className="relative">
      {/* Road */}
      <div className="w-64 h-4 bg-slate-700 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/40 to-blue-500/20 animate-pulse" />
        {/* Road lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-500 transform -translate-y-1/2">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-300 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Moving car */}
      <div className="absolute -top-2 left-0 w-6 h-4 bg-blue-500 rounded-sm animate-bounce">
        <div className="absolute -top-1 left-1 w-4 h-2 bg-blue-400 rounded-sm" />
        <div className="absolute -bottom-1 left-0 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute -bottom-1 right-0 w-1.5 h-1.5 bg-slate-800 rounded-full" />
      </div>
    </div>

    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-slate-200">Loading Roadmaps</h3>
      <p className="text-sm text-slate-400">Mapping your learning journey...</p>
    </div>
  </div>
)

const Roadmaps: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const [page, setPage] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  const { roadmaps, isLoading, paginationMeta } = useAppSelector((state) => state.roadmap)

  const location = useLocation();

  // Initialize searchTerm from query param 'q'
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q") || ""
    if (q !== searchTerm) {
      setSearchTerm(q)
      setPage(1)
    }
  }, [location.search])

  // Filter and sort roadmaps
  const filteredAndSortedRoadmaps = useMemo(() => {
    const filtered = roadmaps.filter((roadmap: IRoadmap) => {
      const matchesSearch =
        roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roadmap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roadmap.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || roadmap.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "all" || roadmap.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })

    // Sort roadmaps
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        break
      case "popular":
        filtered.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
        break
      case "rating":
        filtered.sort((a, b) => (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0))
        break
      default:
        break
    }

    return filtered
  }, [roadmaps, searchTerm, selectedCategory, selectedDifficulty, sortBy])

  useEffect(() => {
    document.title = "Roadmaps"
    dispatch(getRoadmaps(page))
      .unwrap()
      .then(() => {
        // Success
      })
      .catch((error) => {
        console.error("Failed to fetch roadmaps:", error)
      })
  }, [dispatch, page])

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (paginationMeta && page < paginationMeta.totalPages) {
      setPage(page + 1)
    }
  }

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return "Duration not specified"
    return `${duration.value} ${duration.unit}`
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || MoreHorizontal
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-sky-400 mb-2">Trending Roadmaps</h1>
          <p className="text-slate-300">Discover curated learning paths to advance your skills</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search roadmaps, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-slate-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="product-management">Product Management</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="blockchain">Blockchain</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <RoadLoadingAnimation />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <RoadmapSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-slate-400">
                Showing {filteredAndSortedRoadmaps.length} of {roadmaps.length} roadmaps
              </p>
            </div>

            {/* Roadmaps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredAndSortedRoadmaps.map((roadmap: IRoadmap) => (
                <Card
                  key={roadmap._id}
                  onClick={()=>navigate(`/details/${roadmap._id}`)}
                  className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 group cursor-pointer"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                          {getCategoryIcon(roadmap.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-sky-400 group-hover:text-sky-300 transition-colors">
                            {roadmap.title}
                          </CardTitle>
                          {roadmap.isFeatured && (
                            <Badge className="mt-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      {roadmap.difficulty && (
                        <Badge className={`${difficultyColors[roadmap.difficulty]} capitalize`}>
                          {roadmap.difficulty}
                        </Badge>
                      )}
                    </div>

                    <CardDescription className="text-slate-300 line-clamp-2">{roadmap.description}</CardDescription>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(roadmap.estimatedDuration)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Tags */}
                    {roadmap.tags && roadmap.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {roadmap.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {roadmap.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                            +{roadmap.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{roadmap.contributor?.username}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{roadmap.stats?.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{roadmap.stats?.averageRating?.toFixed(1) || "0.0"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedRoadmaps.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No roadmaps found</h3>
                <p className="text-slate-400">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Page {page} of {paginationMeta.totalPages} ({paginationMeta.totalItems} total items)
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page <= 1}
                    className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700/50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= paginationMeta.totalPages}
                    className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700/50 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Roadmaps
