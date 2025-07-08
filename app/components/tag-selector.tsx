"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tag, ChevronRight, ChevronDown } from "lucide-react"
import { getTagsGrouped, type Tag as TagType } from "@/lib/supabase"

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tagIds: string[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TagSelector({ selectedTags, onTagsChange, open, onOpenChange }: TagSelectorProps) {
  const [tagsGrouped, setTagsGrouped] = useState<{ [key: string]: TagType[] }>({})
  const [expandedParks, setExpandedParks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadTags()
    }
  }, [open])

  const loadTags = async () => {
    try {
      setLoading(true)
      const grouped = await getTagsGrouped()
      setTagsGrouped(grouped)

      // Auto-expand parks that have selected attractions
      const newExpanded = new Set<string>()
      Object.entries(grouped).forEach(([parkId, tags]) => {
        const hasSelectedAttraction = tags.some((tag) => tag.type === "attraction" && selectedTags.includes(tag.id))
        if (hasSelectedAttraction) {
          newExpanded.add(parkId)
        }
      })
      setExpandedParks(newExpanded)
    } catch (error) {
      console.error("Error loading tags:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleParkExpansion = (parkId: string) => {
    const newExpanded = new Set(expandedParks)
    if (newExpanded.has(parkId)) {
      newExpanded.delete(parkId)
    } else {
      newExpanded.add(parkId)
    }
    setExpandedParks(newExpanded)
  }

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]

    onTagsChange(newSelectedTags)
  }

  const getSelectedTagsInfo = () => {
    const allTags = Object.values(tagsGrouped).flat()
    return selectedTags.map((tagId) => allTags.find((tag) => tag.id === tagId)).filter(Boolean) as TagType[]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Seleccionar Etiquetas
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {Object.entries(tagsGrouped).map(([parkId, tags]) => {
                const park = tags.find((tag) => tag.type === "park")
                const attractions = tags.filter((tag) => tag.type === "attraction")
                const isExpanded = expandedParks.has(parkId)

                if (!park) return null

                return (
                  <div key={parkId} className="space-y-1">
                    {/* Park Tag */}
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => toggleParkExpansion(parkId)}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                      <Checkbox
                        id={park.id}
                        checked={selectedTags.includes(park.id)}
                        onCheckedChange={() => handleTagToggle(park.id)}
                      />
                      <label htmlFor={park.id} className="flex items-center gap-2 cursor-pointer flex-1">
                        <span className="text-lg">{park.icon}</span>
                        <span className="font-medium">{park.name}</span>
                      </label>
                    </div>

                    {/* Attractions (Sub-tags) */}
                    {isExpanded && attractions.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {attractions.map((attraction) => (
                          <div
                            key={attraction.id}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox
                              id={attraction.id}
                              checked={selectedTags.includes(attraction.id)}
                              onCheckedChange={() => handleTagToggle(attraction.id)}
                            />
                            <label htmlFor={attraction.id} className="flex items-center gap-2 cursor-pointer flex-1">
                              <span className="text-sm">{attraction.icon}</span>
                              <span className="text-sm">{attraction.name}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Selected Tags Preview */}
        {selectedTags.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Etiquetas seleccionadas:</h4>
            <div className="flex flex-wrap gap-1">
              {getSelectedTagsInfo().map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs flex items-center gap-1 px-2 py-1">
                  <span className="text-sm">{tag.icon}</span>
                  <span>{tag.name}</span>
                  {tag.parent_name && <span className="text-gray-500">({tag.parent_name})</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onTagsChange([])}
            className="flex-1"
            disabled={selectedTags.length === 0}
          >
            Limpiar todo
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
