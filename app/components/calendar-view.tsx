"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Film, CheckSquare, MapPin, Clock, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getMovies, getTasks } from "@/lib/supabase"

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: "movie" | "task" | "park" | "flight"
  color: string
  completed?: boolean
  watched?: boolean
  description?: string
  priority?: string
  disney_plus_link?: string
  due_date?: string
  watch_date?: string
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  useEffect(() => {
    loadCalendarEvents()
  }, [])

  const loadCalendarEvents = async () => {
    try {
      setLoading(true)

      // Load movies with dates
      const movies = await getMovies()
      const movieEvents: CalendarEvent[] =
        movies
          ?.filter((movie) => movie.watch_date)
          .map((movie) => ({
            id: `movie-${movie.id}`,
            title: movie.title,
            date: movie.watch_date!,
            type: "movie" as const,
            color: movie.watched ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700",
            watched: movie.watched,
            description: movie.notes || undefined,
            disney_plus_link: movie.disney_plus_link || undefined,
            watch_date: movie.watch_date,
          })) || []

      // Load tasks with due dates
      const tasks = await getTasks()
      const taskEvents: CalendarEvent[] =
        tasks
          ?.filter((task) => task.due_date)
          .map((task) => ({
            id: `task-${task.id}`,
            title: task.title,
            date: task.due_date!,
            type: "task" as const,
            color: task.completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
            completed: task.completed,
            description: task.description || undefined,
            priority: task.priority,
            due_date: task.due_date,
          })) || []

      setEvents([...movieEvents, ...taskEvents])
    } catch (error) {
      console.error("Error loading calendar events:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (day: number) => {
    if (!day) return []
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "movie":
        return <Film className="w-3 h-3" />
      case "task":
        return <CheckSquare className="w-3 h-3" />
      case "park":
        return <MapPin className="w-3 h-3" />
      case "flight":
        return "✈️"
      default:
        return <Calendar className="w-3 h-3" />
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getSelectedDayEvents = () => {
    if (!selectedDay) return []
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const handleDayClick = (day: number | null) => {
    if (!day) return
    const dayEvents = getEventsForDate(day)
    if (dayEvents) {
      setSelectedDay(selectedDay === day ? null : day)
    }
  }

  const getSelectedDateString = () => {
    if (!selectedDay) return ""
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return "Normal"
    }
  }

  const days = getDaysInMonth(currentDate)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const selectedDayEvents = getSelectedDayEvents()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-700">Calendario del Viaje</h2>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="text-white hover:bg-white/20">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-white/20">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : []
              const isToday =
                day &&
                new Date().getDate() === day &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear()
              const isSelected = selectedDay === day
              const hasEvents = dayEvents.length > 0

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border-r border-b cursor-pointer transition-colors ${
                    day ? "bg-white hover:bg-gray-50" : "bg-gray-50"
                  } ${isToday ? "bg-blue-50" : ""} ${isSelected ? "bg-purple-50 ring-2 ring-purple-300" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                        isToday ? "text-blue-600" : "text-gray-900"
                      } ${isSelected ? "text-purple-700" : ""}`}>
                        <span>{day}</span>
                        {hasEvents && (
                          <span className="bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded ${event.color} flex items-center gap-1 relative`}
                          >
                            {getEventIcon(event.type)}
                            <span className="truncate flex-1">{event.title}</span>
                            {event.type === "movie" && event.watched && <span className="text-green-600">✓</span>}
                            {event.type === "task" && event.completed && <span className="text-green-600">✓</span>}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayEvents.length - 2} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      {selectedDay && selectedDayEvents.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Actividades del {getSelectedDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <Card key={event.id} className={`${event.color} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          {event.type === "movie" && event.watched && (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              ✓ Vista
                            </Badge>
                          )}
                          {event.type === "task" && event.completed && (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              ✓ Completada
                            </Badge>
                          )}
                          {event.type === "task" && event.priority && (
                            <Badge variant="outline" className={getPriorityColor(event.priority)}>
                              {getPriorityText(event.priority)}
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">                          
                          {event.disney_plus_link && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={event.disney_plus_link} target="_blank" rel="noopener noreferrer">
                                Ver en Disney+
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend 
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Películas programadas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">Visitas a parques</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">✈️</span>
              <span className="text-sm">Vuelos</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span>
                <span>Completado/Visto</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                <span>Número de actividades</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  )
}
