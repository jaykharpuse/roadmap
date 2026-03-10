import type { ProgressStatus } from "@/types/user/progress/UserProgress"
import { CheckCircle2, Circle, Clock, X } from "lucide-react"
// import type { ProgressStatus } from "@/types/progress"

interface ProgressIndicatorProps {
  status: ProgressStatus
  size?: "sm" | "md" | "lg"
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  skipped: {
    icon: X,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
}

const sizeConfig = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function ProgressIndicator({ status, size = "md" }: ProgressIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const iconSize = sizeConfig[size]

  return (
    <div
      className={`
      flex items-center justify-center rounded-full p-1
      ${config.bgColor} ${config.color}
    `}
    >
      <Icon className={iconSize} />
    </div>
  )
}
