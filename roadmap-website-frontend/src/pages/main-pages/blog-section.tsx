"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, CheckCircle, FileText, Code, ArrowUpRight } from "lucide-react"

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const blogPosts = [
  { title: "How to Plan Your Learning Journey", icon: TrendingUp, tag: "Strategy", color: "orange" },
  { title: "Top Tools for Building Roadmaps", icon: Code, tag: "Tools", color: "violet" },
  { title: "Roadmap Case Studies", icon: CheckCircle, tag: "Case Study", color: "rose" },
  { title: "Industry-Specific Roadmap Guides", icon: FileText, tag: "Guide", color: "blue" },
  { title: "Building a Learning Community", icon: Users, tag: "Community", color: "amber" },
]

const colorMap: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  orange: { bg: "from-orange-500/25 to-orange-600/10", text: "text-orange-400", glow: "bg-orange-500/10", border: "border-orange-500/20" },
  violet: { bg: "from-violet-500/25 to-violet-600/10", text: "text-violet-400", glow: "bg-violet-500/10", border: "border-violet-500/20" },
  rose:   { bg: "from-rose-500/25 to-rose-600/10",     text: "text-rose-400",   glow: "bg-rose-500/10",   border: "border-rose-500/20" },
  blue:   { bg: "from-blue-500/25 to-blue-600/10",     text: "text-blue-400",   glow: "bg-blue-500/10",   border: "border-blue-500/20" },
  amber:  { bg: "from-amber-500/25 to-amber-600/10",   text: "text-amber-400",  glow: "bg-amber-500/10",  border: "border-amber-500/20" },
}

export default function BlogSection() {
  return (
    <section className="relative bg-background py-28 px-5 md:px-8 overflow-hidden">

      {/* Divider line top */}
      <div className="gradient-line w-full max-w-7xl mx-auto mb-20" />

      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-rose-600/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-rose-400/70 mb-3">
              From the Blog
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Insights for{" "}
              <span className="text-gradient-brand">motivated learners.</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs md:text-right leading-relaxed">
            Guides, case studies, and resources to level up your learning strategy.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          {blogPosts.map((post, index) => {
            const colors = colorMap[post.color]
            return (
              <motion.article
                key={index}
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group glass card-gradient-border rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Thumbnail */}
                <div className={`relative h-44 bg-gradient-to-br ${colors.bg} overflow-hidden`}>
                  {/* Animated BG decoration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="relative"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                    >
                      <div className={`w-20 h-20 rounded-2xl ${colors.glow} border ${colors.border} backdrop-blur-sm flex items-center justify-center shadow-2xl`}>
                        <post.icon className={`w-10 h-10 ${colors.text}`} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Tag chip */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${colors.glow} ${colors.text} border ${colors.border}`}>
                      {post.tag}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h3
                    className="text-base font-semibold text-foreground leading-snug transition-colors mb-4"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {post.title}
                  </h3>

                  <div className={`flex items-center gap-1 text-xs font-medium ${colors.text} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                    <span>Read article</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
