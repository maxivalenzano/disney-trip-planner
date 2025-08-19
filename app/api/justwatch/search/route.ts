/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';

export interface JustWatchResult {
    id: number;
    title: string;
    original_title: string;
    object_type: string;
    original_release_year: number | null;
    full_path: string;
    poster?: string;
    justwatch_url: string;
    imdb_score?: number;
    imdb_votes?: number;
}

export interface JustWatchSearchResponse {
    data: {
        searchTitles: {
            edges: Array<{
                node: {
                    __typename: string;
                    id: string;
                    objectType: string;
                    objectId: number;
                    content: {
                        fullPath: string;
                        title: string;
                        originalReleaseYear: number;
                        posterUrl: string;
                        scoring?: {
                            imdbScore?: number;
                            imdbVotes?: number;
                            tmdbScore?: number;
                            tmdbPopularity?: number;
                            tomatoMeter?: number;
                            certifiedFresh?: boolean;
                            __typename: string;
                        };
                        __typename: string;
                    };
                    watchNowOffer?: {
                        id: string;
                        standardWebURL: string;
                        preAffiliatedStandardWebURL: string | null;
                        package: {
                            id: string;
                            packageId: number;
                            __typename: string;
                        };
                        __typename: string;
                    };
                    offers: Array<{
                        monetizationType: string;
                        presentationType: string;
                        standardWebURL: string;
                        preAffiliatedStandardWebURL: string | null;
                        package: {
                            id: string;
                            packageId: number;
                            __typename: string;
                        };
                        id: string;
                        __typename: string;
                    }>;
                };
            }>;
        };
    };
}

const JUSTWATCH_GRAPHQL_URL = 'https://apis.justwatch.com/graphql';

// Configuraciones de búsqueda por orden de prioridad
const SEARCH_CONFIGS = [
    { country: 'AR', language: 'es', name: 'Español Latino' },
    { country: 'US', language: 'en', name: 'Inglés' },
    { country: 'ES', language: 'es', name: 'Español España' },
];

// Función auxiliar para realizar búsqueda con una configuración específica
async function searchWithConfig(
    query: string,
    config: { country: string; language: string; name: string }
): Promise<JustWatchResult[]> {
    const graphQLQuery = `
    query GetSearchTitles($country: Country!, $first: Int! = 5, $language: Language!, $searchAfterCursor: String, $searchTitlesFilter: TitleFilter, $searchTitlesSortBy: PopularTitlesSorting! = POPULAR, $sortRandomSeed: Int! = 0, $location: String!) {
      searchTitles(
        after: $searchAfterCursor
        country: $country
        filter: $searchTitlesFilter
        first: $first
        sortBy: $searchTitlesSortBy
        sortRandomSeed: $sortRandomSeed
        source: $location
      ) {
        edges {
          ...SearchTitleGraphql
          __typename
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
          __typename
        }
        totalCount
        __typename
      }
    }

    fragment SearchTitleGraphql on TitleSearchResultEdge {
      cursor
      node {
        __typename
        id
        objectId
        objectType
        content(country: $country, language: $language) {
          title
          fullPath
          originalReleaseYear
          genres {
            shortName
            __typename
          }
          scoring {
            imdbScore
            imdbVotes
            tmdbScore
            tmdbPopularity
            tomatoMeter
            certifiedFresh
            __typename
          }
          posterUrl
          backdrops {
            backdropUrl
            __typename
          }
          upcomingReleases(releaseTypes: [DIGITAL]) {
            releaseDate
            __typename
          }
          __typename
        }
        watchNowOffer(country: $country, platform: WEB) {
          id
          standardWebURL
          preAffiliatedStandardWebURL
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
      __typename
    }
  `;

    const response = await fetch(JUSTWATCH_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Language':
                config.language === 'es'
                    ? `${config.language}-${config.country},${config.language};q=0.9`
                    : `${config.language};q=0.9,es;q=0.8`,
            Origin: 'https://www.justwatch.com',
            Referer: 'https://www.justwatch.com/',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
            operationName: 'GetSearchTitles',
            variables: {
                first: 8,
                searchTitlesSortBy: 'POPULAR',
                sortRandomSeed: 0,
                searchAfterCursor: '',
                searchTitlesFilter: {
                    searchQuery: query.trim(),
                    personId: null,
                    includeTitlesWithoutUrl: true,
                },
                language: config.language,
                country: config.country,
                location: 'SearchPage',
            },
            query: graphQLQuery,
        }),
    });

    if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
    }

    const data: JustWatchSearchResponse = await response.json();

    // Check for GraphQL errors
    if ((data as any).errors) {
        throw new Error('GraphQL errors found');
    }

    if (!data.data?.searchTitles?.edges) {
        return [];
    }

    // Process GraphQL results - solo películas y series
    return data.data.searchTitles.edges
        .filter((edge) => ['Movie', 'Show'].includes(edge.node.__typename))
        .map((edge) => {
            const node = edge.node;
            const content = node.content;

            // Construct JustWatch URL
            const justWatchUrl = content.fullPath
                ? `https://www.justwatch.com${content.fullPath}`
                : `https://www.justwatch.com/${config.country.toLowerCase()}/search?q=${encodeURIComponent(
                      content.title
                  )}`;

            // Get best streaming link (prefer watchNowOffer, fallback to first offer)
            const streamingLink = justWatchUrl;
            // if (node.watchNowOffer?.standardWebURL) {
            //   streamingLink = node.watchNowOffer.standardWebURL
            // } else if (node.offers && node.offers.length > 0) {
            //   streamingLink = node.offers[0].standardWebURL || justWatchUrl
            // }

            return {
                id: node.objectId,
                title: content.title,
                original_title: content.title, // GraphQL no separa título original
                object_type: node.__typename === 'Movie' ? 'movie' : 'show',
                original_release_year: content.originalReleaseYear,
                full_path: content.fullPath || '',
                poster: content.posterUrl
                    ? `https://images.justwatch.com${content.posterUrl
                          .replace('{profile}', 's166')
                          .replace('{format}', 'jpg')}`
                    : undefined,
                justwatch_url: streamingLink,
                imdb_score: content.scoring?.imdbScore,
                imdb_votes: content.scoring?.imdbVotes,
            };
        });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query?.trim()) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        console.log(`Búsqueda iniciada para: "${query}"`);

        // Intentar con cada configuración en orden de prioridad
        for (const [_index, config] of SEARCH_CONFIGS.entries()) {
            try {
                console.log(`Intentando búsqueda con ${config.name}...`);

                const result = await searchWithConfig(query, config);

                if (result.length > 0) {
                    console.log(`Éxito con ${config.name}: ${result.length} resultados`);
                    return NextResponse.json({ results: result, config: config.name });
                }

                console.log(`Sin resultados con ${config.name}, probando siguiente configuración...`);
            } catch (error) {
                console.warn(`Error con ${config.name}:`, error);
                // Continuar con la siguiente configuración
            }
        }

        // Si todas las configuraciones fallan, devolver array vacío
        console.log('Todas las configuraciones fallaron');
        return NextResponse.json({ results: [], config: 'Ninguna' });
    } catch (error) {
        console.error('Error en API route:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
