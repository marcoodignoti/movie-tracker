import {
  Movie,
  MovieDetails,
  TVShow,
  TVShowDetails,
  PaginatedResponse,
  Video,
  Credits,
} from '../types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDb API Bearer Token (v4 authentication)
// Get one at: https://www.themoviedb.org/settings/api
const API_TOKEN = process.env.EXPO_PUBLIC_TMDB_API_TOKEN || '';

// Image URL helpers
export const getImageUrl = (path: string | null, size: ImageSize = 'w500'): string | null => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path: string | null, size: PosterSize = 'w500'): string | null => {
  return getImageUrl(path, size);
};

export const getBackdropUrl = (path: string | null, size: BackdropSize = 'w1280'): string | null => {
  return getImageUrl(path, size);
};

export const getProfileUrl = (path: string | null, size: ProfileSize = 'w185'): string | null => {
  return getImageUrl(path, size);
};

// Image size types
export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';
export type ImageSize = PosterSize | BackdropSize | ProfileSize;

// Generic fetch helper
async function fetchFromTMDb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Movie endpoints
export const movieApi = {
  getNowPlaying: (page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb('/movie/now_playing', { page: String(page) }),

  getPopular: (page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb('/movie/popular', { page: String(page) }),

  getTopRated: (page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb('/movie/top_rated', { page: String(page) }),

  getUpcoming: (page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb('/movie/upcoming', { page: String(page) }),

  getDetails: (movieId: number): Promise<MovieDetails> =>
    fetchFromTMDb(`/movie/${movieId}`),

  getCredits: (movieId: number): Promise<Credits> =>
    fetchFromTMDb(`/movie/${movieId}/credits`),

  getVideos: (movieId: number): Promise<{ results: Video[] }> =>
    fetchFromTMDb(`/movie/${movieId}/videos`),

  getSimilar: (movieId: number, page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb(`/movie/${movieId}/similar`, { page: String(page) }),

  getRecommendations: (movieId: number, page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb(`/movie/${movieId}/recommendations`, { page: String(page) }),

  search: (query: string, page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb('/search/movie', { query, page: String(page) }),
};

// TV Show endpoints
export const tvApi = {
  getAiringToday: (page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb('/tv/airing_today', { page: String(page) }),

  getOnTheAir: (page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb('/tv/on_the_air', { page: String(page) }),

  getPopular: (page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb('/tv/popular', { page: String(page) }),

  getTopRated: (page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb('/tv/top_rated', { page: String(page) }),

  getDetails: (tvId: number): Promise<TVShowDetails> =>
    fetchFromTMDb(`/tv/${tvId}`),

  getCredits: (tvId: number): Promise<Credits> =>
    fetchFromTMDb(`/tv/${tvId}/credits`),

  getVideos: (tvId: number): Promise<{ results: Video[] }> =>
    fetchFromTMDb(`/tv/${tvId}/videos`),

  getSimilar: (tvId: number, page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb(`/tv/${tvId}/similar`, { page: String(page) }),

  getRecommendations: (tvId: number, page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb(`/tv/${tvId}/recommendations`, { page: String(page) }),

  search: (query: string, page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb('/search/tv', { query, page: String(page) }),
};

// Multi search
export const searchMulti = (
  query: string,
  page = 1
): Promise<PaginatedResponse<Movie | TVShow>> =>
  fetchFromTMDb('/search/multi', { query, page: String(page) });

// Discover endpoints
export const discoverApi = {
  movies: (params: Record<string, string> = {}, page = 1): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb('/discover/movie', { ...params, page: String(page) }),

  tvShows: (params: Record<string, string> = {}, page = 1): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb('/discover/tv', { ...params, page: String(page) }),
};

// Trending endpoints
export const trendingApi = {
  movies: (timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<Movie>> =>
    fetchFromTMDb(`/trending/movie/${timeWindow}`),

  tvShows: (timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<TVShow>> =>
    fetchFromTMDb(`/trending/tv/${timeWindow}`),

  all: (timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<Movie | TVShow>> =>
    fetchFromTMDb(`/trending/all/${timeWindow}`),
};

// Genre endpoints
export const genreApi = {
  getMovieGenres: (): Promise<{ genres: { id: number; name: string }[] }> =>
    fetchFromTMDb('/genre/movie/list'),

  getTVGenres: (): Promise<{ genres: { id: number; name: string }[] }> =>
    fetchFromTMDb('/genre/tv/list'),
};
