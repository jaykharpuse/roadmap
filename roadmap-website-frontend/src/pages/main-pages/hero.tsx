import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Network, Edit3, Download, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

export default function HeroSection() {
  const [searchValue, setSearchValue] = useState("")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden bg-background">

      {/* ── Ambient Background Glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-orange-500/[0.07] blur-[130px] animate-pulse-glow-orange" />
        <div className="absolute top-[20%] -right-[15%] w-[550px] h-[550px] rounded-full bg-violet-600/[0.06] blur-[110px] animate-pulse-glow-violet" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[450px] h-[450px] rounded-full bg-rose-500/[0.05] blur-[100px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-5 md:px-8 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-orange-300 border border-orange-500/30 bg-orange-500/[0.08] shadow-inner">
            <Sparkles className="w-3 h-3" />
            Free · No Sign-up Required to Browse
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Generate Your
          <br />
          <span className="text-gradient-brand">Learning Roadmap.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={item}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Create structured learning paths for any topic. Explore curated roadmaps,
          access free resources, and track your progress — all in one place.
        </motion.p>

        {/* Search bar */}
        <motion.div variants={item} className="relative max-w-2xl mx-auto mb-8">
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-orange-500/40 via-rose-500/40 to-violet-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative flex items-center">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search a topic — e.g. 'React Developer', 'DevOps'..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsSearchModalOpen(true)}
                className="w-full h-14 pl-14 pr-5 text-base glass border-border text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 transition-all duration-300"
              />
            </div>
          </div>

          <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
            <DialogContent className="max-w-xl bg-[#111116] border border-white/[0.09] text-white">
              <DialogHeader>
                <DialogTitle className="text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Search Roadmaps</DialogTitle>
                <DialogDescription className="text-white/50">Enter keywords to find matching roadmaps.</DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <Input
                  autoFocus
                  placeholder="React, Python, Machine Learning..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsSearchModalOpen(false)
                      navigate(`/roadmaps?q=${encodeURIComponent(searchValue)}`)
                    }
                  }}
                  className="w-full h-12 bg-white/[0.05] border-white/[0.09] text-white placeholder:text-white/30 rounded-lg"
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      setIsSearchModalOpen(false)
                      navigate(`/roadmaps?q=${encodeURIComponent(searchValue)}`)
                    }}
                    className="bg-gradient-to-r from-orange-500 to-rose-600 text-white border-0 shadow-lg shadow-orange-500/20 hover:opacity-90"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/generate-roadmap')}
            className="group flex items-center gap-2 h-13 px-7 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Generate Your Roadmap
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/roadmaps")}
            className="flex items-center gap-2 h-13 px-7 py-3.5 text-base font-semibold rounded-xl glass border-border text-foreground hover:bg-foreground/[0.08] transition-all duration-300"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Browse Roadmaps
          </motion.button>
        </motion.div>

        {/* Trust pills */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          {[
            "No credit card required",
            "100+ curated roadmaps",
            "Free resources included",
          ].map((text, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400/70" />
              {text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Feature Cards ── */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-5 md:px-8 mt-24 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {[
          {
            icon: Network,
            title: "Ready-Made",
            description: "Access pre-built roadmaps for popular topics",
            action: () => navigate("/roadmaps"),
          },
          {
            icon: Edit3,
            title: "AI-Customizable",
            description: "Generate a custom roadmap for any topic with AI",
            action: () => navigate("/generate-roadmap"),
          },
          {
            icon: Download,
            title: "Download & Share",
            description: "Export to PDF and share with your team",
            action: () => navigate("/roadmaps"),
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={feature.action}
            className="glass card-gradient-border rounded-2xl p-6 cursor-pointer group transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-violet-500/20 border border-border flex items-center justify-center mb-4 group-hover:from-orange-500/30 group-hover:to-violet-500/30 transition-colors duration-300">
              <feature.icon className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
