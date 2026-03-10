import { Check, Clock, Settings } from "lucide-react"

// Props removed because `data` is currently unused in this component

const getTypeIcon = (type: string) => {
  switch (type) {
    case "essential":
      return <Check className="w-4 h-4" />
    case "optional":
      return <div className="w-4 h-4 rounded-full border-2 border-current" />
    case "learn_anytime":
      return <Clock className="w-4 h-4" />
    default:
      return null
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "essential":
      return "text-blue-400 border-blue-400 bg-blue-400/10"
    case "optional":
      return "text-blue-300 border-blue-300 bg-blue-300/10"
    case "learn_anytime":
      return "text-blue-200 border-blue-200 bg-blue-200/10"
    default:
      return "text-blue-400 border-blue-400 bg-blue-400/10"
  }
}

 function RoadmapDetails() {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Frontend</h1>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Development</h1>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-blue-400">
            <Check className="w-5 h-5" />
            <span className="text-white">Essential</span>
          </div>
          <div className="flex items-center gap-3 text-blue-300">
            <div className="w-5 h-5 rounded-full border-2 border-blue-300" />
            <span className="text-white">Optional</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200">
            <Clock className="w-5 h-5" />
            <span className="text-white">Learn Anytime</span>
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="relative z-10">
        {/* SVG for connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(147, 197, 253, 0.3)" />
            </linearGradient>
          </defs>

          {/* Internet connections */}
          <path d="M 300 200 Q 400 150 500 180" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 300 200 Q 450 120 600 160" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 300 200 Q 500 180 650 220" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 300 200 Q 450 250 600 280" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />

          {/* HTML connections */}
          <path d="M 150 300 Q 200 280 250 300" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 150 350 Q 200 330 250 350" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />

          {/* CSS connection */}
          <path d="M 300 350 L 300 400" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />

          {/* JavaScript connections */}
          <path d="M 200 500 Q 250 480 300 500" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 200 550 Q 250 530 300 550" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 200 600 Q 250 580 300 600" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 350 500 Q 400 480 450 500" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 350 550 Q 400 530 450 550" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 350 600 Q 400 580 450 600" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />

          {/* Tools connections */}
          <path d="M 500 700 Q 550 680 600 700" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 500 750 Q 550 730 600 750" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M 500 800 Q 550 780 600 800" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
        </svg>

        {/* Nodes */}
        <div className="relative" style={{ zIndex: 2 }}>
          {/* Internet Section */}
          <div className="absolute" style={{ left: "250px", top: "150px" }}>
            <div
              className={`px-4 py-3 rounded-lg border backdrop-blur-sm font-medium ${getTypeColor("essential")} flex items-center gap-2`}
            >
              {getTypeIcon("essential")}
              Internet
            </div>
          </div>

          <div className="absolute" style={{ left: "450px", top: "130px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("essential")} flex items-center gap-2 max-w-[140px]`}
            >
              {getTypeIcon("essential")}
              How does the internet work?
            </div>
          </div>

          <div className="absolute" style={{ left: "550px", top: "110px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("essential")} flex items-center gap-2`}
            >
              {getTypeIcon("essential")}
              What is HTTP?
            </div>
          </div>

          <div className="absolute" style={{ left: "600px", top: "170px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("essential")} flex items-center gap-2 max-w-[120px]`}
            >
              {getTypeIcon("essential")}
              What is Domain Name?
            </div>
          </div>

          <div className="absolute" style={{ left: "550px", top: "230px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("optional")} flex items-center gap-2 max-w-[130px]`}
            >
              {getTypeIcon("optional")}
              DNS and how it works?
            </div>
          </div>

          {/* HTML Section */}
          <div className="absolute" style={{ left: "100px", top: "250px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("essential")} flex items-center gap-2`}
            >
              {getTypeIcon("essential")}
              Learn the basics
            </div>
          </div>

          <div className="absolute" style={{ left: "100px", top: "300px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("learn_anytime")} flex items-center gap-2 max-w-[120px]`}
            >
              {getTypeIcon("learn_anytime")}
              Writing Semantic HTML
            </div>
          </div>

          {/* CSS Section */}
          <div className="absolute" style={{ left: "270px", top: "350px" }}>
            <div
              className={`px-4 py-3 rounded-lg border backdrop-blur-sm font-medium ${getTypeColor("essential")} flex items-center gap-2`}
            >
              {getTypeIcon("essential")}
              CSS
            </div>
          </div>

          {/* JavaScript Section */}
          <div className="absolute" style={{ left: "270px", top: "450px" }}>
            <div
              className={`px-4 py-3 rounded-lg border backdrop-blur-sm font-medium ${getTypeColor("essential")} flex items-center gap-2`}
            >
              {getTypeIcon("essential")}
              JSC
            </div>
          </div>

          <div className="absolute" style={{ left: "150px", top: "450px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("essential")} flex items-center gap-2`}
            >
              {getTypeIcon("essential")}
              Learn the basics
            </div>
          </div>

          <div className="absolute" style={{ left: "150px", top: "500px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("learn_anytime")} flex items-center gap-2 max-w-[120px]`}
            >
              {getTypeIcon("learn_anytime")}
              Writing Semantic HTML
            </div>
          </div>

          <div className="absolute" style={{ left: "150px", top: "550px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("essential")} flex items-center gap-2 max-w-[120px]`}
            >
              {getTypeIcon("essential")}
              Forms and Validations
            </div>
          </div>

          <div className="absolute" style={{ left: "150px", top: "600px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("learn_anytime")} flex items-center gap-2`}
            >
              {getTypeIcon("learn_anytime")}
              SEO Basics
            </div>
          </div>

          <div className="absolute" style={{ left: "400px", top: "450px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("optional")} flex items-center gap-2 max-w-[120px]`}
            >
              {getTypeIcon("optional")}
              Responsive Design
            </div>
          </div>

          <div className="absolute" style={{ left: "250px", top: "520px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("optional")} flex items-center gap-2`}
            >
              {getTypeIcon("optional")}
              Making Layouts
            </div>
          </div>

          <div className="absolute" style={{ left: "250px", top: "580px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("optional")} flex items-center gap-2 max-w-[120px]`}
            >
              {getTypeIcon("optional")}
              Responsive Design
            </div>
          </div>

          {/* Tools Section */}
          <div className="absolute" style={{ left: "450px", top: "650px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("optional")} flex items-center gap-2`}
            >
              <Settings className="w-4 h-4" />
              Version Control Systems
            </div>
          </div>

          <div className="absolute" style={{ left: "550px", top: "700px" }}>
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm ${getTypeColor("optional")} flex items-center gap-2`}
            >
              {getTypeIcon("optional")}
              VCS Hosting
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-white text-lg flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors">
          Not sure where to start?
          <span className="text-blue-400">→</span>
        </div>
      </div>
    </div>
  )
}


export default RoadmapDetails; 