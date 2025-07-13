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
import { Switch } from "@/components/ui/switch"
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
  Search,
  Filter,
  X,
  Images,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieTags,
  getTagsGrouped,
  type Movie,
  uploadMoviePhoto,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import TagSelector from "./tag-selector"
import PhotoGallery from "./photo-gallery"

export default function MoviesTracker() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [showPhotos, setShowPhotos] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [allTags, setAllTags] = useState<any[]>([])

  // Photo viewer state
  const [selectedMoviePhotos, setSelectedMoviePhotos] = useState<{
    movieId: string
    photos: any[]
  } | null>(null)

  const [newMovie, setNewMovie] = useState({
    title: "",
    year: new Date().getFullYear(),
    disney_plus_link: "",
    notes: "",
    watch_date: "",
  })

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openTagSelector, setOpenTagSelector] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentMovieId, setCurrentMovieId] = useState<string | null>(null)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    loadMovies()
    loadAllTags()
  }, [])

  useEffect(() => {
    filterMovies()
  }, [movies, searchTerm, selectedFilterTags])

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

  const filterMovies = () => {
    let filtered = movies

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tags
    if (selectedFilterTags.length > 0) {
      filtered = filtered.filter((movie) => movie.tags?.some((tag) => selectedFilterTags.includes(tag.id)))
    }

    setFilteredMovies(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedFilterTags([])
  }

  const handleAddMovie = async () => {
    if (!newMovie.title) return

    try {
      setCreating(true)
      const movie = await createMovie({
        title: newMovie.title,
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

      // Reload movies to get updated data with tags
      await loadMovies()

      setNewMovie({
        title: "",
        year: new Date().getFullYear(),
        disney_plus_link: "",
        notes: "",
        watch_date: "",
      })
      setSelectedTags([])
      setOpenDialog(false)

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
      })

      // Update tags
      await updateMovieTags(editingMovie.id, selectedTags)

      // Reload movies to get updated data with tags
      await loadMovies()

      setEditingMovie(null)
      setSelectedTags([])
      setOpenDialog(false)

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

  const openEditDialog = (movie: Movie) => {
    setEditingMovie({ ...movie })
    setSelectedTags(movie.tags?.map((tag) => tag.id) || [])
    setOpenDialog(true)
  }

  const openNewDialog = () => {
    setEditingMovie(null)
    setSelectedTags([])
    setNewMovie({
      title: "",
      year: new Date().getFullYear(),
      disney_plus_link: "",
      notes: "",
      watch_date: "",
    })
    setOpenDialog(true)
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

  const getFilteredTagsForDisplay = () => {
    return selectedFilterTags.map((tagId) => allTags.find((tag) => tag.id === tagId)).filter(Boolean) as any[]
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
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {(searchTerm || selectedFilterTags.length > 0) && (
              <Badge variant="secondary" className="ml-1">
                {(searchTerm ? 1 : 0) + selectedFilterTags.length}
              </Badge>
            )}
          </Button>
          <Button onClick={openNewDialog} className="bg-gradient-to-r from-red-500 to-pink-500">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Filtros</h3>
              {(searchTerm || selectedFilterTags.length > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscá por título o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Filtrar por etiquetas</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedFilterTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => {
                      if (selectedFilterTags.includes(tag.id)) {
                        setSelectedFilterTags(selectedFilterTags.filter((id) => id !== tag.id))
                      } else {
                        setSelectedFilterTags([...selectedFilterTags, tag.id])
                      }
                    }}
                  >
                    <span className="text-xs">{tag.icon}</span>
                    <span>{tag.name}</span>
                    {tag.parent_name && <span className="text-gray-500 text-xs">({tag.parent_name})</span>}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedFilterTags.length > 0) && (
              <div className="pt-2 border-t">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-600">Filtros activos:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Search className="w-3 h-3" />"{searchTerm}"
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}
                  {getFilteredTagsForDisplay().map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                      <span className="text-xs">{tag.icon}</span>
                      {tag.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedFilterTags(selectedFilterTags.filter((id) => id !== tag.id))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Display Toggle */}
            <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
              <Images className="w-4 h-4" />
              <Label htmlFor="show-photos" className="text-sm">
                Mostrar fotos
              </Label>
              <Switch id="show-photos" checked={showPhotos} onCheckedChange={setShowPhotos} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Película */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMovie ? "Editar Película" : "Agregar Nueva Película"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="movieTitle">Título</Label>
              <Input
                id="movieTitle"
                value={editingMovie ? editingMovie.title : newMovie.title}
                onChange={(e) =>
                  editingMovie
                    ? setEditingMovie({ ...editingMovie, title: e.target.value })
                    : setNewMovie({ ...newMovie, title: e.target.value })
                }
                placeholder="Ej: El Rey León"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="movieYear">Año</Label>
                <Input
                  id="movieYear"
                  type="number"
                  value={editingMovie ? editingMovie.year || "" : newMovie.year}
                  onChange={(e) =>
                    editingMovie
                      ? setEditingMovie({ ...editingMovie, year: Number.parseInt(e.target.value) || undefined })
                      : setNewMovie({ ...newMovie, year: Number.parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="watchDate">Fecha para ver</Label>
                <Input
                  id="watchDate"
                  type="date"
                  value={editingMovie ? editingMovie.watch_date || "" : newMovie.watch_date}
                  onChange={(e) =>
                    editingMovie
                      ? setEditingMovie({ ...editingMovie, watch_date: e.target.value })
                      : setNewMovie({ ...newMovie, watch_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="disneyLink">Enlace Disney+ (opcional)</Label>
              <Input
                id="disneyLink"
                value={editingMovie ? editingMovie.disney_plus_link || "" : newMovie.disney_plus_link}
                onChange={(e) =>
                  editingMovie
                    ? setEditingMovie({ ...editingMovie, disney_plus_link: e.target.value })
                    : setNewMovie({ ...newMovie, disney_plus_link: e.target.value })
                }
                placeholder="https://disneyplus.com/..."
              />
            </div>

            <div>
              <Label htmlFor="movieNotes">Notas</Label>
              <Textarea
                id="movieNotes"
                value={editingMovie ? editingMovie.notes || "" : newMovie.notes}
                onChange={(e) =>
                  editingMovie
                    ? setEditingMovie({ ...editingMovie, notes: e.target.value })
                    : setNewMovie({ ...newMovie, notes: e.target.value })
                }
                placeholder="¿Por qué quieres ver esta película?"
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
                  className="flex items-center gap-2"
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

            <Button onClick={editingMovie ? handleEditMovie : handleAddMovie} disabled={creating} className="w-full">
              {creating ? "Guardando..." : editingMovie ? "Actualizar Película" : "Agregar Película"}
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
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMovies.map((movie) => (
            <Card key={movie.id} className={`${movie.watched ? "bg-green-50 border-green-200" : "bg-white"} group`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox checked={movie.watched} onCheckedChange={() => toggleWatched(movie)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${movie.watched ? "line-through text-gray-600" : ""}`}>
                        {movie.title}
                      </h3>
                      {movie.year && <Badge variant="outline">{movie.year}</Badge>}
                      {movie.watched && <Check className="w-4 h-4 text-green-600" />}
                    </div>

                    {movie.notes && <p className="text-sm text-gray-600 mb-2">{movie.notes}</p>}

                    {/* Watch Date */}
                    {movie.watch_date && (
                      <div className="flex items-center gap-1 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-600 font-medium">
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
                      <div className="flex flex-wrap gap-1 mb-2">
                        {movie.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs flex items-center gap-1 px-2 py-1">
                            <span className="text-sm">{tag.icon}</span>
                            <span>{tag.name}</span>
                            {tag.parent_name && <span className="text-gray-500">({tag.parent_name})</span>}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Photo Display */}
                    {movie.photos && movie.photos.length > 0 && (
                      <div className="mb-3">
                        {showPhotos ? (
                          <PhotoGallery
                            photos={movie.photos}
                            onPhotosChange={loadMovies}
                            onAddPhoto={() => openPhotoUpload(movie.id)}
                          />
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPhotoViewer(movie)}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                          >
                            <Images className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700">
                              {movie.photos.length} {movie.photos.length === 1 ? "foto" : "fotos"}
                            </span>
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {movie.disney_plus_link && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={movie.disney_plus_link} target="_blank" rel="noopener noreferrer">
                            <Play className="w-3 h-3 mr-1" />
                            Disney+
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openTagsDialog(movie)}>
                        <TagIcon className="w-4 h-4 mr-2" />
                        Etiquetas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPhotoUpload(movie.id)} disabled={uploadingPhoto}>
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadingPhoto ? "Subiendo..." : "Agregar fotos"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(movie)}>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
