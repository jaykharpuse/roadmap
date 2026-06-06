import { motion } from "framer-motion";
import { Network, FileText, Plus, BookOpen, TrendingUp, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const features = [
  {
    title: "Roadmaps for Every Path",
    description: "Developers, marketers, students, business professionals — find your structured learning journey.",
    icon: Network,
    gradient: "from-orange-500/20 via-rose-500/10 to-transparent",
    iconColor: "text-orange-400",
    action: "/roadmaps",
  },
  {
    title: "Cheatsheets & Quick Reference",
    description: "Summarise complex topics into digestible cheatsheets you can revisit anytime.",
    icon: FileText,
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    iconColor: "text-rose-400",
    action: "/roadmaps",
  },
  {
    title: "Create Custom Roadmaps",
    description: "Can't find what you need? Use our AI generator to build a roadmap for any niche topic.",
    icon: Plus,
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    iconColor: "text-violet-400",
    action: "/generate-roadmap",
  },
  {
    title: "Free Learning Resources",
    description: "Every roadmap step comes with curated free resources — articles, videos, and courses.",
    icon: BookOpen,
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    iconColor: "text-blue-400",
    action: "/roadmaps",
  },
  {
    title: "Trending Technologies",
    description: "Stay ahead with constantly updated roadmaps for the most in-demand skills of today.",
    icon: TrendingUp,
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    iconColor: "text-amber-400",
    action: "/roadmaps",
  },
];

export default function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background py-28 px-5 md:px-8 overflow-hidden">

      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-400/70 mb-4">
            What You Get
          </p>
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-4"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Everything you need to{" "}
            <span className="text-gradient-brand">navigate learning.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Structured paths, curated resources, and AI-powered tools — built for serious learners.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(feature.action)}
              className="group relative glass card-gradient-border rounded-2xl p-7 cursor-pointer overflow-hidden"
            >
              {/* Card inner glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-foreground/[0.06] border border-border flex items-center justify-center mb-5 group-hover:border-orange-500/30 transition-colors duration-300">
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Text */}
                <h3
                  className="text-xl font-semibold text-foreground mb-2.5 leading-snug transition-colors duration-200"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow hint */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-orange-400/80 transition-colors duration-300">
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
