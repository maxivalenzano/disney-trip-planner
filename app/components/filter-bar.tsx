"use client"

import {
  Filter,
  Search,
  X,
  TagIcon,
  Calendar,
  Images,
  Film,
  Check,
  Play,
  CheckSquare,
  Clock,
} from "lucide-react"
import { useState } from "react"
import TagSelector from "./tag-selector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface FilterBarProps {
  // Filter states
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedFilterTags: string[]
  onFilterTagsChange: (tags: string[]) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  sortByDate: string
  onSortByDateChange: (sort: string) => void

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

const statusConfigs = {
  movies: {
    all: { label: "Todas", icon: Film, color: "purple" },
    watched: { label: "Vistas", icon: Check, color: "green" },
    unwatched: { label: "Por ver", icon: Play, color: "orange" },
  },
  tasks: {
    all: { label: "Todas", icon: CheckSquare, color: "purple" },
    completed: { label: "Completadas", icon: Check, color: "green" },
    pending: { label: "Pendientes", icon: Clock, color: "orange" },
  },
}

const sortConfigs = {
  movies: {
    label: "Ordenar por fecha para ver",
    ascLabel: "Más próximas",
    descLabel: "Más lejanas",
  },
  tasks: {
    label: "Ordenar por fecha límite",
    ascLabel: "Más próximas",
    descLabel: "Más lejanas",
  },
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  selectedFilterTags,
  onFilterTagsChange,
  statusFilter,
  onStatusFilterChange,
  sortByDate,
  onSortByDateChange,
  showPhotos,
  onShowPhotosChange,
  allTags,
  type,
  showFilters,
  onShowFiltersChange,
}: FilterBarProps) {
  const [openFilterTagSelector, setOpenFilterTagSelector] = useState(false)

  const statusConfig = statusConfigs[type]
  const sortConfig = sortConfigs[type]

  const clearFilters = () => {
    onSearchChange("")
    onFilterTagsChange([])
    onStatusFilterChange("all")
    onSortByDateChange("none")
  }

  const getFilteredTagsForDisplay = () => {
    return selectedFilterTags.map((tagId) => allTags.find((tag) => tag.id === tagId)).filter(Boolean) as any[]
  }

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    selectedFilterTags.length +
    (statusFilter !== "all" ? 1 : 0) +
    (sortByDate !== "none" ? 1 : 0)

  const hasActiveFilters = activeFiltersCount > 0

  return {
    // Filter Button
    filterButton: (
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
    ),

    // Filters Panel
    filtersPanel: showFilters && (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={type === "movies" ? "Buscá por título o notas..." : "Buscá por título o descripción..."}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Filtrar por etiquetas</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenFilterTagSelector(true)}
                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              >
                <TagIcon className="w-4 h-4" />
                {selectedFilterTags.length > 0
                  ? `${selectedFilterTags.length} etiquetas seleccionadas`
                  : "Seleccionar etiquetas"}
              </Button>
              {selectedFilterTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFilterTagsChange([])}
                  className="text-purple-600 hover:text-red-500 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {/* Preview de etiquetas seleccionadas */}
            {selectedFilterTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getFilteredTagsForDisplay().map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 border-purple-200"
                  >
                    <span className="text-sm">{tag.icon}</span>
                    <span>{tag.name}</span>
                    {tag.parent_name && <span className="text-gray-500">({tag.parent_name})</span>}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Estado</Label>
            <div className="flex gap-2">
              {Object.entries(statusConfig).map(([key, config]) => {
                const isActive = statusFilter === key

                let buttonClass = ""
                if (isActive) {
                  if (config.color === "purple") buttonClass = "bg-purple-600 text-white hover:bg-purple-700"
                  else if (config.color === "green") buttonClass = "bg-green-600 text-white hover:bg-green-700"
                  else if (config.color === "orange") buttonClass = "bg-orange-600 text-white hover:bg-orange-700"
                } else {
                  if (config.color === "purple") buttonClass = "border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                  else if (config.color === "green") buttonClass = "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  else if (config.color === "orange") buttonClass = "border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
                }

                return (
                  <Button
                    key={key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onStatusFilterChange(key)}
                    className={buttonClass}
                  >
                    {/* <Icon className="w-4 h-4 mr-1" /> */}
                    {config.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Sort by Date Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{sortConfig.label}</Label>
            <div className="flex gap-2">
              <Button
                variant={sortByDate === "none" ? "default" : "outline"}
                size="sm"
                onClick={() => onSortByDateChange("none")}
                className={sortByDate === "none"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                }
              >
                Sin orden
              </Button>
              <Button
                variant={sortByDate === "asc" ? "default" : "outline"}
                size="sm"
                onClick={() => onSortByDateChange("asc")}
                className={sortByDate === "asc"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                }
              >
                {/* <Calendar className="w-4 h-4 mr-1" /> */}
                {sortConfig.ascLabel}
              </Button>
              <Button
                variant={sortByDate === "desc" ? "default" : "outline"}
                size="sm"
                onClick={() => onSortByDateChange("desc")}
                className={sortByDate === "desc"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                }
              >
                {/* <Calendar className="w-4 h-4 mr-1" /> */}
                {sortConfig.descLabel}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all" || sortByDate !== "none") && (
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-700">
                    <Search className="w-3 h-3" />"{searchTerm}"
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => onSearchChange("")} />
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className={`flex items-center gap-1 ${statusFilter === "watched" || statusFilter === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                  }`}>
                    {statusFilter === "watched" || statusFilter === "completed" ? (
                      <Check className="w-3 h-3" />
                    ) : statusFilter === "unwatched" || statusFilter === "pending" ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    {statusConfig[statusFilter as keyof typeof statusConfig].label}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => onStatusFilterChange("all")} />
                  </Badge>
                )}
                {sortByDate !== "none" && (
                  <Badge variant="secondary" className={`flex items-center gap-1 ${sortByDate === "asc"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-indigo-100 text-indigo-700"
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {sortByDate === "asc" ? sortConfig.ascLabel : sortConfig.descLabel}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => onSortByDateChange("none")} />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Photo Display Toggle (solo para películas) */}
          {type === "movies" && onShowPhotosChange && (
            <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
              <Images className="w-4 h-4" />
              <Label htmlFor="show-photos" className="text-sm">
                Mostrar fotos
              </Label>
              <Switch id="show-photos" checked={showPhotos} onCheckedChange={onShowPhotosChange} />
            </div>
          )}
        </CardContent>
      </Card>
    ),

    // Tag Selector for Filters
    tagSelector: (
      <TagSelector
        selectedTags={selectedFilterTags}
        onTagsChange={onFilterTagsChange}
        open={openFilterTagSelector}
        onOpenChange={setOpenFilterTagSelector}
        title="Filtrar por Etiquetas"
      />
    ),
  }
}
