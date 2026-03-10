"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface FilterSortBarProps {
  sortBy: string
  setSortBy: (value: string) => void
  filterRating: string
  setFilterRating: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export default function FilterSortBar({
  sortBy,
  setSortBy,
  filterRating,
  setFilterRating,
  searchQuery,
  setSearchQuery,
}: FilterSortBarProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-8 border border-slate-700">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="newest" className="text-slate-200 focus:bg-slate-600">
                Newest First
              </SelectItem>
              <SelectItem value="oldest" className="text-slate-200 focus:bg-slate-600">
                Oldest First
              </SelectItem>
              <SelectItem value="rating-high" className="text-slate-200 focus:bg-slate-600">
                Highest Rating
              </SelectItem>
              <SelectItem value="rating-low" className="text-slate-200 focus:bg-slate-600">
                Lowest Rating
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter by Rating */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm whitespace-nowrap">Rating:</span>
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-slate-200 focus:bg-slate-600">
                All Ratings
              </SelectItem>
              <SelectItem value="5" className="text-slate-200 focus:bg-slate-600">
                5 Stars
              </SelectItem>
              <SelectItem value="4" className="text-slate-200 focus:bg-slate-600">
                4+ Stars
              </SelectItem>
              <SelectItem value="3" className="text-slate-200 focus:bg-slate-600">
                3+ Stars
              </SelectItem>
              <SelectItem value="2" className="text-slate-200 focus:bg-slate-600">
                2+ Stars
              </SelectItem>
              <SelectItem value="1" className="text-slate-200 focus:bg-slate-600">
                1+ Stars
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
