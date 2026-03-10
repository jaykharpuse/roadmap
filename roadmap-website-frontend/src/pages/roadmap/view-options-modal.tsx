"use client"

import { FileText, Lightbulb } from "lucide-react"

interface ViewOptionsModalProps {
  onChoice: (choice: "cheatsheet" | "resources") => void
}

export function ViewOptionsModal({ onChoice }: ViewOptionsModalProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 max-w-md w-full">
        {/* Title */}
        <h2 className="text-xl font-medium text-white text-center mb-8">What would you like to view?</h2>

        {/* Options */}
        <div className="space-y-4">
          {/* View Cheatsheet */}
          <button
            onClick={() => onChoice("cheatsheet")}
            className="w-full flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 hover:border-blue-500/50 rounded-lg transition-all duration-200 group"
          >
            <FileText className="w-6 h-6 text-blue-400" />
            <span className="text-blue-400 font-medium group-hover:text-blue-300">View Cheatsheet</span>
          </button>

          {/* View Free Resources */}
          <button
            onClick={() => onChoice("resources")}
            className="w-full flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 hover:border-blue-500/50 rounded-lg transition-all duration-200 group"
          >
            <Lightbulb className="w-6 h-6 text-blue-400" />
            <span className="text-blue-400 font-medium group-hover:text-blue-300">View Free Resources</span>
          </button>
        </div>
      </div>
    </div>
  )
}
