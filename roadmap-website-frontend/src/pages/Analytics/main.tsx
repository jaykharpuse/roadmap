import { CircularProgress } from "./components/circular-progress"
import { BookmarkedRoadmaps } from "./components/bookmarked-resources"
import { RecentlyViewed } from "./components/recently-viewd"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserRoadmapProgressForDashBoard } from "@/state/slices/userProgressSlice"
import { motion } from "framer-motion"
import { TrendingUp, BookOpen, ArrowRight } from "lucide-react"

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { userCourseProgress, loading } = useAppSelector((s) => s.userProgress)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Progress Dashboard — Tutoreez"
    dispatch(getUserRoadmapProgressForDashBoard()).unwrap().catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-500/[0.03] blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-400/70 mb-2">Your Journey</p>
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>
            Progress <span className="text-gradient-brand">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Track your learning progress across all roadmaps</p>
        </motion.div>

        {/* Progress Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                  <div className="w-32 h-32 rounded-full bg-foreground/[0.06] mx-auto mb-4" />
                  <div className="h-5 bg-foreground/[0.06] rounded w-2/3 mx-auto mb-3" />
                  <div className="h-9 bg-foreground/[0.06] rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {!loading && userCourseProgress?.length === 0 && (
            <div className="text-center py-16 glass rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No progress yet</h3>
              <p className="text-muted-foreground mb-5">Start a roadmap to track your learning journey</p>
              <button
                onClick={() => navigate("/roadmaps")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:opacity-90"
              >
                <BookOpen className="w-4 h-4" /> Browse Roadmaps
              </button>
            </div>
          )}

          {!loading && userCourseProgress && userCourseProgress.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {userCourseProgress.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="glass card-gradient-border rounded-2xl p-6 text-center group"
                >
                  <CircularProgress
                    percentage={course.percentage}
                    current={course.current}
                    total={course.total}
                  />
                  <h3 className="text-lg font-semibold text-foreground mt-4 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {course.title}
                  </h3>
                  <button
                    onClick={() => navigate(`/details/${course.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
                  >
                    Resume <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="lg:col-span-2">
            <BookmarkedRoadmaps />
          </div>
          <div>
            <RecentlyViewed />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
