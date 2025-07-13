"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wand2, Film, CheckSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTrip, getMovies, getTasks } from "@/lib/supabase"

// Frases inspiradoras de Disney
const disneyQuotes = [
  {
    quote: "Todos nuestros sueños pueden hacerse realidad si tenemos el coraje de perseguirlos",
    author: "Walt Disney"
  },
  {
    quote: "La vida es una aventura atrevida o no es nada",
    author: "Helen Keller"
  },
  {
    quote: "La imaginación es más importante que el conocimiento",
    author: "Albert Einstein"
  },
  {
    quote: "Cada día es una nueva oportunidad para ser mejor",
    author: "Mickey Mouse"
  },
  {
    quote: "La felicidad es un estado mental, no un destino",
    author: "Walt Disney"
  },
  {
    quote: "Los límites solo existen en tu mente",
    author: "Peter Pan"
  },
  {
    quote: "La verdadera magia está en creer en ti mismo",
    author: "Cenicienta"
  },
  {
    quote: "Cada estrella es un sueño esperando a ser descubierto",
    author: "Walt Disney"
  },
  {
    quote: "Siempre deja que tu conciencia sea tu guía",
    author: "Pepe Grillo"
  },
  {
    quote: "La magia está en el corazón",
    author: "Walt Disney"
  }
]

// Frases de bienvenida para J&M
const welcomeMessages = [
  "¡Bienvenidos a la Aventura Fantástica!",
  "¡Prepárense para un Viaje Inolvidable!",
  "¡El Sueño Disney Está por Comenzar!",
  "¡Bienvenidos al Mundo de los Sueños!",
  "¡La Aventura Fantástica les Espera!",
  "¡Bienvenidos a la Tierra de la Fantasía!",
  "¡El Viaje Mágico Está por Empezar!",
  "¡Bienvenidos al Reino de la Imaginación!"
]

// Frases de cuenta regresiva para J&M
const countdownMessages = [
  "días para vivir la aventura juntos",
  "días para que se cumplan los sueños",
  "días para sumergirse en la fantasía",
  "días para divertirse como nunca",
  "días para emocionarse juntos",
  "días para la alegría compartida",
  "días para sorprenderse",
  "días para maravillarse como pareja"
]

// Frases de llamada a la acción para J&M
const callToActionMessages = [
  "¡Prepárense para la Fantasía!",
  "¡Comiencen Su Aventura Romántica!",
  "¡Descubran la Magia Juntos!",
  "¡Vivan Su Sueño en Pareja!",
  "¡Exploren la Fantasía de a Dos!",
  "¡Creen Recuerdos Inolvidables Juntos!",
  "¡Sumérjanse en la Aventura!",
  "¡Hagan Realidad Sus Sueños Compartidos!"
]

