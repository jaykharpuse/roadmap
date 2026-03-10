"use client"

import { useEffect, useState } from "react"

export function LoadingScreen() {
  const [activeDot, setActiveDot] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 7)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index <= activeDot ? "bg-blue-400" : "bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* Loading Text */}
        <h1 className="text-2xl font-medium text-white">Loading...</h1>
      </div>
    </div>
  )
}
