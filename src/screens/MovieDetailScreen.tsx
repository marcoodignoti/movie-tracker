import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { ActionButton, StarRating, RatingBadge, MediaCarousel } from '../components';
import { movieApi, getPosterUrl, getBackdropUrl } from '../api/tmdb';
import { MovieDetails, Video, Movie, Credits } from '../types';
import { useLibraryStore, WatchedMovie } from '../store/libraryStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteParams = {
  MovieDetail: { movieId: number };
};

export const MovieDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'MovieDetail'>>();
  const { movieId } = route.params;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullOverview, setShowFullOverview] = useState(false);

  const {
    isMovieInWatchlist,
    isMovieWatched,
    getMovieRating,
    addToMovieWatchlist,
    removeFromMovieWatchlist,
    markMovieAsWatched,
    removeFromWatchedMovies,
    rateMovie,
  } = useLibraryStore();

  const inWatchlist = isMovieInWatchlist(movieId);
  const watched = isMovieWatched(movieId);
  const userRating = getMovieRating(movieId) || 0;

  const fetchMovieData = useCallback(async () => {
    try {
      const [movieData, videosData, creditsData, similarData] = await Promise.all([
        movieApi.getDetails(movieId),
        movieApi.getVideos(movieId),
        movieApi.getCredits(movieId),
        movieApi.getSimilar(movieId),
      ]);

      setMovie(movieData);
      setVideos(videosData.results.filter((v) => v.site === 'YouTube'));
      setCredits(creditsData);
      setSimilar(similarData.results);
    } catch (error) {
      console.error('Error fetching movie:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  const handleWatchlistToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (inWatchlist) {
      removeFromMovieWatchlist(movieId);
    } else if (movie) {
      addToMovieWatchlist({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleWatchedToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (watched) {
      removeFromWatchedMovies(movieId);
    } else if (movie) {
      const watchedMovie: WatchedMovie = {
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        addedAt: new Date().toISOString(),
        watchedAt: new Date().toISOString(),
      };
      markMovieAsWatched(watchedMovie);
    }
  };

  const handleRatingChange = (rating: number) => {
    if (!watched && movie) {
      // If rating but not marked as watched, mark it as watched first
      const watchedMovie: WatchedMovie = {
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        addedAt: new Date().toISOString(),
        watchedAt: new Date().toISOString(),
        rating,
      };
      markMovieAsWatched(watchedMovie);
    } else {
      rateMovie(movieId, rating);
    }
  };

  const handleTrailerPress = (video: Video) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.key}`;
    Linking.openURL(youtubeUrl);
  };

  const handleSimilarMoviePress = (item: Movie) => {
    navigation.navigate('MovieDetail' as never, { movieId: item.id } as never);
  };

  const formatRuntime = (minutes: number | null): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path, 'w342');
  const tmdbRating = Math.round(movie.vote_average * 10);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Backdrop with blur effect */}
        <View style={styles.backdropContainer}>
          {backdropUrl && (
            <>
              <Image
                source={{ uri: backdropUrl }}
                style={styles.backdrop}
                contentFit="cover"
                blurRadius={20}
              />
              <LinearGradient
                colors={['transparent', colors.background]}
                style={styles.backdropGradient}
              />
            </>
          )}
        </View>

        {/* Close button */}
        <Pressable
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <BlurView intensity={80} style={styles.blurButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </BlurView>
        </Pressable>

        {/* More button */}
        <Pressable style={styles.moreButton}>
          <BlurView intensity={80} style={styles.blurButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
          </BlurView>
        </Pressable>

        {/* Poster and basic info */}
        <View style={styles.headerContent}>
          <View style={styles.posterContainer}>
            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                style={styles.poster}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={[styles.poster, styles.posterPlaceholder]}>
                <Text style={styles.posterPlaceholderText}>{movie.title.charAt(0)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.releaseInfo}>
            {formatDate(movie.release_date)} • {getTimeAgo(movie.release_date)}
          </Text>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <ActionButton
              label="Watchlist"
              icon={inWatchlist ? 'checkmark' : 'add'}
              onPress={handleWatchlistToggle}
              variant="outline"
              isActive={inWatchlist}
            />
            <ActionButton
              label="Watched"
              icon={watched ? 'checkmark' : 'eye-outline'}
              onPress={handleWatchedToggle}
              variant={watched ? 'primary' : 'outline'}
              isActive={watched}
            />
          </View>

          {/* Overview */}
          <View style={styles.overviewContainer}>
            <Text
              style={styles.overview}
              numberOfLines={showFullOverview ? undefined : 3}
            >
              {movie.overview}
            </Text>
            {movie.overview.length > 150 && (
              <Pressable onPress={() => setShowFullOverview(!showFullOverview)}>
                <Text style={styles.showMore}>
                  {showFullOverview ? 'Show less' : 'Show more'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Ratings */}
          <View style={styles.ratingsContainer}>
            <RatingBadge type="critics" value={tmdbRating} label="Critics" />
            <RatingBadge type="audience" value={tmdbRating} label="Audience" />
            <RatingBadge type="imdb" value={movie.vote_average.toFixed(1)} />
            <RatingBadge type="runtime" value={movie.runtime || 0} />
          </View>

          {/* User rating */}
          <View style={styles.userRatingContainer}>
            <Text style={styles.userRatingLabel}>Your Rating</Text>
            <StarRating
              rating={userRating}
              onRatingChange={handleRatingChange}
              size={32}
            />
          </View>
        </View>

        {/* Trailers */}
        {videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trailers</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trailersContainer}
            >
              {videos.slice(0, 5).map((video) => (
                <Pressable
                  key={video.id}
                  style={styles.trailerCard}
                  onPress={() => handleTrailerPress(video)}
                >
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${video.key}/mqdefault.jpg` }}
                    style={styles.trailerThumbnail}
                    contentFit="cover"
                  />
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color={colors.text} />
                  </View>
                  <Text style={styles.trailerTitle} numberOfLines={2}>
                    {video.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Cast */}
        {credits && credits.cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castContainer}
            >
              {credits.cast.slice(0, 10).map((person) => (
                <View key={person.id} style={styles.castCard}>
                  {person.profile_path ? (
                    <Image
                      source={{ uri: getPosterUrl(person.profile_path, 'w185') || undefined }}
                      style={styles.castImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.castImage, styles.castPlaceholder]}>
                      <Ionicons name="person" size={24} color={colors.textTertiary} />
                    </View>
                  )}
                  <Text style={styles.castName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.castCharacter} numberOfLines={1}>
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar movies */}
        {similar.length > 0 && (
          <MediaCarousel
            title="Similar Movies"
            subtitle="You might also like"
            data={similar}
            onPressItem={(item) => handleSimilarMoviePress(item as Movie)}
            cardSize="medium"
          />
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  backdropContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    zIndex: 10,
  },
  moreButton: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    zIndex: 10,
  },
  blurButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.md,
  },
  posterContainer: {
    width: 140,
    height: 210,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    ...typography.largeTitle,
    color: colors.textTertiary,
  },
  title: {
    ...typography.title2,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  releaseInfo: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  overviewContainer: {
    marginTop: spacing.lg,
  },
  overview: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  showMore: {
    ...typography.footnote,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  userRatingContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    width: '100%',
  },
  userRatingLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  trailersContainer: {
    paddingHorizontal: spacing.md,
  },
  trailerCard: {
    width: 200,
    marginRight: spacing.md,
  },
  trailerThumbnail: {
    width: '100%',
    height: 112,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  playButton: {
    position: 'absolute',
    top: 40,
    left: 88,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailerTitle: {
    ...typography.caption1,
    color: colors.text,
    marginTop: spacing.sm,
  },
  castContainer: {
    paddingHorizontal: spacing.md,
  },
  castCard: {
    width: 80,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  castImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
  },
  castPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    ...typography.caption1,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  castCharacter: {
    ...typography.caption2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: spacing.xxl * 2,
  },
});
