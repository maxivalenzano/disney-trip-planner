"use client"

import { X, ChevronLeft, ChevronRight, Edit, Trash2, Camera, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { type MoviePhoto, updateMoviePhotoCaption, deleteMoviePhoto } from "@/lib/supabase"

interface PhotoGalleryProps {
  photos: MoviePhoto[]
  onPhotosChange: () => void
  onAddPhoto: () => void
}

export default function PhotoGallery({ photos, onPhotosChange, onAddPhoto }: PhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [captionText, setCaptionText] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const openPhoto = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const closePhoto = () => {
    setSelectedPhotoIndex(null)
    setEditingCaption(null)
  }

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1)
    }
  }

  const startEditingCaption = (photo: MoviePhoto) => {
    setEditingCaption(photo.id)
    setCaptionText(photo.caption || "")
  }

  const saveCaption = async (photoId: string) => {
    try {
      setLoading(true)
      await updateMoviePhotoCaption(photoId, captionText)
      setEditingCaption(null)
      onPhotosChange()
      toast({
        title: "¡Descripción actualizada!",
        description: "La descripción de la foto se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error updating caption:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la descripción",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      return
    }

    try {
      setLoading(true)
      await deleteMoviePhoto(photoId)
      onPhotosChange()
      closePhoto()
      toast({
        title: "Foto eliminada",
        description: "La foto se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedPhotoIndex === null) return

    if (e.key === "ArrowLeft") {
      prevPhoto()
    } else if (e.key === "ArrowRight") {
      nextPhoto()
    } else if (e.key === "Escape") {
      closePhoto()
    }
  }

  // Add keyboard event listener
  useState(() => {
    if (selectedPhotoIndex !== null) {
      document.addEventListener("keydown", handleKeyDown as any)
      return () => document.removeEventListener("keydown", handleKeyDown as any)
    }
  })

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-3">¡No hay fotos aún!</p>
        <p className="text-sm text-gray-500 mb-4">Captura los momentos mágicos cuando veas esta película</p>
        <Button onClick={onAddPhoto} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          Agregar primera foto
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => openPhoto(index)}
          >
            <img
              src={photo.photo_url || "/placeholder.svg"}
              alt={photo.caption || `Foto ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-1 left-1 right-1">
              {photo.caption && (
                <p className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate">{photo.caption}</p>
              )}
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        <div
          onClick={onAddPhoto}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors group"
        >
          <Plus className="w-6 h-6 text-gray-400 group-hover:text-purple-500 mb-1" />
          <span className="text-xs text-gray-500 group-hover:text-purple-600">Agregar</span>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={closePhoto}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black/95">
          {selectedPhotoIndex !== null && (
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {selectedPhotoIndex + 1} de {photos.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingCaption(photos[selectedPhotoIndex])}
                      className="text-white hover:bg-white/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePhoto(photos[selectedPhotoIndex].id)}
                      className="text-white hover:bg-white/20"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={closePhoto} className="text-white hover:bg-white/20">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Photo */}
              <div className="flex-1 flex items-center justify-center p-4">
                <img
                  src={photos[selectedPhotoIndex].photo_url || "/placeholder.svg"}
                  alt={photos[selectedPhotoIndex].caption || `Foto ${selectedPhotoIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevPhoto}
                    disabled={selectedPhotoIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPhoto}
                    disabled={selectedPhotoIndex === photos.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                {editingCaption === photos[selectedPhotoIndex].id ? (
                  <div className="space-y-2">
                    <Label htmlFor="caption" className="text-white text-sm">
                      Descripción de la foto
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="caption"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="Describe este momento mágico..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                      <Button
                        onClick={() => saveCaption(photos[selectedPhotoIndex].id)}
                        disabled={loading}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Guardar
                      </Button>
                      <Button
                        onClick={() => setEditingCaption(null)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  photos[selectedPhotoIndex].caption && (
                    <p className="text-white text-center bg-black/30 px-4 py-2 rounded-lg">
                      {photos[selectedPhotoIndex].caption}
                    </p>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
