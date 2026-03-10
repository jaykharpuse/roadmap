
import { useState } from "react"
import { Search, User, LayoutDashboard, Map, BookOpen, Shield, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const roadmapsData = [
  {
    topic: "AI & Machine Learning",
    status: "Published",
    lastUpdated: "Today",
    priority: "P Pridify",
  },
  {
    topic: "Web Development",
    status: "Published",
    lastUpdated: "Yesterday",
  },
  {
    topic: "Mobile Development",
    status: "Draft",
    lastUpdated: "Yesterday",
  },
  {
    topic: "Cloud Computing",
    status: "Draft",
    lastUpdated: "2 Apr 2024",
  },
]

const resourcesData = [
  {
    resource: "Introduction to Deep Learning",
    type: "Article",
    submitted: "Article",
  },
  {
    resource: "React Native Crash Course",
    type: "Video",
    submitted: "Video",
  },
  {
    resource: "Cloud Architecture Best Practices",
    type: "Article",
    submitted: "Article",
  },
]

const analyticsData = {
  totalRoadmaps: "325",
  totalResources: "1.2k",
  pendingSubmissions: "168",
  pendingApprovals: "168",
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Analytics")
  const [activeNavItem, setActiveNavItem] = useState("Dashboard")

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Roadmaps", icon: Map, active: false },
    { name: "Resources", icon: BookOpen, active: false },
    { name: "Moderation", icon: Shield, active: false },
  ]

  const tabs = ["Analytics", "Popular Paths", "User Activity"]

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-400">Dashboard</h1>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveNavItem(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeNavItem === item.name
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <div className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Manage Roadmaps Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Manage Roadmaps</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search roadmaps"
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 w-64"
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700 text-sm font-medium text-slate-400 uppercase tracking-wide">
                <div>Topic</div>
                <div>Status</div>
                <div>Last Updated</div>
                <div></div>
              </div>

              {roadmapsData.map((roadmap, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="text-white font-medium">{roadmap.topic}</div>
                  <div>
                    <Badge
                      variant={roadmap.status === "Published" ? "default" : "secondary"}
                      className={
                        roadmap.status === "Published"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-600 hover:bg-slate-700"
                      }
                    >
                      {roadmap.status}
                    </Badge>
                  </div>
                  <div className="text-slate-300">{roadmap.lastUpdated}</div>
                  <div className="flex items-center justify-between">
                    {roadmap.priority && <span className="text-blue-400 text-sm">{roadmap.priority}</span>}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Resource Moderation */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Resource Moderation</h2>

              <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-700 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <div>Resource</div>
                  <div>Submitted</div>
                  <div></div>
                </div>

                {resourcesData.map((resource, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="text-white text-sm">{resource.resource}</div>
                    <div className="text-slate-300 text-sm">{resource.submitted}</div>
                    <div className="flex justify-end">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Overview */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Analytics Overview</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{analyticsData.totalRoadmaps}</div>
                  <div className="text-slate-400 text-sm">Total Roadmaps</div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{analyticsData.totalResources}</div>
                  <div className="text-slate-400 text-sm">Total Resources</div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{analyticsData.pendingSubmissions}</div>
                  <div className="text-slate-400 text-sm">Pending Submiss.</div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{analyticsData.pendingApprovals}</div>
                  <div className="text-slate-400 text-sm">Pending Submissions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