export default function HomePage() {
  const router = useRouter()
  const [tripDate, setTripDate] = useState<Date>(new Date("2024-06-15"))
  const [daysUntilTrip, setDaysUntilTrip] = useState(0)
  const [stats, setStats] = useState({
    totalMovies: 0,
    watchedMovies: 0,
    totalTasks: 0,
    completedTasks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [currentQuote, setCurrentQuote] = useState(disneyQuotes[0])
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0])
  const [countdownMessage, setCountdownMessage] = useState(countdownMessages[0])
  const [callToActionMessage, setCallToActionMessage] = useState(callToActionMessages[0])

  useEffect(() => {
    loadDashboardData()
    // Cambiar frases aleatoriamente cada 10 segundos
    const interval = setInterval(() => {
      setCurrentQuote(disneyQuotes[Math.floor(Math.random() * disneyQuotes.length)])
      setWelcomeMessage(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)])
      setCountdownMessage(countdownMessages[Math.floor(Math.random() * countdownMessages.length)])
      setCallToActionMessage(callToActionMessages[Math.floor(Math.random() * callToActionMessages.length)])
    }, 10000)

    return () => clearInterval(interval)
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
    <div className="space-y-6">
      {/* Banner de Bienvenida Inspirador */}
      <div className="relative overflow-hidden rounded-3xl magical-sunset p-8 text-white shadow-2xl magical-particles">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-6 left-6 text-3xl animate-float">🏰</div>
          <div className="absolute top-12 right-12 text-2xl animate-float delay-1000">🎠</div>
          <div className="absolute bottom-6 left-12 text-2xl animate-float delay-500">🎡</div>
          <div className="absolute bottom-12 right-6 text-3xl animate-float delay-1500">🎢</div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="flex justify-center gap-3 mb-6 text-5xl">
            <span className="animate-pulse">✨</span>
            <span className="animate-bounce delay-100">🏰</span>
            <span className="animate-pulse delay-200">✨</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 magical-text-glow">
            {welcomeMessage}
          </h1>
                <p className="text-xl opacity-95 font-medium mb-6">Donde la fantasía se encuentra con la realidad</p>
          <div className="flex justify-center gap-2 text-3xl">
            <span className="animate-spin">🌟</span>
            <span className="animate-pulse">💫</span>
            <span className="animate-bounce">⭐</span>
            <span className="animate-pulse">💫</span>
            <span className="animate-spin">🌟</span>
          </div>
        </div>
      </div>

      {/* Cuenta Regresiva Inspiradora */}
      <Card className="relative overflow-hidden magical-aurora border-none shadow-2xl magical-depth">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/30 to-pink-200/30"></div>
        <CardHeader className="text-center relative z-10 pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-orange-700 font-bold">
            <Wand2 className="w-6 h-6 text-purple-500 animate-pulse" />
                  Cuenta Regresiva
            <Wand2 className="w-6 h-6 text-purple-500 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center relative z-10">
          <div className="relative">
            <div className="text-7xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4 animate-pulse">
              {daysUntilTrip}
            </div>
            <div className="text-xl font-bold text-orange-700 mb-6">
              {daysUntilTrip === 1
                ? "¡Solo queda 1 día para su aventura!"
                : daysUntilTrip === 0
                  ? "¡HOY ES EL DÍA DE SU AVENTURA MÁGICA!"
                  : countdownMessage}
            </div>

            {/* Elementos inspiradores alrededor del número */}
            <div className="absolute -top-6 -left-6 text-3xl animate-ping">✨</div>
            <div className="absolute -top-4 -right-8 text-2xl animate-pulse">🌟</div>
            <div className="absolute -bottom-4 -left-8 text-2xl animate-bounce">💫</div>
            <div className="absolute -bottom-6 -right-6 text-3xl animate-ping delay-500">✨</div>
          </div>

          <div className="flex justify-center gap-4 text-4xl mb-6">
            <span className="animate-bounce">🏰</span>
            <span className="animate-pulse delay-200">🎢</span>
            <span className="animate-bounce delay-400">🎠</span>
            <span className="animate-pulse delay-600">🎡</span>
            <span className="animate-bounce delay-800">🎪</span>
          </div>

                <p className="text-orange-600 font-bold text-xl">¡La aventura más fantástica está por comenzar!</p>
        </CardContent>
      </Card>

      {/* Estadísticas Inspiradoras */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 magical-hover cursor-pointer"
          onClick={() => router.push('/movies')}
        >
          <div className="absolute top-3 right-3 text-2xl animate-spin">🎬</div>
          <CardContent className="p-6 text-center relative z-10">
            <Film className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <div className="text-4xl font-bold text-blue-700 mb-2">{stats.totalMovies - stats.watchedMovies}</div>
            <div className="text-sm text-blue-600 font-bold">Películas por descubrir juntos</div>
            <div className="flex justify-center gap-2 mt-3">
              <span className="text-sm animate-bounce">🍿</span>
              <span className="text-sm animate-pulse">🎭</span>
              <span className="text-sm animate-bounce delay-200">🍿</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 magical-hover cursor-pointer"
          onClick={() => router.push('/tasks')}
        >
          <div className="absolute top-3 right-3 text-2xl animate-bounce">📝</div>
          <CardContent className="p-6 text-center relative z-10">
            <CheckSquare className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
            <div className="text-4xl font-bold text-green-700 mb-2">
              {stats.totalTasks - stats.completedTasks}
            </div>
            <div className="text-sm text-green-600 font-bold">Tareas pendientes</div>
            <div className="flex justify-center gap-2 mt-3">
              <span className="text-sm animate-bounce">⚡</span>
              <span className="text-sm animate-pulse">🎯</span>
              <span className="text-sm animate-bounce delay-200">⚡</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cita Inspiradora Dinámica */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 border-none shadow-2xl magical-depth">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200/40 to-purple-200/40"></div>
        <CardContent className="p-8 text-center relative z-10">
          <div className="text-5xl mb-6 animate-pulse">💫</div>
          <blockquote className="text-2xl font-bold text-purple-700 mb-6 italic leading-relaxed">
            "{currentQuote.quote}"
          </blockquote>
          <p className="text-purple-600 font-bold text-lg">- {currentQuote.author}</p>
          <div className="flex justify-center gap-3 mt-6 text-3xl">
            <span className="animate-bounce">🌟</span>
            <span className="animate-pulse delay-300">✨</span>
            <span className="animate-bounce delay-600">💖</span>
            <span className="animate-pulse delay-900">✨</span>
            <span className="animate-bounce delay-1200">🌟</span>
          </div>
        </CardContent>
      </Card>

      {/* Llamada a la Acción Inspiradora */}
      <Card className="relative overflow-hidden disney-gradient text-white border-none shadow-2xl magical-wave">
        <div className="absolute inset-0 bg-black/10"></div>
        <CardContent className="p-8 text-center relative z-10">
          <div className="text-4xl mb-4 animate-bounce">🎪</div>
          <h3 className="text-2xl font-bold mb-3">{callToActionMessage}</h3>
          <p className="mb-6 opacity-95 text-lg">
            Exploren los parques, planifiquen las películas y organizen su aventura perfecta juntos
          </p>
          <div className="flex justify-center gap-3 text-3xl">
            <span className="animate-spin">🎠</span>
            <span className="animate-bounce delay-200">🎡</span>
            <span className="animate-pulse delay-400">🎢</span>
            <span className="animate-bounce delay-600">🎪</span>
            <span className="animate-spin delay-800">🎠</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
