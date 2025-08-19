"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Castle, Film, CheckSquare, Plane, Star, StickyNote, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { KeepAliveStatus } from "./keep-alive-status"

interface SharedLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Inicio", href: "/", icon: Castle },
  { name: "Parques", href: "/parks", icon: Star },
  { name: "Películas", href: "/movies", icon: Film },
  { name: "Notas", href: "/notes", icon: StickyNote },
  { name: "Tareas", href: "/tasks", icon: CheckSquare },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Viaje", href: "/trip", icon: Plane },
]

export default function SharedLayout({ children }: SharedLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [tripDate, setTripDate] = useState<Date>(new Date("2024-06-15"))
  const [daysUntilTrip, setDaysUntilTrip] = useState(0)

  useEffect(() => {
    const today = new Date()
    const diffTime = tripDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilTrip(Math.max(0, diffDays))
  }, [tripDate])

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Inspirador */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 rounded-b-[2rem] shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 text-2xl animate-float">✨</div>
          <div className="absolute top-8 right-8 text-xl animate-float delay-1000">🌟</div>
          <div className="absolute bottom-4 left-8 text-lg animate-float delay-500">💫</div>
          <div className="absolute bottom-8 right-4 text-2xl animate-float delay-1500">⭐</div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">J&M Disney Planner</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <KeepAliveStatus showDetails={true} />
                  </div>

                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <Button
                            key={item.name}
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleNavigation(item.href)}
                          >
                            <Icon className="w-5 h-5" />
                            {item.name}
                          </Button>
                        )
                      })}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <div className="relative">
              <Castle className="w-8 h-8 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 text-lg animate-bounce">✨</div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                J&M Disney Planner
              </h1>
              <p className="text-sm opacity-90 font-medium">Donde los sueños cobran vida ✨</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <KeepAliveStatus />
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30">
              <div className="text-2xl font-bold text-yellow-300 animate-pulse">{daysUntilTrip}</div>
              <div className="text-xs font-medium">días soñados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-6 pb-24">{children}</div>

      {/* Navegación Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl px-0 py-0 md:hidden">
        <div className="grid grid-cols-7 magical-sunset shadow-lg h-16 rounded-none">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all duration-300 rounded-xl mx-1 my-1 ${
                  isActive ? "bg-white/90 text-purple-600 shadow-lg backdrop-blur-sm" : "text-white hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
