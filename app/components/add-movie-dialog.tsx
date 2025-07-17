"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagIcon, Search } from "lucide-react"
import { createMovie, updateMovieTags } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import TagSelector from "./tag-selector"
import JustWatchSearch from "./justwatch-search"

interface AddMovieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMovieAdded: () => void
}

export default function AddMovieDialog({ open, onOpenChange, onMovieAdded }: AddMovieDialogProps) {
  const [newMovie, setNewMovie] = useState({
    title: "",
    year: new Date().getFullYear(),
    disney_plus_link: "",
    notes: "",
    watch_date: "",
  })
  
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [openTagSelector, setOpenTagSelector] = useState(false)
  const [openJustWatchSearch, setOpenJustWatchSearch] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setNewMovie({
      title: "",
      year: new Date().getFullYear(),
      disney_plus_link: "",
      notes: "",
      watch_date: "",
    })
    setSelectedTags([])
  }

  const handleJustWatchMovieSelect = (movie: {
    title: string
    year: number
    justwatch_link: string
  }) => {
    setNewMovie({
      ...newMovie,
      title: movie.title,
      year: movie.year,
      disney_plus_link: movie.justwatch_link,
    })
  }

  const handleAddMovie = async () => {
    if (!newMovie.title.trim()) {
      toast({
        title: "Error",
        description: "El título de la película es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      const movie = await createMovie({
        title: newMovie.title.trim(),
        year: newMovie.year,
        watched: false,
        disney_plus_link: newMovie.disney_plus_link || undefined,
        notes: newMovie.notes || undefined,
        watch_date: newMovie.watch_date || undefined,
      })

      // Update tags if any selected
      if (selectedTags.length > 0) {
        await updateMovieTags(movie.id, selectedTags)
      }

      // Reset form and close dialog
      resetForm()
      onOpenChange(false)
      onMovieAdded()

      toast({
        title: "¡Película agregada!",
        description: `${movie.title} se ha agregado a tu lista`,
      })
    } catch (error) {
      console.error("Error creating movie:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la película",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && !creating) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg">
                  <DialogHeader>
          <DialogTitle>Agregar Nueva Película</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Búsqueda de JustWatch */}
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
              <Label className="text-purple-700 font-medium">Búsqueda inteligente</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenJustWatchSearch(true)}
                className="border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300"
                disabled={creating}
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar en JustWatch
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="movieTitle">Título</Label>
            <Input
              id="movieTitle"
              value={newMovie.title}
              onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
              placeholder="Ej: El Rey León"
              disabled={creating}
            />
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="movieYear">Año</Label>
                <Input
                  id="movieYear"
                  type="number"
                  value={newMovie.year}
                  onChange={(e) => setNewMovie({ ...newMovie, year: Number.parseInt(e.target.value) || new Date().getFullYear() })}
                  disabled={creating}
                />
              </div>

              <div>
                <Label htmlFor="watchDate">Fecha para ver</Label>
                <Input
                  id="watchDate"
                  type="date"
                  value={newMovie.watch_date}
                  onChange={(e) => setNewMovie({ ...newMovie, watch_date: e.target.value })}
                  disabled={creating}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="streamingLink">Enlace de streaming (opcional)</Label>
              <Input
                id="streamingLink"
                value={newMovie.disney_plus_link}
                onChange={(e) => setNewMovie({ ...newMovie, disney_plus_link: e.target.value })}
                placeholder="https://justwatch.com/... o https://disneyplus.com/..."
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enlace a Disney+, JustWatch u otra plataforma de streaming
              </p>
            </div>

            <div>
              <Label htmlFor="movieNotes">Notas</Label>
              <Textarea
                id="movieNotes"
                value={newMovie.notes}
                onChange={(e) => setNewMovie({ ...newMovie, notes: e.target.value })}
                placeholder="¿Por qué quieres ver esta película?"
                disabled={creating}
              />
            </div>

            {/* Tags Section */}
            <div>
              <Label>Etiquetas</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenTagSelector(true)}
                  className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                  disabled={creating}
                >
                  <TagIcon className="w-4 h-4" />
                  {selectedTags.length > 0 ? `${selectedTags.length} seleccionadas` : "Seleccionar etiquetas"}
                </Button>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.map((tagId) => (
                    <Badge key={tagId} variant="secondary" className="text-xs">
                      Etiqueta seleccionada
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={handleAddMovie} 
              disabled={creating || !newMovie.title.trim()} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
            >
              {creating ? "Guardando..." : "Agregar Película"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Selector Dialog */}
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        open={openTagSelector}
        onOpenChange={setOpenTagSelector}
      />

      {/* JustWatch Search Dialog */}
      <JustWatchSearch
        open={openJustWatchSearch}
        onOpenChange={setOpenJustWatchSearch}
        onMovieSelect={handleJustWatchMovieSelect}
      />
    </>
  )
} 