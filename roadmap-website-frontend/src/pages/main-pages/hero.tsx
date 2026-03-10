
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Network, Edit3, Download } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function HeroSection() {
  const [searchValue, setSearchValue] = useState("")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        className="max-w-4xl mx-auto text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          variants={itemVariants}
        >
          Generate a Roadmap
          <br />
          <span className="text-[#60A5FA]">for Any Topic</span>
        </motion.h1>

        <motion.p className="text-xl md:text-2xl text-[#E2E8F0] max-w-2xl mx-auto" variants={itemVariants}>
          Create and explore detailed roadmaps for your chosen subject.
        </motion.p>

        <motion.div className="relative max-w-2xl mx-auto" variants={itemVariants}>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search a topic..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchModalOpen(true)}
              className="w-full h-16 pl-6 pr-16 text-lg bg-[#1E293B] border-[#0F172A] text-white placeholder:text-[#E2E8F0]/60 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-300"
            />
            <motion.button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-[#60A5FA] hover:text-[#3B82F6] transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchModalOpen(true)}
            >
              <Search className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Modal search dialog */}
          <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Search Roadmaps</DialogTitle>
                <DialogDescription>Enter keywords to find matching roadmaps.</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <Input
                  autoFocus
                  placeholder="Search roadmaps, tags, or descriptions..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsSearchModalOpen(false)
                      navigate(`/roadmaps?q=${encodeURIComponent(searchValue)}`)
                    }
                  }}
                  className="w-full h-14 pl-4 text-lg bg-[#0F172A] text-white rounded-md"
                />

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      setIsSearchModalOpen(false)
                      navigate(`/roadmaps?q=${encodeURIComponent(searchValue)}`)
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
            onClick={()=>{
            navigate('/generate-roadmap')
            }}
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Generate Your Roadmap
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={()=>navigate("/roadmaps")}
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg font-semibold bg-transparent border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white rounded-xl transition-all duration-300"
            >
              Browse Roadmaps
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: Network,
            title: "Ready-Made",
            description: "Access pre-built roadmaps for various topics",
          },
          {
            icon: Edit3,
            title: "Customizable",
            description: "Build your own roadmap with our easy-to-use editor",
          },
          {
            icon: Download,
            title: "Download & Share",
            description: "Export your roadmaps to PDF and share them with others",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="text-center space-y-4"
            variants={featureVariants}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto bg-[#1E293B] rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <feature.icon className="w-8 h-8 text-[#60A5FA]" />
            </motion.div>
            <h3 className="text-xl font-semibold text-[#60A5FA]">{feature.title}</h3>
            <p className="text-[#E2E8F0] leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
