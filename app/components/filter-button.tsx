"use client"

import { Filter } from "lucide-react"
import { useFilterBar } from "../hooks/use-filter-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FilterButtonProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedFilterTags: string[]
  onFilterTagsChange: (tags: string[]) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  sortBy: string
  onSortByChange: (sort: string) => void
  showPhotos?: boolean
  onShowPhotosChange?: (show: boolean) => void
  allTags: any[]
  type: "movies" | "tasks"
  showFilters: boolean
  onShowFiltersChange: (show: boolean) => void
}

export default function FilterButton(props: FilterButtonProps) {
  const { hasActiveFilters, activeFiltersCount, onShowFiltersChange, showFilters } = useFilterBar(props)

  return (
    <Button
      variant="outline"
      onClick={() => onShowFiltersChange(!showFilters)}
      className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
    >
      <Filter className="w-4 h-4" />
      Filtros
      {hasActiveFilters && (
        <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  )
}
