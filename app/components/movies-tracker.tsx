"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Film,
  Plus,
  ExternalLink,
  Play,
  Check,
  Edit,
  Trash2,
  MoreHorizontal,
  TagIcon,
  Calendar,
  Camera,
  Images,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getMovies,
  updateMovie,
  deleteMovie,
  updateMovieTags,
  getTagsGrouped,
  type Movie,
  uploadMoviePhoto,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useFilterLogic } from "../hooks/use-filter-logic"
import TagSelector from "./tag-selector"
import PhotoGallery from "./photo-gallery"
import FilterButton from "./filter-button"
import FilterPanel from "./filter-panel"
import AddMovieDialog from "./add-movie-dialog"

export default function MoviesTracker() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const [allTags, setAllTags] = useState<any[]>([])

  // Use filter logic hook
  const {
    searchTerm,
    selectedFilterTags,
    statusFilter,
    sortBy,
    showPhotos,
    showFilters,
    filteredItems: filteredMovies,
    setSearchTerm,
    setSelectedFilterTags,
    setStatusFilter,
    setSortBy,
    setShowPhotos,
    setShowFilters,
    clearFilters,
  } = useFilterLogic({ items: movies, type: "movies" })

  // Photo viewer state
  const [selectedMoviePhotos, setSelectedMoviePhotos] = useState<{
    movieId: string
    photos: any[]
  } | null>(null)

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openTagSelector, setOpenTagSelector] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentMovieId, setCurrentMovieId] = useState<string | null>(null)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Rating dialog state
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [movieToRate, setMovieToRate] = useState<Movie | null>(null)
  const [jacquiRating, setJacquiRating] = useState<number>(0)
  const [maxiRating, setMaxiRating] = useState<number>(0)

  useEffect(() => {
    loadMovies()
    loadAllTags()
  }, [])

  const loadMovies = async () => {
    try {
      setLoading(true)
      const data = await getMovies()
      setMovies(data || [])
    } catch (error) {
      console.error("Error loading movies:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las películas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAllTags = async () => {
    try {
      const tagsGrouped = await getTagsGrouped()
      const flatTags = Object.values(tagsGrouped).flat()
      setAllTags(flatTags)
    } catch (error) {
      console.error("Error loading tags:", error)
    }
  }





  const handleEditMovie = async () => {
    if (!editingMovie || !editingMovie.title) return

    try {
      setCreating(true)
      await updateMovie(editingMovie.id, {
        title: editingMovie.title,
        year: editingMovie.year,
        disney_plus_link: editingMovie.disney_plus_link,
        notes: editingMovie.notes,
        watch_date: editingMovie.watch_date,
        priority: editingMovie.priority,
      })

      // Update tags
      await updateMovieTags(editingMovie.id, selectedTags)

      // Reload movies to get updated data with tags
      await loadMovies()

      setEditingMovie(null)
      setSelectedTags([])
      setOpenEditDialog(false)

      toast({
        title: "¡Película actualizada!",
        description: `${editingMovie.title} se ha actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error updating movie:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la película",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteMovie = async (movie: Movie) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${movie.title}"?`)) {
      return
    }

    try {
      await deleteMovie(movie.id)
      setMovies(movies.filter((m) => m.id !== movie.id))

      toast({
        title: "Película eliminada",
        description: `${movie.title} se ha eliminado correctamente`,
      })
    } catch (error) {
      console.error("Error deleting movie:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la película",
        variant: "destructive",
      })
    }
  }

  const toggleWatched = async (movie: Movie) => {
    try {
      // Si se está marcando como vista y no tiene valoraciones personales, abrir diálogo
      if (!movie.watched && !movie.jacqui_rating && !movie.maxi_rating) {
        setMovieToRate(movie)
        setJacquiRating(0)
        setMaxiRating(0)
        setRatingDialogOpen(true)
        return
      }

      const updatedMovie = await updateMovie(movie.id, {
        watched: !movie.watched,
      })

      setMovies(movies.map((m) => (m.id === movie.id ? { ...m, watched: updatedMovie.watched } : m)))

      toast({
        title: movie.watched ? "Película desmarcada" : "¡Película vista!",
        description: `${movie.title} ${movie.watched ? "se desmarcó como vista" : "se marcó como vista"}`,
      })
    } catch (error) {
      console.error("Error updating movie:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la película",
        variant: "destructive",
      })
    }
  }

  const handleOpenEditDialog = (movie: Movie) => {
    setEditingMovie({ ...movie })
    setSelectedTags(movie.tags?.map((tag) => tag.id) || [])
    setOpenEditDialog(true)
  }

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true)
  }

  const openTagsDialog = (movie: Movie) => {
    setCurrentMovieId(movie.id)
    setSelectedTags(movie.tags?.map((tag) => tag.id) || [])
    setOpenTagSelector(true)
  }

  const handleTagsUpdate = async (tagIds: string[]) => {
    if (!currentMovieId) return

    try {
      await updateMovieTags(currentMovieId, tagIds)
      await loadMovies() // Reload to get updated tags

      toast({
        title: "¡Etiquetas actualizadas!",
        description: "Las etiquetas se han actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating tags:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar las etiquetas",
        variant: "destructive",
      })
    }
  }

  const handlePhotoUpload = async (movieId: string, files: FileList) => {
    if (!files || files.length === 0) return

    try {
      setUploadingPhoto(true)

      // Validar archivos antes de subir
      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Archivo no válido",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive",
          })
          return false
        }

        if (file.size > 10485760) {
          // 10MB
          toast({
            title: "Archivo muy grande",
            description: `${file.name} es demasiado grande (máximo 10MB)`,
            variant: "destructive",
          })
          return false
        }

        return true
      })

      if (validFiles.length === 0) {
        toast({
          title: "Sin archivos válidos",
          description: "No se encontraron imágenes válidas para subir",
          variant: "destructive",
        })
        return
      }

      // Upload each valid file
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          return await uploadMoviePhoto(movieId, file)
        } catch (error) {
          console.error(`Error uploading file ${index + 1}:`, error)
          toast({
            title: `Error subiendo ${file.name}`,
            description: error instanceof Error ? error.message : "Error desconocido",
            variant: "destructive",
          })
          throw error
        }
      })

      // Esperar a que se suban todas las fotos
      const results = await Promise.allSettled(uploadPromises)

      const successful = results.filter((result) => result.status === "fulfilled").length
      const failed = results.filter((result) => result.status === "rejected").length

      // Reload movies to get updated photos
      await loadMovies()

      if (successful > 0) {
        toast({
          title: "¡Fotos subidas!",
          description: `Se ${successful === 1 ? "subió 1 foto" : `subieron ${successful} fotos`} correctamente${failed > 0 ? ` (${failed} fallaron)` : ""}`,
        })
      }

      if (failed > 0 && successful === 0) {
        toast({
          title: "Error al subir fotos",
          description: "No se pudo subir ninguna foto. Verifica tu conexión y configuración.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading photos:", error)

      let errorMessage = "No se pudieron subir las fotos"

      if (error instanceof Error) {
        if (error.message.includes("bucket")) {
          errorMessage = "El almacenamiento no está configurado. Contacta al administrador."
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Error de conexión. Verifica tu internet e intenta de nuevo."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const openPhotoUpload = (movieId: string) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        handlePhotoUpload(movieId, files)
      }
    }
    input.click()
  }

  const openPhotoViewer = (movie: Movie) => {
    setSelectedMoviePhotos({
      movieId: movie.id,
      photos: movie.photos || [],
    })
  }

  const closePhotoViewer = () => {
    setSelectedMoviePhotos(null)
  }

  const handleRatingSubmit = async () => {
    if (!movieToRate) return

    try {
      const updatedMovie = await updateMovie(movieToRate.id, {
        watched: true,
        jacqui_rating: jacquiRating > 0 ? jacquiRating : undefined,
        maxi_rating: maxiRating > 0 ? maxiRating : undefined,
      })

      setMovies(movies.map((m) => (m.id === movieToRate.id ? {
        ...m,
        watched: true,
        jacqui_rating: updatedMovie.jacqui_rating,
        maxi_rating: updatedMovie.maxi_rating
      } : m)))

      setRatingDialogOpen(false)
      setMovieToRate(null)
      setJacquiRating(0)
      setMaxiRating(0)

      toast({
        title: "¡Película calificada!",
        description: `${movieToRate.title} se marcó como vista con sus valoraciones`,
      })
    } catch (error) {
      console.error("Error updating movie ratings:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las valoraciones",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return "Sin prioridad"
    }
  }



  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-700">Películas y Documentales</h2>
        </div>
        <div className="flex gap-2">
          <FilterButton
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedFilterTags={selectedFilterTags}
            onFilterTagsChange={setSelectedFilterTags}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            showPhotos={showPhotos}
            onShowPhotosChange={setShowPhotos}
            allTags={allTags}
            type="movies"
            showFilters={showFilters}
            onShowFiltersChange={setShowFilters}
          />
          <Button
            onClick={handleOpenAddDialog}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel - aparece en su propia fila */}
      <FilterPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFilterTags={selectedFilterTags}
        onFilterTagsChange={setSelectedFilterTags}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        showPhotos={showPhotos}
        onShowPhotosChange={setShowPhotos}
        allTags={allTags}
        type="movies"
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
      />



      {/* Dialog para Agregar Película */}
      <AddMovieDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onMovieAdded={loadMovies}
      />

      {/* Dialog para Editar Película */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Película</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="movieTitle">Título</Label>
              <Input
                id="movieTitle"
                value={editingMovie?.title || ""}
                onChange={(e) =>
                  setEditingMovie(editingMovie ? { ...editingMovie, title: e.target.value } : null)
                }
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
                  value={editingMovie?.year || ""}
                  onChange={(e) =>
                    setEditingMovie(editingMovie ? { ...editingMovie, year: Number.parseInt(e.target.value) || undefined } : null)
                  }
                  disabled={creating}
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <select
                  id="priority"
                  value={editingMovie?.priority || "medium"}
                  onChange={(e) =>
                    setEditingMovie(editingMovie ? { ...editingMovie, priority: e.target.value as "high" | "medium" | "low" } : null)
                  }
                  disabled={creating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="watchDate">Fecha para ver</Label>
              <Input
                id="watchDate"
                type="date"
                value={editingMovie?.watch_date || ""}
                onChange={(e) =>
                  setEditingMovie(editingMovie ? { ...editingMovie, watch_date: e.target.value } : null)
                }
                disabled={creating}
              />
            </div>

            <div>
              <Label htmlFor="streamingLink">Enlace de streaming (opcional)</Label>
              <Input
                id="streamingLink"
                value={editingMovie?.disney_plus_link || ""}
                onChange={(e) =>
                  setEditingMovie(editingMovie ? { ...editingMovie, disney_plus_link: e.target.value } : null)
                }
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
                value={editingMovie?.notes || ""}
                onChange={(e) =>
                  setEditingMovie(editingMovie ? { ...editingMovie, notes: e.target.value } : null)
                }
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
              onClick={handleEditMovie}
              disabled={creating || !editingMovie?.title?.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
            >
              {creating ? "Guardando..." : "Actualizar Película"}
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

      {/* Tag Selector for existing movies */}
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={(tagIds) => {
          setSelectedTags(tagIds)
          if (currentMovieId) {
            handleTagsUpdate(tagIds)
            setOpenTagSelector(false)
            setCurrentMovieId(null)
          }
        }}
        open={openTagSelector && !!currentMovieId}
        onOpenChange={(open) => {
          setOpenTagSelector(open)
          if (!open) {
            setCurrentMovieId(null)
          }
        }}
      />



      {/* Photo Viewer Dialog */}
      {selectedMoviePhotos && (
        <Dialog open={!!selectedMoviePhotos} onOpenChange={closePhotoViewer}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Fotos de la Película</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <PhotoGallery
                photos={selectedMoviePhotos.photos}
                onPhotosChange={loadMovies}
                onAddPhoto={() => openPhotoUpload(selectedMoviePhotos.movieId)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">¡Calificar Película!</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg text-purple-700 mb-2">
                {movieToRate?.title}
              </h3>
              <p className="text-sm text-gray-600">
                ¿Cómo calificarían esta película? (1-10)
              </p>
            </div>

            {/* Jacqui Rating */}
            <div className="space-y-2">
              <Label className="font-medium text-pink-600">Valoración de Jacqui</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={jacquiRating}
                  onChange={(e) => setJacquiRating(Number(e.target.value))}
                  className="flex-1 h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer slider-pink"
                />
                <span className="text-sm text-gray-500 w-6">10</span>
                <div className="w-12 text-center">
                  <Badge variant="outline" className="border-pink-200 text-pink-700 bg-pink-50">
                    {jacquiRating > 0 ? jacquiRating.toFixed(1) : "-"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Maxi Rating */}
            <div className="space-y-2">
              <Label className="font-medium text-blue-600">Valoración de Maxi</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={maxiRating}
                  onChange={(e) => setMaxiRating(Number(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-blue"
                />
                <span className="text-sm text-gray-500 w-6">10</span>
                <div className="w-12 text-center">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {maxiRating > 0 ? maxiRating.toFixed(1) : "-"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setRatingDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRatingSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Guardar y marcar como vista
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Bar */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Film className="w-8 h-8 text-purple-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-purple-700">
                  {filteredMovies.filter((m) => m.watched).length} de {filteredMovies.length} películas vistas
                </span>
                <span className="font-bold text-purple-600">
                  {filteredMovies.length > 0
                    ? Math.round((filteredMovies.filter((m) => m.watched).length / filteredMovies.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${filteredMovies.length > 0
                      ? (filteredMovies.filter((m) => m.watched).length / filteredMovies.length) * 100
                      : 0
                      }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movies List */}
      {filteredMovies.length === 0 ? (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="text-center py-12">
            <Film className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-purple-700 mb-2">
              {movies.length === 0 ? "¡No hay películas aún!" : "No se encontraron películas"}
            </h3>
            <p className="text-purple-600 mb-4">
              {movies.length === 0
                ? "Comenzá agregando películas de Disney para ver antes del viaje"
                : "Intentá ajustar los filtros para encontrar lo que buscás"}
            </p>
            {movies.length > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMovies.map((movie) => (
            <Card
              key={movie.id}
              className={`${movie.watched ? "bg-green-50 border-green-200" : "bg-white hover:bg-purple-50/50 hover:border-purple-200"} group border border-gray-200 transition-colors duration-200`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Checkbox
                      checked={movie.watched}
                      onCheckedChange={() => toggleWatched(movie)}
                      className="mt-0 flex-shrink-0"
                    />
                    <h3 className={`font-semibold text-base sm:text-lg leading-tight ${movie.watched ? "line-through text-gray-600" : "text-gray-800"}`}>
                      {movie.title}
                    </h3>
                    {movie.year && (
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-300 text-gray-600 bg-gray-50 flex-shrink-0"
                      >
                        {movie.year}
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-8 p-0 mr-2 ml-2 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                        aria-label={`Opciones para ${movie.title}`}
                      >
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(movie.priority)}`}
                        >
                          {getPriorityLabel(movie.priority)}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                      <DropdownMenuItem onClick={() => openTagsDialog(movie)}>
                        <TagIcon className="w-4 h-4 mr-2" />
                        Etiquetas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPhotoUpload(movie.id)} disabled={uploadingPhoto}>
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadingPhoto ? "Subiendo..." : "Agregar fotos"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEditDialog(movie)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteMovie(movie)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Ratings Section */}
                {(movie.imdb_score || movie.jacqui_rating || movie.maxi_rating) && (
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {movie.imdb_score && (
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                        ⭐ {movie.imdb_score.toFixed(1)}
                      </Badge>
                    )}
                    {movie.jacqui_rating && (
                      <Badge variant="outline" className="text-xs border-pink-200 text-pink-700 bg-pink-50">
                        💖 J: {movie.jacqui_rating.toFixed(1)}
                      </Badge>
                    )}
                    {movie.maxi_rating && (
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                        🎬 M: {movie.maxi_rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Notas */}
                {movie.notes && (
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{movie.notes}</p>
                )}

                {/* Watch Date */}
                {movie.watch_date && (
                  <div className="flex items-center gap-1 mb-3">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">
                      {new Date(movie.watch_date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {/* Tags Display */}
                {movie.tags && movie.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs flex items-center gap-1 px-2 py-1 border-purple-200 text-purple-700 bg-purple-50"
                      >
                        <span className="text-sm">{tag.icon}</span>
                        <span>{tag.name}</span>
                        {tag.parent_name && <span className="text-gray-500">({tag.parent_name})</span>}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Photo Display cuando showPhotos es true */}
                {movie.photos && movie.photos.length > 0 && showPhotos && (
                  <div className="mb-3">
                    <PhotoGallery
                      photos={movie.photos}
                      onPhotosChange={loadMovies}
                      onAddPhoto={() => openPhotoUpload(movie.id)}
                    />
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-1">
                  {/* Botón de fotos cuando showPhotos es false */}
                  {movie.photos && movie.photos.length > 0 && !showPhotos && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPhotoViewer(movie)}
                      className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:border-purple-300 shadow-sm"
                    >
                      <Images className="w-4 h-4" />
                      <span>
                        {movie.photos.length} {movie.photos.length === 1 ? "foto" : "fotos"}
                      </span>
                    </Button>
                  )}

                  {movie.disney_plus_link && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm"
                    >
                      <a href={movie.disney_plus_link} target="_blank" rel="noopener noreferrer">
                        <Play className="w-3 h-3 mr-1" />
                        {movie.disney_plus_link.includes('justwatch.com') ? 'JustWatch' :
                          movie.disney_plus_link.includes('disneyplus.com') ? 'Disney+' :
                            'Ver online'}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
