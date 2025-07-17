import { NextRequest, NextResponse } from 'next/server'

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

export interface JustWatchSearchResponse {
  data: {
    searchTitles: {
      edges: Array<{
        node: {
          __typename: string
          id: string
          objectType: string
          objectId: number
          content: {
            fullPath: string
            title: string
            originalReleaseYear: number
            posterUrl: string
            __typename: string
          }
          watchNowOffer?: {
            id: string
            standardWebURL: string
            preAffiliatedStandardWebURL: string | null
            package: {
              id: string
              packageId: number
              __typename: string
            }
            __typename: string
          }
          offers: Array<{
            monetizationType: string
            presentationType: string
            standardWebURL: string
            preAffiliatedStandardWebURL: string | null
            package: {
              id: string
              packageId: number
              __typename: string
            }
            id: string
            __typename: string
          }>
        }
      }>
    }
  }
}

const JUSTWATCH_GRAPHQL_URL = 'https://apis.justwatch.com/graphql'

// Configuraciones de búsqueda por orden de prioridad
const SEARCH_CONFIGS = [
  { country: 'MX', language: 'es', name: 'Español Latino (México)' },
  { country: 'US', language: 'en', name: 'Inglés (Estados Unidos)' },
  { country: 'ES', language: 'es', name: 'Español España' }
]

// Función auxiliar para realizar búsqueda con una configuración específica
async function searchWithConfig(query: string, config: { country: string, language: string, name: string }): Promise<JustWatchResult[]> {
  const graphQLQuery = `
    query GetSearchResults($country: Country!, $language: Language!, $first: Int!, $searchQuery: String, $location: String!) {
      searchTitles(
        country: $country
        first: $first
        filter: {searchQuery: $searchQuery, includeTitlesWithoutUrl: true}
        source: $location
      ) {
        edges {
          node {
            ...SuggestedTitle
            __typename
          }
          __typename
        }
        __typename
      }
      popularPeople(
        country: $country
        first: $first
        filter: {searchQuery: $searchQuery}
      ) {
        edges {
          node {
            ...SuggestedPerson
            __typename
          }
          __typename
        }
        __typename
      }
    }

    fragment SuggestedTitle on MovieOrShow {
      __typename
      id
      objectType
      objectId
      content(country: $country, language: $language) {
        fullPath
        title
        originalReleaseYear
        posterUrl
        fullPath
        __typename
      }
      watchNowOffer(country: $country, platform: WEB) {
        id
        standardWebURL
        preAffiliatedStandardWebURL
        package {
          id
          packageId
          __typename
        }
        __typename
      }
      offers(country: $country, platform: WEB, filter: {preAffiliate: true}) {
        monetizationType
        presentationType
        standardWebURL
        preAffiliatedStandardWebURL
        package {
          id
          packageId
          __typename
        }
        id
        __typename
      }
    }

    fragment SuggestedPerson on Person {
      id
      objectType
      objectId
      content(country: $country, language: $language) {
        fullName
        dateOfBirth
        portraitUrl(profile: S332)
        __typename
      }
      __typename
    }
  `

  const response = await fetch(JUSTWATCH_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': config.language === 'es' ? `${config.language}-${config.country},${config.language};q=0.9` : `${config.language};q=0.9,es;q=0.8`,
      'Origin': 'https://www.justwatch.com',
      'Referer': 'https://www.justwatch.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({
      operationName: 'GetSearchResults',
      variables: {
        country: config.country,
        language: config.language,
        searchQuery: query.trim(),
        first: 8,
        location: 'SearchSuggester'
      },
      query: graphQLQuery
    })
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const data: JustWatchSearchResponse = await response.json()
  
  // Check for GraphQL errors
  if ((data as any).errors) {
    throw new Error('GraphQL errors found')
  }

  if (!data.data?.searchTitles?.edges) {
    return []
  }

  // Process GraphQL results - solo películas
  return data.data.searchTitles.edges
    .filter((edge) => edge.node.__typename === 'Movie')
    .map((edge) => {
      const node = edge.node
      const content = node.content
      
      // Construct JustWatch URL
      const justWatchUrl = content.fullPath 
        ? `https://www.justwatch.com${content.fullPath}`
        : `https://www.justwatch.com/${config.country.toLowerCase()}/search?q=${encodeURIComponent(content.title)}`

      // Get best streaming link (prefer watchNowOffer, fallback to first offer)
      let streamingLink = justWatchUrl
      if (node.watchNowOffer?.standardWebURL) {
        streamingLink = node.watchNowOffer.standardWebURL
      } else if (node.offers && node.offers.length > 0) {
        streamingLink = node.offers[0].standardWebURL || justWatchUrl
      }

      return {
        id: node.objectId,
        title: content.title,
        original_title: content.title, // GraphQL no separa título original
        object_type: 'movie',
        original_release_year: content.originalReleaseYear,
        full_path: content.fullPath || '',
        poster: content.posterUrl 
          ? `https://images.justwatch.com${content.posterUrl.replace('{profile}', 's166').replace('{format}', 'jpg')}` 
          : undefined,
        justwatch_url: streamingLink
      }
    })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    console.log(`Búsqueda iniciada para: "${query}"`)

    // Intentar con cada configuración en orden de prioridad
    for (const [index, config] of SEARCH_CONFIGS.entries()) {
      try {
        console.log(`Intentando búsqueda con ${config.name}...`)
        
        const result = await searchWithConfig(query, config)
        
        if (result.length > 0) {
          console.log(`Éxito con ${config.name}: ${result.length} resultados`)
          return NextResponse.json({ results: result, config: config.name })
        }
        
        console.log(`Sin resultados con ${config.name}, probando siguiente configuración...`)
        
      } catch (error) {
        console.warn(`Error con ${config.name}:`, error)
        // Continuar con la siguiente configuración
      }
    }

    // Si todas las configuraciones fallan, devolver array vacío
    console.log('Todas las configuraciones fallaron')
    return NextResponse.json({ results: [], config: 'Ninguna' })

  } catch (error) {
    console.error('Error en API route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 