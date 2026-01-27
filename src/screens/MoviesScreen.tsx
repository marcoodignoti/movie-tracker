import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../constants/theme';
import { MediaCarousel } from '../components';
import { movieApi, trendingApi } from '../api/tmdb';
import { Movie } from '../types';

type RootStackParamList = {
  MovieDetail: { movieId: number };
};

export const MoviesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [
        nowPlayingRes,
        popularRes,
        topRatedRes,
        upcomingRes,
        trendingRes,
      ] = await Promise.all([
        movieApi.getNowPlaying(),
        movieApi.getPopular(),
        movieApi.getTopRated(),
        movieApi.getUpcoming(),
        trendingApi.movies(),
      ]);

      setNowPlaying(nowPlayingRes.results);
      setPopular(popularRes.results);
      setTopRated(topRatedRes.results);
      setUpcoming(upcomingRes.results);
      setTrending(trendingRes.results);
    } catch (error) {
      console.error('Error fetching movies:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Movies</Text>
        <Pressable style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text}
          />
        }
      >
        <MediaCarousel
          title="Theatrical Releases"
          subtitle="Discover the latest theatrical releases"
          data={nowPlaying}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="large"
        />

        <MediaCarousel
          title="Currently Streaming"
          subtitle="Discover the latest home releases"
          data={popular}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Trending This Week"
          subtitle="Popular movies right now"
          data={trending}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Top Rated"
          subtitle="Highest rated movies of all time"
          data={topRated}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Coming Soon"
          subtitle="Upcoming theatrical releases"
          data={upcoming}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="medium"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
  },
  menuButton: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
