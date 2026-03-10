

import { useState } from "react"
import { Star, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"
import type { PopulatedReview } from "./main"


interface ReviewCardProps {
  review: PopulatedReview
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const shouldShowExpandButton = review.review.length > 200

  return (
    <div className="group bg-slate-800 rounded-xl p-6 transition-all duration-300 hover:bg-slate-700 hover:shadow-xl hover:shadow-blue-500/10 border border-slate-700 hover:border-blue-500/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-slate-200">Reviewed by {review.user.name}</p>
            {review.isVerified && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                <CheckCircle className="h-3 w-3" />
                <span>Verified</span>
              </div>
            )}
          </div>
          <a
            href={`/roadmaps/${review.roadmap._id}`}
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            {review.roadmap.title}
          </a>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "fill-blue-500 text-blue-500" : "text-slate-500"}`}
            />
          ))}
          <span className="ml-1 text-sm text-slate-400">({review.rating})</span>
        </div>
      </div>

      {/* Review Title */}
      {review.title && <h3 className="text-lg font-semibold text-sky-400 mb-3">{review.title}</h3>}

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-slate-300 leading-relaxed">
          {shouldShowExpandButton && !isExpanded ? `${review.review.substring(0, 200)}...` : review.review}
        </p>
        {shouldShowExpandButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Read more
              </>
            )}
          </button>
        )}
      </div>

      {/* Pros and Cons */}
      {(review.pros?.length || review.cons?.length) && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Pros */}
          {review.pros && review.pros.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-2">Pros</h4>
              <div className="flex flex-wrap gap-1">
                {review.pros.map((pro, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-900/30 text-green-300 rounded-md text-xs border border-green-700/50"
                  >
                    {pro}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cons */}
          {review.cons && review.cons.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-2">Cons</h4>
              <div className="flex flex-wrap gap-1">
                {review.cons.map((con, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-900/30 text-red-300 rounded-md text-xs border border-red-700/50"
                  >
                    {con}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-slate-400 text-sm">Reviewed on {formatDate(review.createdAt)}</p>
    </div>
  )
}
