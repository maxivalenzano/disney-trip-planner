"use client"

import {
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

import { useFilterBar } from "../hooks/use-filter-bar"

import TagSelector from "./tag-selector"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface FilterPanelProps {
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

export default function FilterPanel(props: FilterPanelProps) {
  const {
    openFilterTagSelector,
    setOpenFilterTagSelector,
    hasActiveFilters,
    statusConfig,
    sortConfig,
    clearFilters,
    getFilteredTagsForDisplay,
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
    type,
    showFilters,
  } = useFilterBar(props)

  if (!showFilters) return null

  return (
    <>
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

                let Icon: any
                if (key === "all") Icon = type === "movies" ? Film : CheckSquare
                else if (key === "watched" || key === "completed") Icon = Check
                else Icon = type === "movies" ? Play : Clock

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
                    <Icon className="w-4 h-4 mr-1" />
                    {config.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{sortConfig.label}</Label>
            <div className="flex flex-wrap gap-2">
              {type === "movies" && "options" in sortConfig ? (
                <>
                  <Button
                    variant={sortBy === "none" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortByChange("none")}
                    className={sortBy === "none"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                    }
                  >
                    Sin orden
                  </Button>
                  {sortConfig.options.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSortByChange(option.value)}
                      className={sortBy === option.value
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      }
                    >
                      {option.value === "priority" && "🎯"}
                      {option.value === "imdb_desc" && "⭐"}
                      {option.value.includes("date") && <Calendar className="w-4 h-4 mr-1" />}
                      {option.label}
                    </Button>
                  ))}
                </>
              ) : (
                <>
                  <Button
                    variant={sortBy === "none" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortByChange("none")}
                    className={sortBy === "none"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                    }
                  >
                      Sin orden
                  </Button>
                  <Button
                    variant={sortBy === "date_asc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortByChange("date_asc")}
                    className={sortBy === "date_asc"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    }
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {"ascLabel" in sortConfig ? sortConfig.ascLabel : "Más próximas"}
                  </Button>
                  <Button
                    variant={sortBy === "date_desc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortByChange("date_desc")}
                    className={sortBy === "date_desc"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                    }
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {"descLabel" in sortConfig ? sortConfig.descLabel : "Más lejanas"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all" || (sortBy !== "none" && (type !== "movies" || sortBy !== "priority"))) && (
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
                {sortBy !== "none" && (type !== "movies" || sortBy !== "priority") && (
                  <Badge variant="secondary" className={`flex items-center gap-1 ${sortBy === "date_asc" || sortBy === "priority"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-indigo-100 text-indigo-700"
                  }`}>
                    {sortBy === "priority" && "🎯"}
                    {sortBy === "imdb_desc" && "⭐"}
                    {sortBy.includes("date") && <Calendar className="w-3 h-3" />}
                    {sortBy === "priority" && "Por prioridad"}
                    {sortBy === "imdb_desc" && "Por puntaje IMDB"}
                    {sortBy === "date_asc" && (type === "movies" ? "Fecha más próxima" : ("ascLabel" in sortConfig ? sortConfig.ascLabel : "Más próximas"))}
                    {sortBy === "date_desc" && (type === "movies" ? "Fecha más lejana" : ("descLabel" in sortConfig ? sortConfig.descLabel : "Más lejanas"))}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => onSortByChange(type === "movies" ? "priority" : "none")} />
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

      {/* Tag Selector for Filters */}
      <TagSelector
        selectedTags={selectedFilterTags}
        onTagsChange={onFilterTagsChange}
        open={openFilterTagSelector}
        onOpenChange={setOpenFilterTagSelector}
        title="Filtrar por Etiquetas"
      />
    </>
  )
}
