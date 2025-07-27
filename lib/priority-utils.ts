export type PriorityLevel = "high" | "medium" | "low"

export interface PriorityConfig {
  label: string
  letter: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

export const PRIORITY_CONFIG: Record<PriorityLevel, PriorityConfig> = {
  high: {
    label: "Alta",
    letter: "A",
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
  },
  medium: {
    label: "Media",
    letter: "M",
    color: "orange",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
  },
  low: {
    label: "Baja",
    letter: "B",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
}

export const getPriorityConfig = (priority: PriorityLevel | string): PriorityConfig => {
  return PRIORITY_CONFIG[priority as PriorityLevel] || PRIORITY_CONFIG.medium
}

export const getPriorityLabel = (priority: PriorityLevel | string): string => {
  return getPriorityConfig(priority).label
}

export const getPriorityColor = (priority: PriorityLevel | string): string => {
  const config = getPriorityConfig(priority)
  return `${config.textColor} ${config.bgColor} ${config.borderColor}`
}

export const getPriorityLetter = (priority: PriorityLevel | string): string => {
  return getPriorityConfig(priority).letter
}

export const getPriorityBadgeClasses = (priority: PriorityLevel | string): string => {
  const config = getPriorityConfig(priority)
  return `${config.textColor} ${config.bgColor} ${config.borderColor} border`
}

export const sortByPriority = <T extends { priority: PriorityLevel | string }>(items: T[]): T[] => {
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
  return items.sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0
    const priorityB = priorityOrder[b.priority] || 0
    return priorityB - priorityA // Orden descendente (alta prioridad primero)
  })
}
