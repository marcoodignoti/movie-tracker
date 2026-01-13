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
import { tvApi, trendingApi } from '../api/tmdb';
import { TVShow } from '../types';

type RootStackParamList = {
  ShowDetail: { showId: number };
};

export const ShowsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [airingToday, setAiringToday] = useState<TVShow[]>([]);
  const [onTheAir, setOnTheAir] = useState<TVShow[]>([]);
  const [popular, setPopular] = useState<TVShow[]>([]);
  const [topRated, setTopRated] = useState<TVShow[]>([]);
  const [trending, setTrending] = useState<TVShow[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [
        airingTodayRes,
        onTheAirRes,
        popularRes,
        topRatedRes,
        trendingRes,
      ] = await Promise.all([
        tvApi.getAiringToday(),
        tvApi.getOnTheAir(),
        tvApi.getPopular(),
        tvApi.getTopRated(),
        trendingApi.tvShows(),
      ]);

      setAiringToday(airingTodayRes.results);
      setOnTheAir(onTheAirRes.results);
      setPopular(popularRes.results);
      setTopRated(topRatedRes.results);
      setTrending(trendingRes.results);
    } catch (error) {
      console.error('Error fetching shows:', error);
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

  const handleShowPress = (show: TVShow) => {
    navigation.navigate('ShowDetail', { showId: show.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shows</Text>
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
          title="Airing Today"
          subtitle="New episodes airing today"
          data={airingToday}
          onPressItem={(item) => handleShowPress(item as TVShow)}
          isLoading={isLoading}
          cardSize="large"
        />

        <MediaCarousel
          title="Currently Airing"
          subtitle="Shows currently on air"
          data={onTheAir}
          onPressItem={(item) => handleShowPress(item as TVShow)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Trending This Week"
          subtitle="Popular shows right now"
          data={trending}
          onPressItem={(item) => handleShowPress(item as TVShow)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Popular"
          subtitle="Most watched shows"
          data={popular}
          onPressItem={(item) => handleShowPress(item as TVShow)}
          isLoading={isLoading}
          cardSize="medium"
        />

        <MediaCarousel
          title="Top Rated"
          subtitle="Highest rated shows of all time"
          data={topRated}
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
