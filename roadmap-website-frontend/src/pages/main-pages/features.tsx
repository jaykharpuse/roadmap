import { motion } from "framer-motion";
import { Network, FileText, Plus, BookOpen, TrendingUp } from "lucide-react";

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const features = [
    {
      title: "Get Roadmap For Developer, Marketers, Students, Business",
      icon: Network,
    },
    {
      title: "Get Cheatsheets To Summarise Your Learning",
      icon: FileText,
    },
    {
      title: "Couldn't Find any roadmap on your topic? Create custom Roadmaps",
      icon: Plus,
    },
    {
      title: "Get Free Resources to learn the concepts listed in the roadmap",
      icon: BookOpen,
    },
    {
      title: "Get Roadmap of all trending technologies",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-2">Features</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Explore key features tailored for developers, learners, and business minds.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-md h-[420px] rounded-2xl p-6 border border-white/10 hover:border-blue-400 transition-all duration-300 group cursor-pointer shadow-md hover:shadow-blue-500/10"
              variants={cardVariants}
              whileHover={{ scale: 1.015 }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-5">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-500">
                    <feature.icon className="w-7 h-7 text-blue-400 group-hover:text-white transition duration-300" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>

                <div className="mt-auto flex items-center justify-center pt-6">
                  <motion.div
                    className="w-full h-28 bg-white/5 rounded-xl flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"
                      animate={{
                        rotate: [0, 6, -6, 0],
                        scale: [1, 1.03, 1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
