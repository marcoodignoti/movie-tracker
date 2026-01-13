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
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { ActionButton, StarRating, RatingBadge, MediaCarousel } from '../components';
import { tvApi, getPosterUrl, getBackdropUrl } from '../api/tmdb';
import { TVShowDetails, Video, TVShow, Credits } from '../types';
import { useLibraryStore, WatchedShow, CurrentlyWatchingShow } from '../store/libraryStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteParams = {
  ShowDetail: { showId: number };
};

export const ShowDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ShowDetail'>>();
  const { showId } = route.params;

  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [similar, setSimilar] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullOverview, setShowFullOverview] = useState(false);

  const {
    isShowInWatchlist,
    isShowWatched,
    isShowCurrentlyWatching,
    getShowRating,
    addToShowWatchlist,
    removeFromShowWatchlist,
    markShowAsWatched,
    removeFromWatchedShows,
    addToCurrentlyWatching,
    removeFromCurrentlyWatching,
    rateShow,
  } = useLibraryStore();

  const inWatchlist = isShowInWatchlist(showId);
  const watched = isShowWatched(showId);
  const currentlyWatching = isShowCurrentlyWatching(showId);
  const userRating = getShowRating(showId) || 0;

  const fetchShowData = useCallback(async () => {
    try {
      const [showData, videosData, creditsData, similarData] = await Promise.all([
        tvApi.getDetails(showId),
        tvApi.getVideos(showId),
        tvApi.getCredits(showId),
        tvApi.getSimilar(showId),
      ]);

      setShow(showData);
      setVideos(videosData.results.filter((v) => v.site === 'YouTube'));
      setCredits(creditsData);
      setSimilar(similarData.results);
    } catch (error) {
      console.error('Error fetching show:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    fetchShowData();
  }, [fetchShowData]);

  const handleWatchlistToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (inWatchlist) {
      removeFromShowWatchlist(showId);
    } else if (show) {
      addToShowWatchlist({
        id: show.id,
        name: show.name,
        posterPath: show.poster_path,
        firstAirDate: show.first_air_date,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleWatchedToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (watched) {
      removeFromWatchedShows(showId);
    } else if (show) {
      const watchedShow: WatchedShow = {
        id: show.id,
        name: show.name,
        posterPath: show.poster_path,
        firstAirDate: show.first_air_date,
        addedAt: new Date().toISOString(),
        watchedAt: new Date().toISOString(),
      };
      markShowAsWatched(watchedShow);
    }
  };

  const handleCurrentlyWatchingToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentlyWatching) {
      Alert.alert(
        'Remove from Currently Watching',
        'Are you sure you want to remove this show from currently watching?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFromCurrentlyWatching(showId),
          },
        ]
      );
    } else if (show) {
      const currentShow: CurrentlyWatchingShow = {
        id: show.id,
        name: show.name,
        posterPath: show.poster_path,
        firstAirDate: show.first_air_date,
        addedAt: new Date().toISOString(),
        startedWatchingAt: new Date().toISOString(),
      };
      addToCurrentlyWatching(currentShow);
    }
  };

  const handleRatingChange = (rating: number) => {
    if (!watched && show) {
      const watchedShow: WatchedShow = {
        id: show.id,
        name: show.name,
        posterPath: show.poster_path,
        firstAirDate: show.first_air_date,
        addedAt: new Date().toISOString(),
        watchedAt: new Date().toISOString(),
        rating,
      };
      markShowAsWatched(watchedShow);
    } else {
      rateShow(showId, rating);
    }
  };

  const handleTrailerPress = (video: Video) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.key}`;
    Linking.openURL(youtubeUrl);
  };

  const handleSimilarShowPress = (item: TVShow) => {
    navigation.navigate('ShowDetail' as never, { showId: item.id } as never);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Show not found</Text>
      </View>
    );
  }

  const backdropUrl = getBackdropUrl(show.backdrop_path);
  const posterUrl = getPosterUrl(show.poster_path, 'w342');
  const tmdbRating = Math.round(show.vote_average * 10);

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
                <Text style={styles.posterPlaceholderText}>{show.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{show.name}</Text>
          <Text style={styles.releaseInfo}>
            {formatDate(show.first_air_date)} • {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
          </Text>

          {/* Status badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: show.in_production ? colors.success : colors.textTertiary }
          ]}>
            <Text style={styles.statusText}>
              {show.in_production ? 'Ongoing' : 'Ended'}
            </Text>
          </View>

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
              label={currentlyWatching ? 'Watching' : 'Start'}
              icon={currentlyWatching ? 'eye' : 'play'}
              onPress={handleCurrentlyWatchingToggle}
              variant={currentlyWatching ? 'primary' : 'outline'}
              isActive={currentlyWatching}
            />
          </View>

          <View style={styles.actionButtonsSecondary}>
            <ActionButton
              label="Watched"
              icon={watched ? 'checkmark' : 'checkmark-circle-outline'}
              onPress={handleWatchedToggle}
              variant={watched ? 'primary' : 'secondary'}
              isActive={watched}
            />
          </View>

          {/* Overview */}
          <View style={styles.overviewContainer}>
            <Text
              style={styles.overview}
              numberOfLines={showFullOverview ? undefined : 3}
            >
              {show.overview}
            </Text>
            {show.overview.length > 150 && (
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
            <RatingBadge type="imdb" value={show.vote_average.toFixed(1)} />
            <RatingBadge
              type="runtime"
              value={`${show.number_of_episodes} EP`}
              label="Episodes"
            />
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

        {/* Seasons */}
        {show.seasons && show.seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seasons</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonsContainer}
            >
              {show.seasons
                .filter((s) => s.season_number > 0)
                .map((season) => (
                  <View key={season.id} style={styles.seasonCard}>
                    {season.poster_path ? (
                      <Image
                        source={{ uri: getPosterUrl(season.poster_path, 'w185') || undefined }}
                        style={styles.seasonPoster}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.seasonPoster, styles.seasonPlaceholder]}>
                        <Text style={styles.seasonNumber}>S{season.season_number}</Text>
                      </View>
                    )}
                    <Text style={styles.seasonName} numberOfLines={1}>
                      {season.name}
                    </Text>
                    <Text style={styles.seasonEpisodes}>
                      {season.episode_count} episodes
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

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

        {/* Similar shows */}
        {similar.length > 0 && (
          <MediaCarousel
            title="Similar Shows"
            subtitle="You might also like"
            data={similar}
            onPressItem={(item) => handleSimilarShowPress(item as TVShow)}
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
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  statusText: {
    ...typography.caption2,
    color: colors.text,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButtonsSecondary: {
    marginTop: spacing.sm,
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
  seasonsContainer: {
    paddingHorizontal: spacing.md,
  },
  seasonCard: {
    width: 100,
    marginRight: spacing.md,
  },
  seasonPoster: {
    width: 100,
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  seasonPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonNumber: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  seasonName: {
    ...typography.caption1,
    color: colors.text,
    marginTop: spacing.sm,
  },
  seasonEpisodes: {
    ...typography.caption2,
    color: colors.textSecondary,
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
