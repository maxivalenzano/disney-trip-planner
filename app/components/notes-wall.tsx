"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StickyNote, Plus, Heart, Star, Sparkles, Trash2, Edit, MoreHorizontal, Tag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote as deleteNoteFromDB,
  updateNoteTags,
  type Note,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import TagSelector from "./tag-selector"

export default function NotesWall() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: "bg-purple-100 border-purple-300",
  })

  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openTagSelector, setOpenTagSelector] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)

  const colorOptions = [
    { name: "Púrpura", value: "bg-purple-100 border-purple-300" },
    { name: "Rosa", value: "bg-pink-100 border-pink-300" },
    { name: "Amarillo", value: "bg-yellow-100 border-yellow-300" },
    { name: "Azul", value: "bg-blue-100 border-blue-300" },
    { name: "Verde", value: "bg-green-100 border-green-300" },
    { name: "Naranja", value: "bg-orange-100 border-orange-300" },
  ]

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const data = await getNotes({ includeTags: true })
      setNotes(data || [])
    } catch (error) {
      console.error("Error loading notes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las notas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) return

    try {
      setCreating(true)
      const note = await createNote({
        title: newNote.title,
        content: newNote.content,
        color: newNote.color,
      })

      // Update tags if any selected
      if (selectedTags.length > 0) {
        await updateNoteTags(note.id, selectedTags)
      }

      // Reload notes to get updated data with tags
      await loadNotes()

      setNewNote({
        title: "",
        content: "",
        color: "bg-purple-100 border-purple-300",
      })
      setSelectedTags([])
      setOpenDialog(false)

      toast({
        title: "¡Nota creada!",
        description: `${note.title} se ha agregado al muro`,
      })
    } catch (error) {
      console.error("Error creating note:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la nota",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditNote = async () => {
    if (!editingNote || !editingNote.title || !editingNote.content) return

    try {
      setCreating(true)
      await updateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        color: editingNote.color,
      })

      // Update tags
      await updateNoteTags(editingNote.id, selectedTags)

      // Reload notes to get updated data with tags
      await loadNotes()

      setEditingNote(null)
      setSelectedTags([])
      setOpenDialog(false)

      toast({
        title: "¡Nota actualizada!",
        description: `${editingNote.title} se ha actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la nota",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note || !confirm(`¿Estás seguro de que quieres eliminar "${note.title}"?`)) {
      return
    }

    try {
      await deleteNoteFromDB(id)
      setNotes(notes.filter((note) => note.id !== id))

      toast({
        title: "Nota eliminada",
        description: "La nota se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (note: Note) => {
    setEditingNote({ ...note })
    setSelectedTags(note.tags?.map((tag) => tag.id) || [])
    setOpenDialog(true)
  }

  const openNewDialog = () => {
    setEditingNote(null)
    setSelectedTags([])
    setNewNote({
      title: "",
      content: "",
      color: "bg-purple-100 border-purple-300",
    })
    setOpenDialog(true)
  }

  const openTagsDialog = (note: Note) => {
    setCurrentNoteId(note.id)
    setSelectedTags(note.tags?.map((tag) => tag.id) || [])
    setOpenTagSelector(true)
  }

  const handleTagsUpdate = async (tagIds: string[]) => {
    if (!currentNoteId) return

    try {
      await updateNoteTags(currentNoteId, tagIds)
      await loadNotes() // Reload to get updated tags

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-purple-700">Muro de Notas</h2>
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </div>
        <Button onClick={openNewDialog} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Nota
        </Button>
      </div>

      {/* Dialog para Nota */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Editar Nota" : "Crear Nueva Nota"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="noteTitle">Título</Label>
              <Input
                id="noteTitle"
                value={editingNote ? editingNote.title : newNote.title}
                onChange={(e) =>
                  editingNote
                    ? setEditingNote({ ...editingNote, title: e.target.value })
                    : setNewNote({ ...newNote, title: e.target.value })
                }
                placeholder="Ej: Ideas para nuestro viaje"
              />
            </div>

            <div>
              <Label htmlFor="noteContent">Contenido</Label>
              <Textarea
                id="noteContent"
                value={editingNote ? editingNote.content : newNote.content}
                onChange={(e) =>
                  editingNote
                    ? setEditingNote({ ...editingNote, content: e.target.value })
                    : setNewNote({ ...newNote, content: e.target.value })
                }
                placeholder="Escribe tus ideas, recuerdos o planes..."
                rows={4}
              />
            </div>

            <div>
              <Label>Color de la nota</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      editingNote
                        ? setEditingNote({ ...editingNote, color: color.value })
                        : setNewNote({ ...newNote, color: color.value })
                    }
                    className={`p-3 rounded border-2 ${color.value} ${
                      (editingNote ? editingNote.color : newNote.color) === color.value ? "ring-2 ring-purple-500" : ""
                    }`}
                  >
                    <div className="text-xs font-medium">{color.name}</div>
                  </button>
                ))}
              </div>
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

            <Button onClick={editingNote ? handleEditNote : handleAddNote} disabled={creating} className="w-full">
              {creating ? "Guardando..." : editingNote ? "Actualizar Nota" : "Crear Nota"}
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

      {/* Tag Selector for existing notes */}
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={(tagIds) => {
          setSelectedTags(tagIds)
          if (currentNoteId) {
            handleTagsUpdate(tagIds)
            setOpenTagSelector(false)
            setCurrentNoteId(null)
          }
        }}
        open={openTagSelector && !!currentNoteId}
        onOpenChange={(open) => {
          setOpenTagSelector(open)
          if (!open) {
            setCurrentNoteId(null)
          }
        }}
      />

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="text-center py-12">
            <StickyNote className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-purple-700 mb-2">¡Su muro de notas está vacío!</h3>
            <p className="text-purple-600 mb-4">Comenzá a capturar sus ideas y recuerdos para el viaje mágico</p>
            <Button onClick={openNewDialog} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-4 h-4 mr-2" />
              Crear tu primera nota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id} className={`${note.color} relative group`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <StickyNote className="w-5 h-5" />
                    {note.title}
                  </CardTitle>
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
                      <DropdownMenuItem onClick={() => openTagsDialog(note)}>
                        <Tag className="w-4 h-4 mr-2" />
                        Etiquetas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(note)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>

                  {/* Tags Display */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs flex items-center gap-1 px-2 py-1">
                          <span className="text-sm">{tag.icon}</span>
                          <span>{tag.name}</span>
                          {tag.parent_name && <span className="text-gray-500">({tag.parent_name})</span>}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(note.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      <Star className="w-3 h-3 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
