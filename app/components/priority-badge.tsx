import React from "react"
import { Badge } from "@/components/ui/badge"
import { getPriorityConfig, type PriorityLevel } from "@/lib/priority-utils"
import { cn } from "@/lib/utils"
import PriorityIcon from "./priority-icon"

interface PriorityBadgeProps {
  priority: PriorityLevel | string
  showIcon?: boolean
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function PriorityBadge({
  priority,
  showIcon = true,
  showLabel = true,
  size = "md",
  className
}: PriorityBadgeProps) {
  const config = getPriorityConfig(priority)

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  }

  const letterSizeClasses = {
    sm: "w-3 h-3 text-xs",
    md: "w-4 h-4 text-xs",
    lg: "w-5 h-5 text-sm"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        config.textColor,
        config.bgColor,
        config.borderColor,
        "border flex items-center gap-1 font-medium",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <PriorityIcon priority={priority} size={size} />
      )}
      {showLabel && config.label}
    </Badge>
  )
}

export { PriorityBadge } 