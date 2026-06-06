import { ArrowRight } from "lucide-react"
import axiosInstance from "@/helper/axiosInstance"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

interface RecentlyItem {
  _id: string
  roadmap: any
  viewedAt: string
}

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyItem[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    axiosInstance
      .get(`/api/recently-viewed`)
      .then((res) => {
        if (!mounted) return
        setItems(res.data)
      })
      .catch(() => {
        if (!mounted) return
        setItems([])
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Recently Viewed</h2>
      {loading && <div className="text-muted-foreground text-sm">Loading...</div>}
      {!loading && items && items.length === 0 && (
        <div className="text-muted-foreground text-sm">No recently viewed roadmaps.</div>
      )}
      {!loading && items && items.length > 0 && (
        <div className="space-y-1">
          {items.map((it) => (
            <Link key={it._id} to={`/details/${it.roadmap._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.04] group transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground group-hover:text-orange-400 transition-colors truncate">{it.roadmap.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{it.roadmap.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
