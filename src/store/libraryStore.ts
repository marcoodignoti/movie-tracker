import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaType, Collection } from '../types';

export interface LibraryMovie {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  addedAt: string;
}

export interface LibraryShow {
  id: number;
  name: string;
  posterPath: string | null;
  firstAirDate: string;
  addedAt: string;
  startedWatchingAt?: string;
}

export interface WatchedMovie extends LibraryMovie {
  watchedAt: string;
  rating?: number;
}

export interface WatchedShow extends LibraryShow {
  watchedAt: string;
  rating?: number;
}

export interface CurrentlyWatchingShow extends LibraryShow {
  startedWatchingAt: string;
}

interface MovieCollection {
  id: string;
  name: string;
  movies: number[]; // Movie IDs
  createdAt: string;
}

interface ShowCollection {
  id: string;
  name: string;
  shows: number[]; // Show IDs
  createdAt: string;
}

interface LibraryState {
  // Movies
  movieWatchlist: LibraryMovie[];
  watchedMovies: WatchedMovie[];
  movieCollections: MovieCollection[];

  // Shows
  showWatchlist: LibraryShow[];
  watchedShows: WatchedShow[];
  currentlyWatchingShows: CurrentlyWatchingShow[];
  showCollections: ShowCollection[];

  // Movie actions
  addToMovieWatchlist: (movie: LibraryMovie) => void;
  removeFromMovieWatchlist: (movieId: number) => void;
  markMovieAsWatched: (movie: WatchedMovie) => void;
  removeFromWatchedMovies: (movieId: number) => void;
  rateMovie: (movieId: number, rating: number) => void;
  isMovieInWatchlist: (movieId: number) => boolean;
  isMovieWatched: (movieId: number) => boolean;
  getMovieRating: (movieId: number) => number | undefined;

  // Show actions
  addToShowWatchlist: (show: LibraryShow) => void;
  removeFromShowWatchlist: (showId: number) => void;
  markShowAsWatched: (show: WatchedShow) => void;
  removeFromWatchedShows: (showId: number) => void;
  addToCurrentlyWatching: (show: CurrentlyWatchingShow) => void;
  removeFromCurrentlyWatching: (showId: number) => void;
  rateShow: (showId: number, rating: number) => void;
  isShowInWatchlist: (showId: number) => boolean;
  isShowWatched: (showId: number) => boolean;
  isShowCurrentlyWatching: (showId: number) => boolean;
  getShowRating: (showId: number) => number | undefined;

  // Collection actions
  createMovieCollection: (name: string) => void;
  deleteMovieCollection: (collectionId: string) => void;
  addMovieToCollection: (collectionId: string, movieId: number) => void;
  removeMovieFromCollection: (collectionId: string, movieId: number) => void;
  createShowCollection: (name: string) => void;
  deleteShowCollection: (collectionId: string) => void;
  addShowToCollection: (collectionId: string, showId: number) => void;
  removeShowFromCollection: (collectionId: string, showId: number) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      // Initial state
      movieWatchlist: [],
      watchedMovies: [],
      movieCollections: [],
      showWatchlist: [],
      watchedShows: [],
      currentlyWatchingShows: [],
      showCollections: [],

      // Movie actions
      addToMovieWatchlist: (movie) =>
        set((state) => {
          if (state.movieWatchlist.some((m) => m.id === movie.id)) {
            return state;
          }
          return { movieWatchlist: [...state.movieWatchlist, movie] };
        }),

      removeFromMovieWatchlist: (movieId) =>
        set((state) => ({
          movieWatchlist: state.movieWatchlist.filter((m) => m.id !== movieId),
        })),

      markMovieAsWatched: (movie) =>
        set((state) => {
          const newWatchlist = state.movieWatchlist.filter((m) => m.id !== movie.id);
          const existingWatched = state.watchedMovies.find((m) => m.id === movie.id);
          if (existingWatched) {
            return {
              movieWatchlist: newWatchlist,
              watchedMovies: state.watchedMovies.map((m) =>
                m.id === movie.id ? { ...m, ...movie } : m
              ),
            };
          }
          return {
            movieWatchlist: newWatchlist,
            watchedMovies: [...state.watchedMovies, movie],
          };
        }),

      removeFromWatchedMovies: (movieId) =>
        set((state) => ({
          watchedMovies: state.watchedMovies.filter((m) => m.id !== movieId),
        })),

      rateMovie: (movieId, rating) =>
        set((state) => ({
          watchedMovies: state.watchedMovies.map((m) =>
            m.id === movieId ? { ...m, rating } : m
          ),
        })),

