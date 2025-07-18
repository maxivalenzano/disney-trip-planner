import { useState } from "react"

interface UseFilterBarProps {
  // Filter states
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedFilterTags: string[]
  onFilterTagsChange: (tags: string[]) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  sortBy: string
  onSortByChange: (sort: string) => void
  
  // Display options
  showPhotos?: boolean
  onShowPhotosChange?: (show: boolean) => void
  
  // Data for tag display
  allTags: any[]
  
  // Configuration
  type: "movies" | "tasks"
  showFilters: boolean
  onShowFiltersChange: (show: boolean) => void
}

export function useFilterBar(props: UseFilterBarProps) {
  const [openFilterTagSelector, setOpenFilterTagSelector] = useState(false)
  
  const {
    searchTerm,
    onSearchChange,
    selectedFilterTags,
    onFilterTagsChange,
    statusFilter,
    onStatusFilterChange,
    sortBy,
    onSortByChange,
    showPhotos,
    onShowPhotosChange,
    allTags,
    type,
    showFilters,
    onShowFiltersChange,
  } = props

  const clearFilters = () => {
    onSearchChange("")
    onFilterTagsChange([])
    onStatusFilterChange("all")
    onSortByChange(type === "movies" ? "priority" : "none")
  }

  const getFilteredTagsForDisplay = () => {
    return selectedFilterTags.map((tagId) => allTags.find((tag) => tag.id === tagId)).filter(Boolean) as any[]
  }

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) + 
    selectedFilterTags.length + 
    (statusFilter !== "all" ? 1 : 0) + 
    (sortBy !== "none" && (type !== "movies" || sortBy !== "priority") ? 1 : 0)

  const hasActiveFilters = activeFiltersCount > 0

  const statusConfigs = {
    movies: {
      all: { label: "Todas", color: "purple" },
      watched: { label: "Vistas", color: "green" },
      unwatched: { label: "Por ver", color: "orange" },
    },
    tasks: {
      all: { label: "Todas", color: "purple" },
      completed: { label: "Completadas", color: "green" },
      pending: { label: "Pendientes", color: "orange" },
    },
  }

  const sortConfigs = {
    movies: {
      label: "Ordenar películas",
      options: [
        { value: "priority", label: "Por prioridad" },
        { value: "imdb_desc", label: "Por puntaje IMDB" },
        { value: "date_asc", label: "Fecha más próxima" },
        { value: "date_desc", label: "Fecha más lejana" },
      ]
    },
    tasks: {
      label: "Ordenar por fecha límite",
      ascLabel: "Más próximas",
      descLabel: "Más lejanas",
    },
  }

  const statusConfig = statusConfigs[type]
  const sortConfig = sortConfigs[type]

  return {
    // State
    openFilterTagSelector,
    setOpenFilterTagSelector,
    hasActiveFilters,
    activeFiltersCount,
    
    // Config
    statusConfig,
    sortConfig,
    
    // Functions
    clearFilters,
    getFilteredTagsForDisplay,
    
    // Props passthrough
    searchTerm,
    onSearchChange,
    selectedFilterTags,
    onFilterTagsChange,
    statusFilter,
    onStatusFilterChange,
    sortBy,
    onSortByChange,
    showPhotos,
    onShowPhotosChange,
    allTags,
    type,
    showFilters,
    onShowFiltersChange,
  }
} 