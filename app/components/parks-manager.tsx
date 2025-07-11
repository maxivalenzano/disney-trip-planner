"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Plus, MapPin, Clock, Heart, Zap, Users, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getParks,
  createPark,
  createAttraction,
  updatePark,
  updateAttraction,
  deletePark,
  deleteAttraction,
  type Park,
  type Attraction,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ParksManager() {
  const [parks, setParks] = useState<Park[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const [newPark, setNewPark] = useState({
    name: "",
    icon: "",
    color: "from-blue-400 to-purple-500",
  })

  const [editingPark, setEditingPark] = useState<Park | null>(null)

  const [newAttraction, setNewAttraction] = useState({
    name: "",
    type: "ride" as const,
    priority: "medium" as const,
    notes: "",
    parkId: "",
  })

  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null)

  const [openParkDialog, setOpenParkDialog] = useState(false)
  const [openAttractionDialog, setOpenAttractionDialog] = useState(false)

  useEffect(() => {
    loadParks()
  }, [])

  const loadParks = async () => {
    try {
      setLoading(true)
      const data = await getParks()
      setParks(data || [])
    } catch (error) {
      console.error("Error loading parks:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los parques",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPark = async () => {
    if (!newPark.name) return

    try {
      setCreating(true)
      const park = await createPark({
        name: newPark.name,
        icon: newPark.icon || "🎢",
        color: newPark.color,
      })

      setParks([...parks, { ...park, attractions: [] }])
      setNewPark({ name: "", icon: "", color: "from-blue-400 to-purple-500" })
      setOpenParkDialog(false)

      toast({
        title: "¡Parque creado!",
        description: `${park.name} se ha agregado correctamente`,
      })
    } catch (error) {
      console.error("Error creating park:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el parque",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditPark = async () => {
    if (!editingPark || !editingPark.name) return

    try {
      setCreating(true)
      const updatedPark = await updatePark(editingPark.id, {
        name: editingPark.name,
        icon: editingPark.icon,
        color: editingPark.color,
      })

      setParks(parks.map((p) => (p.id === editingPark.id ? { ...updatedPark, attractions: p.attractions } : p)))
      setEditingPark(null)
      setOpenParkDialog(false)

      toast({
        title: "¡Parque actualizado!",
        description: `${updatedPark.name} se ha actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error updating park:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el parque",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePark = async (park: Park) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${park.name}? Esto también eliminará todas sus atracciones.`)) {
      return
    }

    try {
      await deletePark(park.id)
      setParks(parks.filter((p) => p.id !== park.id))

      toast({
        title: "Parque eliminado",
        description: `${park.name} se ha eliminado correctamente`,
      })
    } catch (error) {
      console.error("Error deleting park:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el parque",
        variant: "destructive",
      })
    }
  }

  const handleAddAttraction = async () => {
    if (!newAttraction.name || !newAttraction.parkId) return

    try {
      setCreating(true)
      const attraction = await createAttraction({
        park_id: newAttraction.parkId,
        name: newAttraction.name,
        type: newAttraction.type,
        priority: newAttraction.priority,
        notes: newAttraction.notes,
      })

      setParks(
        parks.map((park) =>
          park.id === newAttraction.parkId ? { ...park, attractions: [...(park.attractions || []), attraction] } : park,
        ),
      )

      setNewAttraction({
        name: "",
        type: "ride",
        priority: "medium",
        notes: "",
        parkId: "",
      })
      setOpenAttractionDialog(false)

      toast({
        title: "¡Atracción agregada!",
        description: `${attraction.name} se ha agregado correctamente`,
      })
    } catch (error) {
      console.error("Error creating attraction:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la atracción",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditAttraction = async () => {
    if (!editingAttraction || !editingAttraction.name) return

    try {
      setCreating(true)
      const updatedAttraction = await updateAttraction(editingAttraction.id, {
        name: editingAttraction.name,
        type: editingAttraction.type,
        priority: editingAttraction.priority,
        notes: editingAttraction.notes,
      })

      setParks(
        parks.map((park) => ({
          ...park,
          attractions: park.attractions?.map((a) => (a.id === editingAttraction.id ? updatedAttraction : a)),
        })),
      )

      setEditingAttraction(null)
      setOpenAttractionDialog(false)

      toast({
        title: "¡Atracción actualizada!",
        description: `${updatedAttraction.name} se ha actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error updating attraction:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la atracción",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAttraction = async (attraction: Attraction) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${attraction.name}?`)) {
      return
    }

    try {
      await deleteAttraction(attraction.id)
      setParks(
        parks.map((park) => ({
          ...park,
          attractions: park.attractions?.filter((a) => a.id !== attraction.id),
        })),
      )

      toast({
        title: "Atracción eliminada",
        description: `${attraction.name} se ha eliminado correctamente`,
      })
    } catch (error) {
      console.error("Error deleting attraction:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la atracción",
        variant: "destructive",
      })
    }
  }

  const openEditParkDialog = (park: Park) => {
    setEditingPark({ ...park })
    setOpenParkDialog(true)
  }

  const openNewParkDialog = () => {
    setEditingPark(null)
    setNewPark({ name: "", icon: "", color: "from-blue-400 to-purple-500" })
    setOpenParkDialog(true)
  }

  const openEditAttractionDialog = (attraction: Attraction) => {
    setEditingAttraction({ ...attraction })
    setOpenAttractionDialog(true)
  }

  const openNewAttractionDialog = (parkId: string) => {
    setEditingAttraction(null)
    setNewAttraction({
      name: "",
      type: "ride",
      priority: "medium",
      notes: "",
      parkId,
    })
    setOpenAttractionDialog(true)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Heart className="w-4 h-4 text-red-500" />
      case "medium":
        return <Star className="w-4 h-4 text-yellow-500" />
      case "low":
        return <Clock className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ride":
        return <Zap className="w-4 h-4 text-purple-500" />
      case "show":
        return <Users className="w-4 h-4 text-blue-500" />
      case "restaurant":
        return "🍽️"
      case "shop":
        return "🛍️"
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        <h2 className="text-2xl font-bold text-purple-700">Parques y Atracciones</h2>
        <Button onClick={openNewParkDialog} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Parque
        </Button>
      </div>

      {/* Dialog para Parque */}
      <Dialog open={openParkDialog} onOpenChange={setOpenParkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPark ? "Editar Parque" : "Agregar Nuevo Parque"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="parkName">Nombre del Parque</Label>
              <Input
                id="parkName"
                value={editingPark ? editingPark.name : newPark.name}
                onChange={(e) =>
                  editingPark
                    ? setEditingPark({ ...editingPark, name: e.target.value })
                    : setNewPark({ ...newPark, name: e.target.value })
                }
                placeholder="Ej: Magic Kingdom"
              />
            </div>
            <div>
              <Label htmlFor="parkIcon">Emoji/Icono</Label>
              <Input
                id="parkIcon"
                value={editingPark ? editingPark.icon || "" : newPark.icon}
                onChange={(e) =>
                  editingPark
                    ? setEditingPark({ ...editingPark, icon: e.target.value })
                    : setNewPark({ ...newPark, icon: e.target.value })
                }
                placeholder="🏰"
              />
            </div>
            <div>
              <Label>Color del parque</Label>
              <select
                value={editingPark ? editingPark.color : newPark.color}
                onChange={(e) =>
                  editingPark
                    ? setEditingPark({ ...editingPark, color: e.target.value })
                    : setNewPark({ ...newPark, color: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="from-blue-400 to-purple-500">Azul a Púrpura</option>
                <option value="from-green-400 to-blue-500">Verde a Azul</option>
                <option value="from-red-400 to-pink-500">Rojo a Rosa</option>
                <option value="from-yellow-400 to-orange-500">Amarillo a Naranja</option>
                <option value="from-purple-400 to-pink-500">Púrpura a Rosa</option>
              </select>
            </div>
            <Button onClick={editingPark ? handleEditPark : handleAddPark} disabled={creating} className="w-full">
              {creating ? "Guardando..." : editingPark ? "Actualizar Parque" : "Agregar Parque"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Atracción */}
      <Dialog open={openAttractionDialog} onOpenChange={setOpenAttractionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttraction ? "Editar Atracción" : "Agregar Nueva Atracción"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="attractionName">Nombre de la Atracción</Label>
              <Input
                id="attractionName"
                value={editingAttraction ? editingAttraction.name : newAttraction.name}
                onChange={(e) =>
                  editingAttraction
                    ? setEditingAttraction({ ...editingAttraction, name: e.target.value })
                    : setNewAttraction({ ...newAttraction, name: e.target.value })
                }
                placeholder="Ej: Space Mountain"
              />
            </div>
            <div>
              <Label htmlFor="attractionType">Tipo</Label>
              <select
                id="attractionType"
                value={editingAttraction ? editingAttraction.type : newAttraction.type}
                onChange={(e) =>
                  editingAttraction
                    ? setEditingAttraction({ ...editingAttraction, type: e.target.value as any })
                    : setNewAttraction({ ...newAttraction, type: e.target.value as any })
                }
                className="w-full p-2 border rounded"
              >
                <option value="ride">Atracción</option>
                <option value="show">Espectáculo</option>
                <option value="restaurant">Restaurante</option>
                <option value="shop">Tienda</option>
              </select>
            </div>
            <div>
              <Label htmlFor="attractionPriority">Prioridad</Label>
              <select
                id="attractionPriority"
                value={editingAttraction ? editingAttraction.priority : newAttraction.priority}
                onChange={(e) =>
                  editingAttraction
                    ? setEditingAttraction({ ...editingAttraction, priority: e.target.value as any })
                    : setNewAttraction({ ...newAttraction, priority: e.target.value as any })
                }
                className="w-full p-2 border rounded"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <div>
              <Label htmlFor="attractionNotes">Notas</Label>
              <Textarea
                id="attractionNotes"
                value={editingAttraction ? editingAttraction.notes || "" : newAttraction.notes}
                onChange={(e) =>
                  editingAttraction
                    ? setEditingAttraction({ ...editingAttraction, notes: e.target.value })
                    : setNewAttraction({ ...newAttraction, notes: e.target.value })
                }
                placeholder="Notas sobre la atracción..."
              />
            </div>
            <Button
              onClick={editingAttraction ? handleEditAttraction : handleAddAttraction}
              disabled={creating}
              className="w-full"
            >
              {creating ? "Guardando..." : editingAttraction ? "Actualizar Atracción" : "Agregar Atracción"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {parks.length === 0 ? (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-purple-700 mb-2">¡No hay parques aún!</h3>
            <p className="text-purple-600 mb-4">Comienza agregando los parques que visitarás</p>
          </CardContent>
        </Card>
      ) : (
        parks.map((park) => (
          <Card key={park.id} className="overflow-hidden">
            <CardHeader className={`bg-gradient-to-r ${park.color} text-white`}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{park.icon}</span>
                {park.name}
                <Badge variant="secondary" className="ml-auto mr-2">
                  {park.attractions?.length || 0} atracciones
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEditParkDialog(park)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar parque
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeletePark(park)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar parque
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {park.attractions?.map((attraction) => (
                  <div key={attraction.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(attraction.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{attraction.name}</h4>
                      {attraction.notes && <p className="text-sm text-gray-600">{attraction.notes}</p>}
                    </div>
                    <Badge
                      variant={
                        attraction.priority === "high"
                          ? "destructive"
                          : attraction.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {attraction.priority === "high" ? "Alta" : attraction.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => openEditAttractionDialog(attraction)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteAttraction(attraction)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full mt-2 bg-transparent"
                  onClick={() => openNewAttractionDialog(park.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Atracción
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
