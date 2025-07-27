import React from "react"
import { getPriorityConfig, type PriorityLevel } from "@/lib/priority-utils"
import { cn } from "@/lib/utils"

interface PriorityIconProps {
  priority: PriorityLevel | string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function PriorityIcon({
  priority,
  size = "md",
  className,
}: PriorityIconProps) {
  const config = getPriorityConfig(priority)

  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
    lg: "w-6 h-6 text-base",
  }

  return (
    <div
      className={cn(
        "rounded-full border-2 flex items-center justify-center font-bold",
        config.textColor,
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        className,
      )}
    >
      {config.letter}
    </div>
  )
}

export { PriorityIcon }