      isMovieInWatchlist: (movieId) => get().movieWatchlist.some((m) => m.id === movieId),

      isMovieWatched: (movieId) => get().watchedMovies.some((m) => m.id === movieId),

      getMovieRating: (movieId) => get().watchedMovies.find((m) => m.id === movieId)?.rating,

      // Show actions
      addToShowWatchlist: (show) =>
        set((state) => {
          if (state.showWatchlist.some((s) => s.id === show.id)) {
            return state;
          }
          return { showWatchlist: [...state.showWatchlist, show] };
        }),

      removeFromShowWatchlist: (showId) =>
        set((state) => ({
          showWatchlist: state.showWatchlist.filter((s) => s.id !== showId),
        })),

      markShowAsWatched: (show) =>
        set((state) => {
          const newWatchlist = state.showWatchlist.filter((s) => s.id !== show.id);
          const newCurrentlyWatching = state.currentlyWatchingShows.filter(
            (s) => s.id !== show.id
          );
          const existingWatched = state.watchedShows.find((s) => s.id === show.id);
          if (existingWatched) {
            return {
              showWatchlist: newWatchlist,
              currentlyWatchingShows: newCurrentlyWatching,
              watchedShows: state.watchedShows.map((s) =>
                s.id === show.id ? { ...s, ...show } : s
              ),
            };
          }
          return {
            showWatchlist: newWatchlist,
            currentlyWatchingShows: newCurrentlyWatching,
            watchedShows: [...state.watchedShows, show],
          };
        }),

      removeFromWatchedShows: (showId) =>
        set((state) => ({
          watchedShows: state.watchedShows.filter((s) => s.id !== showId),
        })),

      addToCurrentlyWatching: (show) =>
        set((state) => {
          const newWatchlist = state.showWatchlist.filter((s) => s.id !== show.id);
          const existing = state.currentlyWatchingShows.find((s) => s.id === show.id);
          if (existing) {
            return { showWatchlist: newWatchlist };
          }
          return {
            showWatchlist: newWatchlist,
            currentlyWatchingShows: [...state.currentlyWatchingShows, show],
          };
        }),

      removeFromCurrentlyWatching: (showId) =>
        set((state) => ({
          currentlyWatchingShows: state.currentlyWatchingShows.filter((s) => s.id !== showId),
        })),

      rateShow: (showId, rating) =>
        set((state) => ({
          watchedShows: state.watchedShows.map((s) =>
            s.id === showId ? { ...s, rating } : s
          ),
        })),

      isShowInWatchlist: (showId) => get().showWatchlist.some((s) => s.id === showId),

      isShowWatched: (showId) => get().watchedShows.some((s) => s.id === showId),

      isShowCurrentlyWatching: (showId) =>
        get().currentlyWatchingShows.some((s) => s.id === showId),

      getShowRating: (showId) => get().watchedShows.find((s) => s.id === showId)?.rating,

      // Collection actions
      createMovieCollection: (name) =>
        set((state) => ({
          movieCollections: [
            ...state.movieCollections,
            {
              id: Date.now().toString(),
              name,
              movies: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteMovieCollection: (collectionId) =>
        set((state) => ({
          movieCollections: state.movieCollections.filter((c) => c.id !== collectionId),
        })),

      addMovieToCollection: (collectionId, movieId) =>
        set((state) => ({
          movieCollections: state.movieCollections.map((c) =>
            c.id === collectionId && !c.movies.includes(movieId)
              ? { ...c, movies: [...c.movies, movieId] }
              : c
          ),
        })),

      removeMovieFromCollection: (collectionId, movieId) =>
        set((state) => ({
          movieCollections: state.movieCollections.map((c) =>
            c.id === collectionId
              ? { ...c, movies: c.movies.filter((id) => id !== movieId) }
              : c
          ),
        })),

      createShowCollection: (name) =>
        set((state) => ({
          showCollections: [
            ...state.showCollections,
            {
              id: Date.now().toString(),
              name,
              shows: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteShowCollection: (collectionId) =>
        set((state) => ({
          showCollections: state.showCollections.filter((c) => c.id !== collectionId),
        })),

      addShowToCollection: (collectionId, showId) =>
        set((state) => ({
          showCollections: state.showCollections.map((c) =>
            c.id === collectionId && !c.shows.includes(showId)
              ? { ...c, shows: [...c.shows, showId] }
              : c
          ),
        })),

      removeShowFromCollection: (collectionId, showId) =>
        set((state) => ({
          showCollections: state.showCollections.map((c) =>
            c.id === collectionId
              ? { ...c, shows: c.shows.filter((id) => id !== showId) }
              : c
          ),
        })),
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
