
import { Badge } from "@/components/ui/badge"
import { Star, Eye } from "lucide-react"
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

  if (loading) return <p className="text-muted-foreground text-sm">Loading bookmarks...</p>

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm">No bookmarked roadmaps yet.</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-1">
      <h2 className="text-xl font-semibold text-foreground mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Bookmarked Roadmaps</h2>
      {bookmarks.map((bookmark) => {
        const roadmap: any = typeof bookmark.roadmap === "string" ? { _id: bookmark.roadmap } : bookmark.roadmap
        return (
          <Link
            key={bookmark._id}
            to={`/details/${roadmap._id}`}
            className="block hover:bg-foreground/[0.04] rounded-xl p-4 transition-colors group"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-foreground group-hover:text-orange-400 transition-colors">{roadmap.title || "Untitled Roadmap"}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{roadmap.description || ""}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize text-xs">{roadmap.category || "other"}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{roadmap.difficulty || "unknown"}</Badge>
                  {bookmark.isFavorite && <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs">Favorite</Badge>}
                </div>
                {bookmark.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">"{bookmark.notes}"</p>}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1 md:mt-0 flex-shrink-0">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{roadmap.stats?.views ?? 0}</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" />{(roadmap.stats?.averageRating ?? 0).toFixed(1)}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
