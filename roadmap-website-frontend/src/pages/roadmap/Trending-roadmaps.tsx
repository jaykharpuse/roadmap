import { Brain, Code, Sparkles } from "lucide-react"

interface RoadmapCategory {
  category: string
  topics: string[]
}

interface TrendingRoadmapsProps {
  data: RoadmapCategory[]
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "ai & machine learning":
      return <Brain className="w-5 h-5" />
    case "web development":
      return <Code className="w-5 h-5" />
    default:
      return <Sparkles className="w-5 h-5" />
  }
}

export function TrendingRoadmaps({ data }: TrendingRoadmapsProps) {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Trending Roadmaps</h1>
        </div>

        {/* Roadmap Categories */}
        <div className="space-y-12">
          {data.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <div className="text-blue-400">{getCategoryIcon(category.category)}</div>
                <h2 className="text-xl font-semibold text-white">{category.category}</h2>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.topics.map((topic, topicIndex) => (
                  <div
                    key={topicIndex}
                    className="bg-slate-800 hover:bg-slate-700 transition-colors duration-200 rounded-lg p-4 border border-slate-700 hover:border-slate-600 cursor-pointer group"
                  >
                    <p className="text-white text-sm font-medium leading-relaxed group-hover:text-blue-300 transition-colors duration-200">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Repeat sections to match the image layout */}
        <div className="mt-16 space-y-12">
          {data.map((category, categoryIndex) => (
            <div key={`repeat-${categoryIndex}`} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <div className="text-blue-400">{getCategoryIcon(category.category)}</div>
                <h2 className="text-xl font-semibold text-white">{category.category}</h2>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.topics.map((topic, topicIndex) => (
                  <div
                    key={`repeat-${topicIndex}`}
                    className="bg-slate-800 hover:bg-slate-700 transition-colors duration-200 rounded-lg p-4 border border-slate-700 hover:border-slate-600 cursor-pointer group"
                  >
                    <p className="text-white text-sm font-medium leading-relaxed group-hover:text-blue-300 transition-colors duration-200">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Third repeat to match the scrollable layout */}
        <div className="mt-16 space-y-12">
          {data.map((category, categoryIndex) => (
            <div key={`repeat2-${categoryIndex}`} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <div className="text-blue-400">{getCategoryIcon(category.category)}</div>
                <h2 className="text-xl font-semibold text-white">{category.category}</h2>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.topics.map((topic, topicIndex) => (
                  <div
                    key={`repeat2-${topicIndex}`}
                    className="bg-slate-800 hover:bg-slate-700 transition-colors duration-200 rounded-lg p-4 border border-slate-700 hover:border-slate-600 cursor-pointer group"
                  >
                    <p className="text-white text-sm font-medium leading-relaxed group-hover:text-blue-300 transition-colors duration-200">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
