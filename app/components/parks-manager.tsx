"use client"

import { Plus, MapPin, Zap, Users, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import PriorityBadge from "./priority-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { sortByPriority } from "@/lib/priority-utils"
import {
  getParks,
  createPark,
  createLand,
  createAttraction,
  updatePark,
  updateLand,
  updateAttraction,
  deletePark,
  deleteLand,
  deleteAttraction,
  type Park,
  type Land,
  type Attraction,
} from "@/lib/supabase"

export default function ParksManager() {
  const [parks, setParks] = useState<Park[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [expandedParks, setExpandedParks] = useState<Set<string>>(new Set())
  const [expandedLands, setExpandedLands] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Estados para diálogos
  const [openParkDialog, setOpenParkDialog] = useState(false)
  const [openLandDialog, setOpenLandDialog] = useState(false)
  const [openAttractionDialog, setOpenAttractionDialog] = useState(false)

  // Estados para formularios
  const [newPark, setNewPark] = useState({
    name: "",
    icon: "",
    color: "from-blue-400 to-purple-500",
  })

  const [editingPark, setEditingPark] = useState<Park | null>(null)

  const [newLand, setNewLand] = useState({
    name: "",
    description: "",
    icon: "🏰",
    color: "from-purple-400 to-pink-500",
    parkId: "",
  })

  const [editingLand, setEditingLand] = useState<Land | null>(null)

  const [newAttraction, setNewAttraction] = useState({
    name: "",
    type: "ride" as const,
    priority: "medium" as const,
    notes: "",
    landId: "",
  })

  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null)

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

  // Funciones para Parks
  const handleAddPark = async () => {
    if (!newPark.name) return

    try {
      setCreating(true)
      const park = await createPark({
        name: newPark.name,
        icon: newPark.icon || "🎢",
        color: newPark.color,
      })

      setParks([...parks, { ...park, lands: [] }])
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

      setParks(parks.map((p) => (p.id === editingPark.id ? { ...updatedPark, lands: p.lands } : p)))
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
    if (!confirm(`¿Estás seguro de que quieres eliminar ${park.name}? Esto también eliminará todas sus lands y atracciones.`)) {
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

  // Funciones para Lands
  const handleAddLand = async () => {
    if (!newLand.name || !newLand.parkId) return

    try {
      setCreating(true)
      const land = await createLand({
        park_id: newLand.parkId,
        name: newLand.name,
        description: newLand.description,
        icon: newLand.icon,
        color: newLand.color,
      })

      setParks(
        parks.map((park) =>
          park.id === newLand.parkId
            ? { ...park, lands: [...(park.lands || []), { ...land, attractions: [] }] }
            : park,
        ),
      )

      setNewLand({
        name: "",
        description: "",
        icon: "🏰",
        color: "from-purple-400 to-pink-500",
        parkId: "",
      })
      setOpenLandDialog(false)

      toast({
        title: "¡Land creada!",
        description: `${land.name} se ha agregado correctamente`,
      })
    } catch (error) {
      console.error("Error creating land:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la land",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditLand = async () => {
    if (!editingLand || !editingLand.name) return

    try {
      setCreating(true)
      const updatedLand = await updateLand(editingLand.id, {
        name: editingLand.name,
        description: editingLand.description,
        icon: editingLand.icon,
        color: editingLand.color,
      })

      setParks(
        parks.map((park) => ({
          ...park,
          lands: park.lands?.map((l) => (l.id === editingLand.id ? { ...updatedLand, attractions: l.attractions } : l)),
        })),
      )

      setEditingLand(null)
      setOpenLandDialog(false)

      toast({
        title: "¡Land actualizada!",
        description: `${updatedLand.name} se ha actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error updating land:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la land",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteLand = async (land: Land) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${land.name}? Esto también eliminará todas sus atracciones.`)) {
      return
    }

    try {
      await deleteLand(land.id)
      setParks(
        parks.map((park) => ({
          ...park,
          lands: park.lands?.filter((l) => l.id !== land.id),
        })),
      )

      toast({
        title: "Land eliminada",
        description: `${land.name} se ha eliminado correctamente`,
      })
    } catch (error) {
      console.error("Error deleting land:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la land",
        variant: "destructive",
      })
    }
  }

  // Funciones para Attractions
  const handleAddAttraction = async () => {
    if (!newAttraction.name || !newAttraction.landId) return

    try {
      setCreating(true)
      const attraction = await createAttraction({
        land_id: newAttraction.landId,
        name: newAttraction.name,
        type: newAttraction.type,
        priority: newAttraction.priority,
        notes: newAttraction.notes,
      })

      setParks(
        parks.map((park) => ({
          ...park,
          lands: park.lands?.map((land) =>
            land.id === newAttraction.landId
              ? { ...land, attractions: [...(land.attractions || []), attraction] }
              : land,
          ),
        })),
      )

      setNewAttraction({
        name: "",
        type: "ride",
        priority: "medium",
        notes: "",
        landId: "",
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
          lands: park.lands?.map((land) => ({
            ...land,
            attractions: land.attractions?.map((a) => (a.id === editingAttraction.id ? updatedAttraction : a)),
          })),
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
          lands: park.lands?.map((land) => ({
            ...land,
            attractions: land.attractions?.filter((a) => a.id !== attraction.id),
          })),
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

  // Funciones para abrir diálogos
  const openNewParkDialog = () => {
    setEditingPark(null)
    setNewPark({ name: "", icon: "", color: "from-blue-400 to-purple-500" })
    setOpenParkDialog(true)
  }

  const openEditParkDialog = (park: Park) => {
    setEditingPark({ ...park })
    setOpenParkDialog(true)
  }

  const openNewLandDialog = (parkId: string) => {
    setEditingLand(null)
    setNewLand({
      name: "",
      description: "",
      icon: "🏰",
      color: "from-purple-400 to-pink-500",
      parkId,
    })
    setOpenLandDialog(true)
  }

  const openEditLandDialog = (land: Land) => {
    setEditingLand({ ...land })
    setOpenLandDialog(true)
  }

  const openNewAttractionDialog = (landId: string) => {
    setEditingAttraction(null)
    setNewAttraction({
      name: "",
      type: "ride",
      priority: "medium",
      notes: "",
      landId,
    })
    setOpenAttractionDialog(true)
  }

  const openEditAttractionDialog = (attraction: Attraction) => {
    setEditingAttraction({ ...attraction })
    setOpenAttractionDialog(true)
  }

  // Funciones para expansión
  const toggleParkExpansion = (parkId: string) => {
    setExpandedParks(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(parkId)) {
        newExpanded.delete(parkId)
      } else {
        newExpanded.add(parkId)
      }
      return newExpanded
    })
  }

  const toggleLandExpansion = (landId: string) => {
    setExpandedLands(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(landId)) {
        newExpanded.delete(landId)
      } else {
        newExpanded.add(landId)
      }
      return newExpanded
    })
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

      {/* Dialog para Land */}
      <Dialog open={openLandDialog} onOpenChange={setOpenLandDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLand ? "Editar Land" : "Agregar Nueva Land"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="landName">Nombre de la Land</Label>
              <Input
                id="landName"
                value={editingLand ? editingLand.name : newLand.name}
                onChange={(e) =>
                  editingLand
                    ? setEditingLand({ ...editingLand, name: e.target.value })
                    : setNewLand({ ...newLand, name: e.target.value })
                }
                placeholder="Ej: Fantasyland"
              />
            </div>
            <div>
              <Label htmlFor="landDescription">Descripción</Label>
              <Textarea
                id="landDescription"
                value={editingLand ? editingLand.description || "" : newLand.description}
                onChange={(e) =>
                  editingLand
                    ? setEditingLand({ ...editingLand, description: e.target.value })
                    : setNewLand({ ...newLand, description: e.target.value })
                }
                placeholder="Descripción de la land..."
              />
            </div>
            <div>
              <Label htmlFor="landIcon">Emoji/Icono</Label>
              <Input
                id="landIcon"
                value={editingLand ? editingLand.icon || "" : newLand.icon}
                onChange={(e) =>
                  editingLand
                    ? setEditingLand({ ...editingLand, icon: e.target.value })
                    : setNewLand({ ...newLand, icon: e.target.value })
                }
                placeholder="🏰"
              />
            </div>
            <div>
              <Label>Color de la land</Label>
              <select
                value={editingLand ? editingLand.color : newLand.color}
                onChange={(e) =>
                  editingLand
                    ? setEditingLand({ ...editingLand, color: e.target.value })
                    : setNewLand({ ...newLand, color: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="from-purple-400 to-pink-500">Púrpura a Rosa</option>
                <option value="from-blue-400 to-cyan-500">Azul a Cyan</option>
                <option value="from-green-400 to-yellow-500">Verde a Amarillo</option>
                <option value="from-red-400 to-orange-500">Rojo a Naranja</option>
                <option value="from-pink-400 to-purple-500">Rosa a Púrpura</option>
              </select>
            </div>
            <Button onClick={editingLand ? handleEditLand : handleAddLand} disabled={creating} className="w-full">
              {creating ? "Guardando..." : editingLand ? "Actualizar Land" : "Agregar Land"}
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

      {/* Lista de Parques con nueva jerarquía */}
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
          <Collapsible key={park.id} open={expandedParks.has(park.id)} onOpenChange={() => toggleParkExpansion(park.id)}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <CardHeader className={`bg-gradient-to-r ${park.color} text-white cursor-pointer hover:brightness-110 transition-all`}>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{park.icon}</span>
                    <span className="flex-1">{park.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge variant="secondary" className="mr-1">
                            {park.lands?.reduce((total, land) => total + (land.attractions?.length || 0), 0) || 0} atrac
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openNewLandDialog(park.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Land
                        </DropdownMenuItem>
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
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Lands dentro del parque */}
                    {park.lands && park.lands.length > 0 ? (
                      park.lands.map((land) => (
                        <Collapsible key={land.id} open={expandedLands.has(land.id)} onOpenChange={() => toggleLandExpansion(land.id)}>
                          <div className="border rounded-lg bg-gray-50">
                            <CollapsibleTrigger asChild>
                              <div className={`p-3 bg-gradient-to-r ${land.color} text-white rounded-t-lg cursor-pointer hover:brightness-110 transition-all`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{land.icon}</span>
                                  <span className="flex-1 font-medium">{land.name}</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:bg-white/20"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Badge variant="secondary" className="mr-1">
                                          {land.attractions?.length || 0} atrac
                                        </Badge>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => openNewAttractionDialog(land.id)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Agregar Atracción
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openEditLandDialog(land)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar land
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteLand(land)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar land
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {land.description && (
                                  <p className="text-sm text-white/80 mt-1">{land.description}</p>
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="p-3 space-y-2">
                                {/* Atracciones dentro de la land */}
                                {land.attractions && land.attractions.length > 0 ? (
                                  sortByPriority(land.attractions).map((attraction) => (
                                    <div key={attraction.id} className="flex items-center gap-3 p-2 bg-white rounded border group">
                                      <div className="flex items-center gap-2">
                                        {getTypeIcon(attraction.type)}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm">{attraction.name}</h5>
                                        {attraction.notes && <p className="text-xs text-gray-600">{attraction.notes}</p>}
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <PriorityBadge
                                              priority={attraction.priority}
                                              size="sm"
                                              showLabel={false}
                                            />
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
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 text-center py-2">No hay atracciones aún</p>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-2">No hay lands en este parque aún</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openNewLandDialog(park.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primera Land
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))
      )}
    </div>
  )
}
