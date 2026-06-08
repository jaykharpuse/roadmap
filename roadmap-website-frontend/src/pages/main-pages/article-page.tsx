"use client"

import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Tag } from "lucide-react"
import { getArticleBySlug } from "@/data/articles"
import { useEffect } from "react"

const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  orange: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "bg-orange-500/[0.06]" },
  violet: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "bg-violet-500/[0.06]" },
  rose:   { text: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20",   glow: "bg-rose-500/[0.06]"   },
  blue:   { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   glow: "bg-blue-500/[0.06]"   },
  amber:  { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  glow: "bg-amber-500/[0.06]"  },
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const article = slug ? getArticleBySlug(slug) : undefined

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Article not found.</p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>
      </div>
    )
  }

  const colors = colorMap[article.color] ?? colorMap.orange

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full ${colors.glow} blur-[140px]`} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-28">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
              <Tag className="w-3 h-3" />
              {article.tag}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {article.title}
          </h1>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="origin-left h-px bg-gradient-to-r from-border via-border/50 to-transparent mb-12"
        />

        {/* Sections */}
        <div className="space-y-10">
          {article.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
            >
              <h2
                className={`text-lg md:text-xl font-semibold mb-3 ${colors.text}`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {section.heading}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                {section.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 glass rounded-2xl p-8 text-center"
        >
          <p className="text-muted-foreground text-sm mb-4">
            Ready to put this into practice?
          </p>
          <button
            onClick={() => navigate("/roadmaps")}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity duration-200"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Explore Roadmaps
          </button>
        </motion.div>
      </div>
    </div>
  )
}
