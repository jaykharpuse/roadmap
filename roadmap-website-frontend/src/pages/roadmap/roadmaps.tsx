import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { getRoadmaps, getTrendingRoadmaps, seedRoadmaps } from "@/state/slices/roadmapSlice"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search, Filter, ChevronLeft, ChevronRight, Clock, Star, Eye, Code, Server,
  Smartphone, Database, Palette, BarChart3, Shield, Cloud, Coins, MoreHorizontal,
  Sparkles, Users,
} from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import type { IRoadmap } from "@/types/user/roadmap/roadmap.types"

const categoryIcons: Record<string, any> = {
  frontend: Code, backend: Server, "web-development": Code, devops: Cloud,
  mobile: Smartphone, "mobile-development": Smartphone, "data-science": Database,
  design: Palette, "product-management": BarChart3, cybersecurity: Shield,
  cloud: Cloud, blockchain: Coins, ai: Database, "machine-learning": Database,
  programming: Code, other: MoreHorizontal,
}

const difficultyConfig: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "Beginner",     cls: "bg-green-500/15 text-green-400 border-green-500/25" },
  intermediate: { label: "Intermediate", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
  advanced:     { label: "Advanced",     cls: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  expert:       { label: "Expert",       cls: "bg-red-500/15 text-red-400 border-red-500/25" },
}

const SkeletonCard = () => (
  <div className="glass rounded-2xl p-6 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-white/[0.08]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/[0.08] rounded w-3/4" />
        <div className="h-3 bg-white/[0.06] rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-white/[0.06] rounded" />
      <div className="h-3 bg-white/[0.06] rounded w-4/5" />
    </div>
    <div className="flex gap-2">
      {[1,2,3].map(i => <div key={i} className="h-5 w-14 bg-white/[0.06] rounded-full" />)}
    </div>
  </div>
)

const Roadmaps: React.FunctionComponent = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [seeded, setSeeded] = useState(false)

  const { roadmaps, trendingRoadmaps, isLoading, paginationMeta } = useAppSelector((s) => s.roadmap)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q") || ""
    if (q !== searchTerm) { setSearchTerm(q); setPage(1) }
  }, [location.search])

  useEffect(() => {
    document.title = "Roadmaps — RoadMapper"
    dispatch(getRoadmaps(page))
      .unwrap()
      .then((data) => {
        if ((!data?.roadmaps || data.roadmaps.length === 0) && !seeded) {
          setSeeded(true)
          dispatch(seedRoadmaps()).then(() => {
            dispatch(getTrendingRoadmaps())
            dispatch(getRoadmaps(1))
          })
        }
      })
      .catch(() => dispatch(getTrendingRoadmaps()))
    dispatch(getTrendingRoadmaps())
  }, [dispatch, page])

  const filtered = useMemo(() => {
    const source = roadmaps.length > 0 ? roadmaps : trendingRoadmaps
    const f = source.filter((r: IRoadmap) => {
      const q = searchTerm.toLowerCase()
      const matchSearch = r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q))
      return matchSearch &&
        (selectedCategory === "all" || r.category === selectedCategory) &&
        (selectedDifficulty === "all" || r.difficulty === selectedDifficulty)
    })
    switch (sortBy) {
      case "newest":  f.sort((a, b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()); break
      case "oldest":  f.sort((a, b) => new Date(a.createdAt||0).getTime() - new Date(b.createdAt||0).getTime()); break
      case "popular": f.sort((a, b) => (b.stats?.views||0) - (a.stats?.views||0)); break
      case "rating":  f.sort((a, b) => (b.stats?.averageRating||0) - (a.stats?.averageRating||0)); break
    }
    return f
  }, [roadmaps, trendingRoadmaps, searchTerm, selectedCategory, selectedDifficulty, sortBy])

  const formatDuration = (d?: { value?: number; unit?: string } | null) =>
    d?.value != null ? `${d.value} ${d.unit || "weeks"}` : "Self-paced"

  const getCategoryIcon = (cat: string) => {
    const Icon = categoryIcons[cat] || MoreHorizontal
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-400/70 mb-2">Explore</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Learning <span className="text-gradient-brand">Roadmaps</span>
          </h1>
          <p className="text-muted-foreground">Discover curated learning paths to advance your skills</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 flex flex-col lg:flex-row gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roadmaps, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-42 h-11 bg-card border-border text-foreground rounded-xl">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {["all","web-development","frontend","backend","mobile-development","data-science","ai","machine-learning","devops","cloud","programming","cybersecurity","design","blockchain","other"].map(v => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Categories" : v.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-36 h-11 bg-card border-border text-foreground rounded-xl">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {["all","beginner","intermediate","advanced","expert"].map(v => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Levels" : v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-11 bg-card border-border text-foreground rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              Showing <span className="text-foreground font-medium">{filtered.length}</span> roadmaps
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {filtered.map((roadmap: IRoadmap, idx) => (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  onClick={() => navigate(`/details/${roadmap._id}`)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass card-gradient-border rounded-2xl overflow-hidden cursor-pointer group"
                >
                  {roadmap.coverImage?.url && (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={roadmap.coverImage.url}
                        alt={roadmap.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-orange-500/[0.12] border border-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                          {getCategoryIcon(roadmap.category)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {roadmap.title}
                          </h3>
                          {roadmap.isFeatured && (
                            <span className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider">Featured</span>
                          )}
                        </div>
                      </div>
                      {roadmap.difficulty && (
                        <Badge className={`${difficultyConfig[roadmap.difficulty]?.cls} text-xs flex-shrink-0 capitalize border`}>
                          {roadmap.difficulty}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {roadmap.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(roadmap.estimatedDuration)}</span>
                    </div>

                    {roadmap.tags && roadmap.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {roadmap.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/[0.1] text-violet-400 border border-violet-500/20">
                            {tag}
                          </span>
                        ))}
                        {roadmap.tags.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-border/50 text-muted-foreground">
                            +{roadmap.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{roadmap.contributor?.username || "AI Generated"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{roadmap.stats?.views || 0}</span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{roadmap.stats?.averageRating?.toFixed(1) || "4.5"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty */}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No roadmaps found</h3>
                <p className="text-muted-foreground mb-6">Be the first to create an AI-powered roadmap</p>
                <button
                  onClick={() => navigate('/generate-roadmap')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4" /> Generate Roadmap
                </button>
              </div>
            )}

            {/* Pagination */}
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {paginationMeta.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => page > 1 && setPage(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl glass border border-border text-foreground hover:bg-foreground/[0.06] disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => page < paginationMeta.totalPages && setPage(page + 1)}
                    disabled={page >= paginationMeta.totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-orange-500 to-violet-600 text-white disabled:opacity-40 transition-opacity"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
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
