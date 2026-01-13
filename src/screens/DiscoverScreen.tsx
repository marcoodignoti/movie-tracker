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
import { trendingApi, movieApi, tvApi } from '../api/tmdb';
import { Movie, TVShow } from '../types';

type RootStackParamList = {
  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };
};

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingShows, setTrendingShows] = useState<TVShow[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [airingToday, setAiringToday] = useState<TVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularShows, setPopularShows] = useState<TVShow[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [
        trendingMoviesRes,
        trendingShowsRes,
        nowPlayingRes,
        airingTodayRes,
        popularMoviesRes,
        popularShowsRes,
      ] = await Promise.all([
        trendingApi.movies(),
        trendingApi.tvShows(),
        movieApi.getNowPlaying(),
        tvApi.getAiringToday(),
        movieApi.getPopular(),
        tvApi.getPopular(),
      ]);

      setTrendingMovies(trendingMoviesRes.results);
      setTrendingShows(trendingShowsRes.results);
      setNowPlaying(nowPlayingRes.results);
      setAiringToday(airingTodayRes.results);
      setPopularMovies(popularMoviesRes.results);
      setPopularShows(popularShowsRes.results);
    } catch (error) {
      console.error('Error fetching discover data:', error);
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

  const handleShowPress = (show: TVShow) => {
    navigation.navigate('ShowDetail', { showId: show.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
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
          title="Trending Movies"
          subtitle="Popular this week"
          data={trendingMovies}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="large"
        />

        <MediaCarousel
          title="In Theatres Now"
          subtitle="Currently showing"
          data={nowPlaying}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Trending Shows"
          subtitle="Popular this week"
          data={trendingShows}
          onPressItem={(item) => handleShowPress(item as TVShow)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Airing Today"
          subtitle="New episodes today"
          data={airingToday}
          onPressItem={(item) => handleShowPress(item as TVShow)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Popular Movies"
          subtitle="What everyone's watching"
          data={popularMovies}
          onPressItem={(item) => handleMoviePress(item as Movie)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Popular Shows"
          subtitle="Binge-worthy series"
          data={popularShows}
          onPressItem={(item) => handleShowPress(item as TVShow)}
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
