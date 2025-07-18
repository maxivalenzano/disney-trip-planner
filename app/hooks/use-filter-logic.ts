import { useState, useEffect } from "react"

interface FilterableItem {
  id: string
  title: string
  tags?: Array<{ id: string; name: string; icon?: string; parent_name?: string }>
  notes?: string
  description?: string
  watch_date?: string
  due_date?: string
  watched?: boolean
  completed?: boolean
  priority?: "high" | "medium" | "low"
  imdb_score?: number
}

interface UseFilterLogicProps<T extends FilterableItem> {
  items: T[]
  type: "movies" | "tasks"
}

export function useFilterLogic<T extends FilterableItem>({ items, type }: UseFilterLogicProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState<string>(type === "movies" ? "priority" : "none")
  const [showPhotos, setShowPhotos] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filteredItems, setFilteredItems] = useState<T[]>([])

  const filterItems = () => {
    let filtered = [...items]

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) => {
        const title = item.title.toLowerCase()
        const searchLower = searchTerm.toLowerCase()
        
        if (type === "movies") {
          const notes = item.notes?.toLowerCase() || ""
          return title.includes(searchLower) || notes.includes(searchLower)
        } else {
          const description = item.description?.toLowerCase() || ""
          return title.includes(searchLower) || description.includes(searchLower)
        }
      })
    }

    // Filter by tags
    if (selectedFilterTags.length > 0) {
      filtered = filtered.filter((item) => 
        item.tags?.some((tag) => selectedFilterTags.includes(tag.id))
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (type === "movies") {
        filtered = filtered.filter((item) => 
          statusFilter === "watched" ? item.watched : !item.watched
        )
      } else {
        filtered = filtered.filter((item) => 
          statusFilter === "completed" ? item.completed : statusFilter === "pending" ? !item.completed : true
        )
      }
    }

    // Sort items
    if (sortBy !== "none") {
      filtered = filtered.sort((a, b) => {
        switch (sortBy) {
          case "priority":
            if (type === "movies") {
              const priorityOrder = { high: 0, medium: 1, low: 2 }
              const aPriority = a.priority || "medium"
              const bPriority = b.priority || "medium"
              return priorityOrder[aPriority] - priorityOrder[bPriority]
            }
            return 0
            
          case "imdb_desc":
            if (type === "movies") {
              const aScore = a.imdb_score || 0
              const bScore = b.imdb_score || 0
              // Sin puntaje al final
              if (aScore === 0 && bScore === 0) return 0
              if (aScore === 0) return 1
              if (bScore === 0) return -1
              return bScore - aScore
            }
            return 0
            
          case "date_asc":
          case "date_desc":
            const dateA = type === "movies" 
              ? (a.watch_date ? new Date(a.watch_date).getTime() : 0)
              : (a.due_date ? new Date(a.due_date).getTime() : 0)
            const dateB = type === "movies" 
              ? (b.watch_date ? new Date(b.watch_date).getTime() : 0)
              : (b.due_date ? new Date(b.due_date).getTime() : 0)
            
            if (sortBy === "date_asc") {
              // Sin fecha al final
              const aHasDate = type === "movies" ? !!a.watch_date : !!a.due_date
              const bHasDate = type === "movies" ? !!b.watch_date : !!b.due_date
              
              if (!aHasDate && !bHasDate) return 0
              if (!aHasDate) return 1
              if (!bHasDate) return -1
              return dateA - dateB
            } else {
              // Sin fecha al final
              const aHasDate = type === "movies" ? !!a.watch_date : !!a.due_date
              const bHasDate = type === "movies" ? !!b.watch_date : !!b.due_date
              
              if (!aHasDate && !bHasDate) return 0
              if (!aHasDate) return 1
              if (!bHasDate) return -1
              return dateB - dateA
            }
            
          default:
            return 0
        }
      })
    }

    setFilteredItems(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedFilterTags([])
    setStatusFilter("all")
    setSortBy(type === "movies" ? "priority" : "none")
  }

  // Re-filter when items or filters change
  useEffect(() => {
    filterItems()
  }, [items, searchTerm, selectedFilterTags, statusFilter, sortBy, type])

  return {
    // States
    searchTerm,
    selectedFilterTags,
    statusFilter,
    sortBy,
    showPhotos,
    showFilters,
    filteredItems,
    
    // Actions
    setSearchTerm,
    setSelectedFilterTags,
    setStatusFilter,
    setSortBy,
    setShowPhotos,
    setShowFilters,
    clearFilters,
  }
} 