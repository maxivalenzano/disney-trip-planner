"use client"

import { useState, useEffect } from "react"
import { Calendar, Castle, Film, CheckSquare, Plane, Star, StickyNote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TripDetails from "./components/trip-details"
import ParksManager from "./components/parks-manager"
import MoviesTracker from "./components/movies-tracker"
import TasksManager from "./components/tasks-manager"
import CalendarView from "./components/calendar-view"
import NotesWall from "./components/notes-wall"
import { getTrip, getMovies, getTasks } from "@/lib/supabase"

export default function DisneyTripPlanner() {
  const [tripDate, setTripDate] = useState<Date>(new Date("2024-06-15"))
  const [daysUntilTrip, setDaysUntilTrip] = useState(0)
  const [stats, setStats] = useState({
    totalMovies: 0,
    watchedMovies: 0,
    totalTasks: 0,
    completedTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    const today = new Date()
    const diffTime = tripDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilTrip(Math.max(0, diffDays))
  }, [tripDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Cargar datos del viaje
      const trip = await getTrip()
      if (trip && trip.start_date) {
        setTripDate(new Date(trip.start_date))
      }

      // Cargar estadísticas de películas
      const movies = await getMovies()
      const watchedMovies = movies?.filter((m) => m.watched).length || 0

      // Cargar estadísticas de tareas
      const tasks = await getTasks()
      const completedTasks = tasks?.filter((t) => t.completed).length || 0

      setStats({
        totalMovies: movies?.length || 0,
        watchedMovies,
        totalTasks: tasks?.length || 0,
        completedTasks,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const movieProgress = stats.totalMovies > 0 ? (stats.watchedMovies / stats.totalMovies) * 100 : 0
  const taskProgress = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0
  const overallProgress = (movieProgress + taskProgress) / 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Castle className="w-8 h-8 text-yellow-300" />
            <div>
              <h1 className="text-xl font-bold">Disney Trip Planner</h1>
              <p className="text-sm opacity-90">¡La magia comienza aquí! ✨</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">{daysUntilTrip}</div>
            <div className="text-xs">días restantes</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        <Tabs defaultValue="home" className="w-full">
          <TabsContent value="home" className="space-y-6">
            {/* Magical Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center gap-2 mb-4 text-4xl animate-bounce">
                  <span className="animate-pulse">✨</span>
                  <span className="animate-bounce delay-100">🏰</span>
                  <span className="animate-pulse delay-200">✨</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">¡Bienvenido a tu Aventura Mágica!</h1>
                <p className="text-lg opacity-90">Donde los sueños se hacen realidad</p>
                <div className="flex justify-center gap-1 mt-4 text-2xl">
                  <span className="animate-spin">🌟</span>
                  <span className="animate-pulse">💫</span>
                  <span className="animate-bounce">⭐</span>
                  <span className="animate-pulse">💫</span>
                  <span className="animate-spin">🌟</span>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-4 left-4 text-2xl animate-float">🎈</div>
              <div className="absolute top-8 right-8 text-xl animate-float delay-1000">🎭</div>
              <div className="absolute bottom-4 left-8 text-lg animate-float delay-500">🎪</div>
              <div className="absolute bottom-8 right-4 text-2xl animate-float delay-1500">🎠</div>
            </div>

            {/* Magical Countdown */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 border-none shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-pink-200/20"></div>
              <CardHeader className="text-center relative z-10">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-orange-700">
                  <div className="flex gap-1">
                    <span className="animate-spin text-yellow-500">⭐</span>
                    <span className="animate-pulse text-pink-500">✨</span>
                    <span className="animate-bounce text-purple-500">🌟</span>
                  </div>
                  Cuenta Regresiva
                  <div className="flex gap-1">
                    <span className="animate-bounce text-purple-500">🌟</span>
                    <span className="animate-pulse text-pink-500">✨</span>
                    <span className="animate-spin text-yellow-500">⭐</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <div className="relative">
                  <div className="text-6xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
                    {daysUntilTrip}
                  </div>
                  <div className="text-lg font-medium text-orange-700 mb-4">
                    {daysUntilTrip === 1
                      ? "¡Solo queda 1 día!"
                      : daysUntilTrip === 0
                        ? "¡HOY ES EL DÍA!"
                        : `días para la magia`}
                  </div>

                  {/* Magic sparkles around the number */}
                  <div className="absolute -top-4 -left-4 text-2xl animate-ping">✨</div>
                  <div className="absolute -top-2 -right-6 text-xl animate-pulse">🌟</div>
                  <div className="absolute -bottom-2 -left-6 text-lg animate-bounce">💫</div>
                  <div className="absolute -bottom-4 -right-4 text-2xl animate-ping delay-500">✨</div>
                </div>

                <div className="flex justify-center gap-3 text-3xl mb-4">
                  <span className="animate-bounce">🏰</span>
                  <span className="animate-pulse delay-200">🎢</span>
                  <span className="animate-bounce delay-400">🎠</span>
                  <span className="animate-pulse delay-600">🎡</span>
                  <span className="animate-bounce delay-800">🎪</span>
                </div>

                <p className="text-orange-600 font-medium text-lg">¡La aventura más mágica está por comenzar!</p>
              </CardContent>
            </Card>

            {/* Magical Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-2 right-2 text-2xl animate-spin">🎬</div>
                <CardContent className="p-6 text-center relative z-10">
                  <Film className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-pulse" />
                  <div className="text-3xl font-bold text-blue-700 mb-1">{stats.totalMovies - stats.watchedMovies}</div>
                  <div className="text-sm text-blue-600 font-medium">Películas mágicas por ver</div>
                  <div className="flex justify-center gap-1 mt-2">
                    <span className="text-sm animate-bounce">🍿</span>
                    <span className="text-sm animate-pulse">🎭</span>
                    <span className="text-sm animate-bounce delay-200">🍿</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-2 right-2 text-2xl animate-bounce">📝</div>
                <CardContent className="p-6 text-center relative z-10">
                  <CheckSquare className="w-10 h-10 text-green-600 mx-auto mb-3 animate-pulse" />
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    {stats.totalTasks - stats.completedTasks}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Tareas mágicas pendientes</div>
                  <div className="flex justify-center gap-1 mt-2">
                    <span className="text-sm animate-bounce">⚡</span>
                    <span className="text-sm animate-pulse">🎯</span>
                    <span className="text-sm animate-bounce delay-200">⚡</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Magical Inspiration Quote */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 border-none shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="text-4xl mb-4 animate-pulse">💫</div>
                <blockquote className="text-xl font-medium text-purple-700 mb-4 italic">
                  "Todos nuestros sueños pueden hacerse realidad si tenemos el coraje de perseguirlos"
                </blockquote>
                <p className="text-purple-600 font-medium">- Walt Disney</p>
                <div className="flex justify-center gap-2 mt-4 text-2xl">
                  <span className="animate-bounce">🌟</span>
                  <span className="animate-pulse delay-300">✨</span>
                  <span className="animate-bounce delay-600">💖</span>
                  <span className="animate-pulse delay-900">✨</span>
                  <span className="animate-bounce delay-1200">🌟</span>
                </div>
              </CardContent>
            </Card>

            {/* Magical Call to Action */}
            <Card className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-none shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="text-3xl mb-3 animate-bounce">🎪</div>
                <h3 className="text-xl font-bold mb-2">¡Prepárate para la Magia!</h3>
                <p className="mb-4 opacity-90">
                  Explora los parques, planifica tus películas y organiza tu aventura perfecta
                </p>
                <div className="flex justify-center gap-2 text-2xl">
                  <span className="animate-spin">🎠</span>
                  <span className="animate-bounce delay-200">🎡</span>
                  <span className="animate-pulse delay-400">🎢</span>
                  <span className="animate-bounce delay-600">🎪</span>
                  <span className="animate-spin delay-800">🎠</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parks">
            <ParksManager />
          </TabsContent>

          <TabsContent value="movies">
            <MoviesTracker />
          </TabsContent>

        <TabsContent value="notes">
            <NotesWall />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksManager />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="trip">
            <TripDetails />
          </TabsContent>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
            <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-blue-100 to-purple-100">
              <TabsTrigger value="home" className="flex flex-col gap-1 text-xs">
                <Castle className="w-4 h-4" />
                Inicio
              </TabsTrigger>
              <TabsTrigger value="parks" className="flex flex-col gap-1 text-xs">
                <Star className="w-4 h-4" />
                Parques
              </TabsTrigger>
              <TabsTrigger value="movies" className="flex flex-col gap-1 text-xs">
                <Film className="w-4 h-4" />
                Películas
              </TabsTrigger>
                            <TabsTrigger value="notes" className="flex flex-col gap-1 text-xs">
                <StickyNote className="w-4 h-4" />
                Notas
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex flex-col gap-1 text-xs">
                <CheckSquare className="w-4 h-4" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex flex-col gap-1 text-xs">
                <Calendar className="w-4 h-4" />
                Calendario
              </TabsTrigger>
                            <TabsTrigger value="trip" className="flex flex-col gap-1 text-xs">
                <Plane className="w-4 h-4" />
                Viaje
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
