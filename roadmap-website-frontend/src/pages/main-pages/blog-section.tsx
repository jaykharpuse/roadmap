"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, CheckCircle, FileText, Code } from "lucide-react"

export default function BlogSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const blogPosts = [
    {
      title: "How to Plan Your Learning Journey",
      icon: TrendingUp,
      illustration: "learning-journey",
    },
    {
      title: "Top Tools for Building Roadmaps",
      icon: Code,
      illustration: "roadmap-tools",
    },
    {
      title: "Roadmap Case Studies",
      icon: CheckCircle,
      illustration: "case-studies",
    },
    {
      title: "Industry-specific Roadmap Guides",
      icon: FileText,
      illustration: "industry-guides",
    },
    {
      title: "Industry-specific Roadmap Guides",
      icon: Users,
      illustration: "industry-guides-2",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Blog</h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              className={`
                bg-[#1E293B] rounded-2xl overflow-hidden border border-[#0F172A] 
                hover:border-[#3B82F6] transition-all duration-500 group cursor-pointer
                ${index === 4 ? "md:col-span-2 lg:col-span-1" : ""}
              `}
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-48 bg-[#0F172A] overflow-hidden">
                {/* Animated illustration */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Main illustration element */}
                    <div className="w-24 h-24 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center relative">
                      <post.icon className="w-12 h-12 text-white" />

                      {/* Floating elements */}
                      <motion.div
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#60A5FA] rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: 0.5,
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#60A5FA] rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: 1,
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-[#60A5FA] rounded-full"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.3,
                      }}
                      style={{
                        left: `${20 + (i % 3) * 30}%`,
                        top: `${20 + Math.floor(i / 3) * 40}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white group-hover:text-[#60A5FA] transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>

                <motion.div
                  className="mt-4 w-12 h-1 bg-[#3B82F6] rounded-full"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
