import React from "react"
import PriorityIcon from "./priority-icon"
import { Badge } from "@/components/ui/badge"
import { getPriorityConfig, type PriorityLevel } from "@/lib/priority-utils"
import { cn } from "@/lib/utils"

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
  className,
}: PriorityBadgeProps) {
  const config = getPriorityConfig(priority)

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
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
        className,
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
