"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Calendar, Castle, Film, CheckSquare, Plane, Star, StickyNote } from "lucide-react"
import { getTrip } from "@/lib/supabase"

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const [tripDate, setTripDate] = useState<Date>(new Date("2024-06-15"))
  const [daysUntilTrip, setDaysUntilTrip] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    loadTripData()
  }, [])

  useEffect(() => {
    const today = new Date()
    const diffTime = tripDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilTrip(Math.max(0, diffDays))
  }, [tripDate])

  const loadTripData = async () => {
    try {
      const trip = await getTrip()
      if (trip && trip.start_date) {
        setTripDate(new Date(trip.start_date))
      }
    } catch (error) {
      console.error("Error loading trip data:", error)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Inspirador */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-b-[2rem] shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 text-2xl animate-float">✨</div>
          <div className="absolute top-8 right-8 text-xl animate-float delay-1000">🌟</div>
          <div className="absolute bottom-4 left-8 text-lg animate-float delay-500">💫</div>
          <div className="absolute bottom-8 right-4 text-2xl animate-float delay-1500">⭐</div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="relative">
              <Castle className="w-10 h-10 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 text-lg animate-bounce">✨</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                J&M Disney Planner
              </h1>
              <p className="text-sm opacity-90 font-medium">Nuestra aventura mágica ✨</p>
            </div>
          </div>
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl py-2 px-1 border border-white/30">
            <div className="text-3xl font-bold text-yellow-300 animate-pulse">{daysUntilTrip}</div>
            <div className="text-xs font-medium">días</div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-6 pb-24">
        {children}
      </div>

      {/* Navegación Inferior Inspiradora */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl px-0 py-0">
        <div className="grid w-full grid-cols-7 magical-sunset shadow-lg h-15 rounded-none">
          <Link 
            href="/"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <Castle className="w-5 h-5" />
            Inicio
          </Link>
          <Link 
            href="/parks"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/parks") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <Star className="w-5 h-5" />
            Parques
          </Link>
          <Link 
            href="/movies"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/movies") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <Film className="w-5 h-5" />
            Películas
          </Link>
          <Link 
            href="/notes"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/notes") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <StickyNote className="w-5 h-5" />
            Notas
          </Link>
          <Link 
            href="/tasks"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/tasks") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            Tareas
          </Link>
          <Link 
            href="/calendar"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/calendar") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendario
          </Link>
          <Link 
            href="/trip"
            className={`flex flex-col gap-1 text-[11px] font-bold rounded-xl transition-all duration-300 items-center justify-center text-white hover:bg-white/20 ${
              isActive("/trip") ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : ""
            }`}
          >
            <Plane className="w-5 h-5" />
            Viaje
          </Link>
        </div>
      </div>
    </div>
  )
} 