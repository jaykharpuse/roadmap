"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, Circle, Clock, X, ChevronDown } from "lucide-react"
import type { ProgressStatus } from "@/types/user/progress/UserProgress"


interface ProgressSelectorProps {
  currentStatus: ProgressStatus
  onStatusChange: (status: ProgressStatus) => void
  disabled?: boolean
}

const statusConfig = {
  not_started: {
    icon: Circle,
    label: "Not Started",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  skipped: {
    icon: X,
    label: "Skipped",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
}

export function ProgressSelector({ currentStatus, onStatusChange, disabled = false }: ProgressSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentConfig = statusConfig[currentStatus]
  const CurrentIcon = currentConfig.icon

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={`
            ${currentConfig.bgColor} ${currentConfig.borderColor} ${currentConfig.color}
            hover:bg-opacity-20 transition-all duration-200
          `}
        >
          <CurrentIcon className="h-4 w-4 mr-2" />
          {currentConfig.label}
          <ChevronDown className="h-3 w-3 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-[#1E293B] border-[#334155]">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => {
                onStatusChange(status as ProgressStatus)
                setIsOpen(false)
              }}
              className={`
                flex items-center gap-2 cursor-pointer
                ${config.color} hover:bg-[#0F172A]
                ${currentStatus === status ? "bg-[#0F172A]" : ""}
              `}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
