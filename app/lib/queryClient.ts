import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
})


// React Query hooks for TMDB data
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import * as tmdbService from '@/services/tmdbService'
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb'

// Trending
export function useTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day') {
    return useQuery({
        queryKey: ['trending', mediaType, timeWindow],
        queryFn: () => tmdbService.getTrending(mediaType, timeWindow),
    })
}

// Popular
export function usePopular(type: 'movie' | 'tv', page: number = 1) {
    return useQuery({
        queryKey: ['popular', type, page],
        queryFn: () => tmdbService.getPopular(type, page),
    })
}

// Top Rated
export function useTopRated(type: 'movie' | 'tv', page: number = 1) {
    return useQuery({
        queryKey: ['top-rated', type, page],
        queryFn: () => tmdbService.getTopRated(type, page),
    })
}

// Discover
export function useDiscover(type: 'movie' | 'tv', filters: any = {}) {
    return useQuery({
        queryKey: ['discover', type, filters],
        queryFn: () => tmdbService.discover(type, filters),
    })
}

// Search
export function useSearch(query: string, page: number = 1) {
    return useQuery({
        queryKey: ['search', query, page],
        queryFn: () => tmdbService.search(query, page),
        enabled: query.length > 0,
    })
}

// Movie Details
export function useMovieDetails(id: number, options?: any) {
    return useQuery({
        queryKey: ['movie-details', id],
        queryFn: () => tmdbService.getMovieDetails(id),
        ...options,
    })
}

// TV Details
export function useTVDetails(id: number, options?: any) {
    return useQuery({
        queryKey: ['tv-details', id],
        queryFn: () => tmdbService.getTVDetails(id),
        ...options,
    })
}

// Similar Content
export function useSimilar(type: 'movie' | 'tv', id: number, page: number = 1) {
    return useQuery({
        queryKey: ['similar', type, id, page],
        queryFn: () => tmdbService.getSimilar(type, id, page),
    })
}

// Genres
export function useGenres(type: 'movie' | 'tv') {
    return useQuery({
        queryKey: ['genres', type],
        queryFn: () => tmdbService.getGenres(type),
    })
}

// By Genre
export function useByGenre(type: 'movie' | 'tv', genreId: number, page: number = 1) {
    return useQuery({
        queryKey: ['by-genre', type, genreId, page],
        queryFn: () => tmdbService.getByGenre(type, genreId, page),
    })
}
