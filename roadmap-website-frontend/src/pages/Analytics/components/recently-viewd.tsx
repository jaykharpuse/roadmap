import { Card } from "@/components/ui/card"
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
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-6 text-white">Recently Viewed</h2>

      {loading && <div className="text-slate-400">Loading...</div>}

      {!loading && items && items.length === 0 && (
        <div className="text-slate-400">No recently viewed roadmaps.</div>
      )}

      {!loading && items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((it) => (
            <Link key={it._id} to={`/details/${it.roadmap._id}`} className="flex items-center gap-3 hover:bg-slate-700/30 rounded-md p-2">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-medium text-white">{it.roadmap.title}</div>
                <div className="text-sm text-slate-400">{it.roadmap.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
