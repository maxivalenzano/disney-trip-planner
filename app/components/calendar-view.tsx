"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Film, CheckSquare, MapPin } from "lucide-react"
import { getMovies, getTasks } from "@/lib/supabase"

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: "movie" | "task" | "park" | "flight"
  color: string
  completed?: boolean
  watched?: boolean
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

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
          })) || []

      // Static events (you can expand this later)
      const staticEvents: CalendarEvent[] = [
        {
          id: "flight-1",
          title: "Vuelo a Orlando",
          date: "2024-06-15",
          type: "flight",
          color: "bg-orange-100 text-orange-700",
        },
        {
          id: "park-1",
          title: "Magic Kingdom",
          date: "2024-06-16",
          type: "park",
          color: "bg-yellow-100 text-yellow-700",
        },
        {
          id: "park-2",
          title: "EPCOT",
          date: "2024-06-17",
          type: "park",
          color: "bg-yellow-100 text-yellow-700",
        },
      ]

      setEvents([...movieEvents, ...taskEvents, ...staticEvents])
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-700">Calendario del Viaje</h2>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border-r border-b ${
                    day ? "bg-white" : "bg-gray-50"
                  } ${isToday ? "bg-blue-50" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
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
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
