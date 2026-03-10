import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Eye, Trophy } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { fetchBookmarks } from "@/state/slices/bookmarkSlice"
import { useAuth } from "@/contexts/authContext"

export function BookmarkedRoadmaps() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { bookmarks, loading } = useAppSelector((s) => s.bookmark)

  useEffect(() => {
    if (user) dispatch(fetchBookmarks())
  }, [user, dispatch])

  if (loading) return <p className="text-slate-400">Loading bookmarks...</p>

  if (!bookmarks || bookmarks.length === 0) {
    return <p className="text-slate-400">No bookmarked roadmaps yet.</p>
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-6 text-white">Bookmarked Roadmaps</h2>

      {bookmarks.map((bookmark) => {
        const roadmap: any = typeof bookmark.roadmap === "string" ? { _id: bookmark.roadmap } : bookmark.roadmap
        return (
          <Link
            key={bookmark._id}
            to={`/roadmaps/${roadmap.slug || roadmap._id}`}
            className="block hover:bg-slate-700/30 rounded-lg p-4 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              {/* Left Section */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white">{roadmap.title || "Untitled Roadmap"}</h3>
                <p className="text-sm text-slate-400">{roadmap.description || ""}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="capitalize">{roadmap.category || "other"}</Badge>
                  <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-200 border-slate-600 capitalize">
                    {roadmap.difficulty || "unknown"}
                  </Badge>
                  {bookmark.isFavorite && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      Favorite
                    </Badge>
                  )}
                </div>
                {bookmark.notes && (
                  <p className="text-sm text-slate-400 mt-1 italic">"{bookmark.notes}"</p>
                )}
              </div>

              {/* Right Section - Stats */}
              <div className="flex gap-4 mt-2 md:mt-0">
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Eye className="h-4 w-4 text-slate-400" /> <span className="text-slate-400">{roadmap.stats?.views ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Trophy className="h-4 w-4 text-slate-400" /> <span className="text-slate-400">{roadmap.stats?.completions ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Star className="h-4 w-4 text-slate-400" /> <span className="text-slate-400">{(roadmap.stats?.averageRating ?? 0).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Users className="h-4 w-4 text-slate-400" /> <span className="text-slate-400">{roadmap.stats?.ratingsCount ?? 0}</span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </Card>
  )
}
