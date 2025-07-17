export interface JustWatchResult {
  id: number
  title: string
  original_title: string
  object_type: string
  original_release_year: number | null
  full_path: string
  poster?: string
  justwatch_url: string
}

export async function searchJustWatchMovies(query: string): Promise<JustWatchResult[]> {
  if (!query.trim()) {
    return []
  }

  try {
    console.log(`Iniciando búsqueda vía API route para: "${query}"`)
    
    const response = await fetch(`/api/justwatch/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API route error: ${response.status} - ${errorData.error || 'Unknown error'}`)
    }

    const data = await response.json()
    
    console.log(`Búsqueda completada vía API route. Resultados: ${data.results?.length || 0}`)
    return data.results || []
    
  } catch (error) {
    console.error('Error en searchJustWatchMovies (API route):', error)
    throw error
  }
}

 