"use client"

import { Button } from "@/components/ui/button"

interface NotFoundPageProps {
  onGoHome: () => void
}

export function NotFoundPage({ onGoHome }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* 404 Number */}
        <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text mb-8">
          404
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Page Not Found</h1>

        {/* Description */}
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          The page you are looking for
          <br />
          does not exist.
        </p>

        {/* Go Home Button */}
        <Button
          onClick={onGoHome}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors duration-200"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  )
}
