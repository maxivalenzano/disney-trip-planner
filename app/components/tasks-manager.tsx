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
import { CheckSquare, Plus, Calendar, AlertTriangle, Clock, Edit, Trash2, MoreHorizontal, Tag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getTasks, createTask, updateTask, deleteTask, updateTaskTags, type Task } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import TagSelector from "./tag-selector"

export default function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium" as const,
  })

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openTagSelector, setOpenTagSelector] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await getTasks()
      setTasks(data || [])
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title) return

    try {
      setCreating(true)
      const task = await createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        due_date: newTask.due_date || undefined,
        completed: false,
        priority: newTask.priority,
      })

      // Update tags if any selected
      if (selectedTags.length > 0) {
        await updateTaskTags(task.id, selectedTags)
      }

      // Reload tasks to get updated data with tags
      await loadTasks()

      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
      })
      setSelectedTags([])
      setOpenDialog(false)

      toast({
        title: "¡Tarea creada!",
        description: `${task.title} se ha agregado a tu lista`,
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title) return

    try {
      setCreating(true)
      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.due_date,
        priority: editingTask.priority,
      })

      // Update tags
      await updateTaskTags(editingTask.id, selectedTags)

      // Reload tasks to get updated data with tags
      await loadTasks()

      setEditingTask(null)
      setSelectedTags([])
      setOpenDialog(false)

      toast({
        title: "¡Tarea actualizada!",
        description: `${editingTask.title} se ha actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${task.title}"?`)) {
      return
    }

    try {
      await deleteTask(task.id)
      setTasks(tasks.filter((t) => t.id !== task.id))

      toast({
        title: "Tarea eliminada",
        description: `${task.title} se ha eliminado correctamente`,
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      })
    }
  }

  const toggleCompleted = async (task: Task) => {
    try {
      const updatedTask = await updateTask(task.id, {
        completed: !task.completed,
      })

      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: updatedTask.completed } : t)))

      toast({
        title: task.completed ? "Tarea desmarcada" : "¡Tarea completada!",
        description: `${task.title} ${task.completed ? "se desmarcó como completada" : "se marcó como completada"}`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask({ ...task })
    setSelectedTags(task.tags?.map((tag) => tag.id) || [])
    setOpenDialog(true)
  }

  const openNewDialog = () => {
    setEditingTask(null)
    setSelectedTags([])
    setNewTask({
      title: "",
      description: "",
      due_date: "",
      priority: "medium",
    })
    setOpenDialog(true)
  }

  const openTagsDialog = (task: Task) => {
    setCurrentTaskId(task.id)
    setSelectedTags(task.tags?.map((tag) => tag.id) || [])
    setOpenTagSelector(true)
  }

  const handleTagsUpdate = async (tagIds: string[]) => {
    if (!currentTaskId) return

    try {
      await updateTaskTags(currentTaskId, tagIds)
      await loadTasks() // Reload to get updated tags

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "low":
        return <CheckSquare className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

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
          <h2 className="text-2xl font-bold text-purple-700">Tareas del Viaje</h2>
          <p className="text-sm text-gray-600">
            {completedCount} de {totalCount} tareas completadas ({Math.round(progressPercentage)}%)
          </p>
        </div>
        <Button onClick={openNewDialog} className="bg-gradient-to-r from-green-500 to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Dialog para Tarea */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarea" : "Agregar Nueva Tarea"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskTitle">Título</Label>
              <Input
                id="taskTitle"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, title: e.target.value })
                    : setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Ej: Reservar restaurante"
              />
            </div>
            <div>
              <Label htmlFor="taskDescription">Descripción</Label>
              <Textarea
                id="taskDescription"
                value={editingTask ? editingTask.description || "" : newTask.description}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, description: e.target.value })
                    : setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Detalles de la tarea..."
              />
            </div>
            <div>
              <Label htmlFor="taskDueDate">Fecha límite</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={editingTask ? editingTask.due_date || "" : newTask.due_date}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, due_date: e.target.value })
                    : setNewTask({ ...newTask, due_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="taskPriority">Prioridad</Label>
              <select
                id="taskPriority"
                value={editingTask ? editingTask.priority : newTask.priority}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, priority: e.target.value as any })
                    : setNewTask({ ...newTask, priority: e.target.value as any })
                }
                className="w-full p-2 border rounded"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
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

            <Button onClick={editingTask ? handleEditTask : handleAddTask} disabled={creating} className="w-full">
              {creating ? "Guardando..." : editingTask ? "Actualizar Tarea" : "Agregar Tarea"}
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

      {/* Tag Selector for existing tasks */}
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={(tagIds) => {
          setSelectedTags(tagIds)
          if (currentTaskId) {
            handleTagsUpdate(tagIds)
            setOpenTagSelector(false)
            setCurrentTaskId(null)
          }
        }}
        open={openTagSelector && !!currentTaskId}
        onOpenChange={(open) => {
          setOpenTagSelector(open)
          if (!open) {
            setCurrentTaskId(null)
          }
        }}
      />

      {/* Progress Bar */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <CheckSquare className="w-8 h-8 text-green-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso de tareas</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-green-500 h-2 rounded" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`border ${getPriorityColor(task.priority)}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={task.completed} onCheckedChange={() => toggleCompleted(task)} />
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${task.completed ? "line-through text-gray-600" : ""}`}>
                    {task.title}
                  </h3>
                  {task.description && <p className="text-sm text-gray-600 mb-1">{task.description}</p>}

                  {/* Tags Display */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs flex items-center gap-1 px-2 py-1">
                          <span className="text-sm">{tag.icon}</span>
                          <span>{tag.name}</span>
                          {tag.parent_name && <span className="text-gray-500">({tag.parent_name})</span>}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {task.due_date && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className={isOverdue(task.due_date) ? "text-red-600" : ""}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityIcon(task.priority)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openTagsDialog(task)}>
                      <Tag className="w-4 h-4 mr-2" />
                      Etiquetas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(task)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteTask(task)} className="text-red-600">
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
    </div>
  )
}
