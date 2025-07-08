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
  Tag,
  Calendar,
  Camera,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieTags,
  type Movie,
  uploadMoviePhoto,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import TagSelector from "./tag-selector"
import PhotoGallery from "./photo-gallery"

export default function MoviesTracker() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

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
  const [selectedMovieForPhotos, setSelectedMovieForPhotos] = useState<string | null>(null)

  useEffect(() => {
    loadMovies()
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

  const rateMovie = async (movie: Movie, rating: number) => {
    try {
      const updatedMovie = await updateMovie(movie.id, { rating })
      setMovies(movies.map((m) => (m.id === movie.id ? { ...m, rating: updatedMovie.rating } : m)))

      toast({
        title: "¡Calificación guardada!",
        description: `Le diste ${rating} estrellas a ${movie.title}`,
      })
    } catch (error) {
      console.error("Error rating movie:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
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

      // Upload each file
      const uploadPromises = Array.from(files).map((file) => uploadMoviePhoto(movieId, file))

      await Promise.all(uploadPromises)

      // Reload movies to get updated photos
      await loadMovies()

      toast({
        title: "¡Fotos subidas!",
        description: `Se ${files.length === 1 ? "subió 1 foto" : `subieron ${files.length} fotos`} correctamente`,
      })
    } catch (error) {
      console.error("Error uploading photos:", error)
      toast({
        title: "Error",
        description: "No se pudieron subir las fotos",
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
          <h2 className="text-2xl font-bold text-purple-700">Películas Disney</h2>
          <p className="text-sm text-gray-600">
            {movies.filter((m) => m.watched).length} de {movies.length} películas vistas (
            {Math.round((movies.filter((m) => m.watched).length / movies.length) * 100)}%)
          </p>
        </div>
        <Button onClick={openNewDialog} className="bg-gradient-to-r from-red-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Película
        </Button>
      </div>

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
                  <Tag className="w-4 h-4" />
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

      {/* Progress Bar */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Film className="w-8 h-8 text-purple-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso de visualización</span>
                <span>{Math.round((movies.filter((m) => m.watched).length / movies.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(movies.filter((m) => m.watched).length / movies.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movies List */}
      {movies.length === 0 ? (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="text-center py-12">
            <Film className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-purple-700 mb-2">¡No hay películas aún!</h3>
            <p className="text-purple-600 mb-4">Comienza agregando películas Disney para ver antes del viaje</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {movies.map((movie) => (
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
                          Programada para:{" "}
                          {new Date(movie.watch_date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
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

                    {/* Photo Gallery */}
                    {movie.photos && movie.photos.length > 0 && (
                      <div className="mb-3">
                        <PhotoGallery
                          photos={movie.photos}
                          onPhotosChange={loadMovies}
                          onAddPhoto={() => openPhotoUpload(movie.id)}
                        />
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openTagsDialog(movie)}>
                        <Tag className="w-4 h-4 mr-2" />
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
