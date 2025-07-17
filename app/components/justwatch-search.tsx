"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ExternalLink, Calendar, Loader2 } from "lucide-react"
import { searchJustWatchMovies, type JustWatchResult } from "@/lib/justwatch"
import { useToast } from "@/hooks/use-toast"

interface JustWatchSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMovieSelect: (movie: {
    title: string
    year: number
    justwatch_link: string
  }) => void
}

export default function JustWatchSearch({ open, onOpenChange, onMovieSelect }: JustWatchSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<JustWatchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  // Reset cuando se abre/cierra el modal
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setSearchResults([])
      setHasSearched(false)
    }
  }, [open])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el título de una película",
        variant: "destructive",
      })
      return
    }

    setSearching(true)
    setHasSearched(true)

    try {
      const results = await searchJustWatchMovies(searchQuery)
      setSearchResults(results)

      if (results.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron películas con ese título",
        })
      }
    } catch (error) {
      console.error("Error searching:", error)
      toast({
        title: "Error de búsqueda",
        description: "No se pudo conectar con la API de JustWatch. Intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleSelectMovie = (movie: JustWatchResult) => {
    onMovieSelect({
      title: movie.title,
      year: movie.original_release_year || new Date().getFullYear(),
      justwatch_link: movie.justwatch_url,
    })
    
    onOpenChange(false)
    
    toast({
      title: "¡Película seleccionada!",
      description: `${movie.title} se ha agregado al formulario`,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] w-[95vw] sm:w-full sm:mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="w-5 h-5 text-purple-600" />
            Buscar en JustWatch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Buscador */}
          <div className="space-y-3">
            <Label htmlFor="search" className="text-sm sm:text-base font-medium">
              Título de la película
            </Label>
            <div className="flex gap-2 sm:gap-3">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: El Rey León, Frozen, Moana..."
                disabled={searching}
                className="text-base sm:text-sm h-11 sm:h-10"
              />
              <Button 
                onClick={handleSearch} 
                disabled={searching || !searchQuery.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-11 sm:h-10 px-4 sm:px-3 min-w-[48px]"
              >
                {searching ? (
                  <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                    <Search className="w-5 h-5 sm:w-4 sm:h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Resultados */}
          {hasSearched && (
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Resultados de búsqueda
              </Label>
              <ScrollArea className="h-[300px] sm:h-[400px] w-full border rounded-lg p-3 sm:p-4 overscroll-behavior-contain">
                {searching ? (
                  <div className="flex items-center justify-center py-12 sm:py-8">
                    <div className="flex items-center gap-3 text-purple-600">
                      <Loader2 className="w-6 h-6 sm:w-5 sm:h-5 animate-spin" />
                      <span className="text-base sm:text-sm font-medium">Buscando películas...</span>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                    <div className="space-y-4 sm:space-y-3">
                    {searchResults.map((movie) => (
                      <div
                        key={movie.id}
                        className="border rounded-lg p-4 sm:p-3 hover:bg-purple-50 hover:border-purple-200 active:bg-purple-100 cursor-pointer transition-colors touch-manipulation"
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <div className="flex items-start gap-4 sm:gap-3">
                          {/* Poster de la película */}
                          {movie.poster && (
                            <div className="flex-shrink-0">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-20 h-28 sm:w-16 sm:h-20 object-cover rounded border border-gray-200 shadow-sm"
                                onError={(e) => {
                                  // Si el poster falla al cargar, ocultar la imagen
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-2">
                              <h3 className="font-semibold text-gray-800 text-base sm:text-sm leading-tight">
                                {movie.title}
                              </h3>
                              {movie.original_release_year && (
                                <Badge variant="outline" className="flex items-center gap-1 self-start sm:self-auto w-fit">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-xs">{movie.original_release_year}</span>
                                </Badge>
                              )}
                            </div>
                            
                            {movie.original_title && movie.original_title !== movie.title && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                Título original: {movie.original_title}
                              </p>
                            )}

                            {/* Botones en móvil - stack vertical, en desktop - horizontal */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 h-10 sm:h-8 text-sm w-full sm:w-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <a 
                                  href={movie.justwatch_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2"
                                >
                                  <span>Ver en JustWatch</span>
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>

                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-10 sm:h-8 text-sm font-medium w-full sm:w-auto"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectMovie(movie)
                                }}
                              >
                                ✓ Seleccionar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  ) : (
                      <div className="text-center py-12 sm:py-8 px-4 text-gray-500">
                        <Search className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-2 opacity-50" />
                        <p className="font-medium text-base sm:text-sm mb-3 sm:mb-1">
                          No se encontraron películas en JustWatch
                        </p>
                        <p className="text-sm sm:text-xs mb-3 sm:mb-2">Intenta con:</p>
                        <ul className="text-sm sm:text-xs space-y-2 sm:space-y-1 text-left max-w-xs mx-auto">
                          <li className="flex items-center gap-2">
                            <span className="text-purple-500">•</span>
                            <span>Un título más específico</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-500">•</span>
                            <span>El título en inglés</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-500">•</span>
                            <span>Solo el nombre principal (sin subtítulos)</span>
                          </li>
                        </ul>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Información adicional solo en móvil */}
          {hasSearched && searchResults.length > 0 && (
            <div className="mt-4 sm:hidden">
              <p className="text-xs text-center text-gray-500 px-4">
                Toca cualquier película para agregarla a tu lista
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 