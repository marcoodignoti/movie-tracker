import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { SearchBar } from '../components';
import { movieApi, tvApi, getPosterUrl } from '../api/tmdb';
import { Movie, TVShow } from '../types';

type RootStackParamList = {
  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };
};

type SearchResult = (Movie | TVShow) & { media_type?: 'movie' | 'tv' };

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'movies' | 'shows'>('all');

  const searchContent = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (searchType === 'movies' || searchType === 'all') {
        const movieResults = await movieApi.search(searchQuery);
        searchResults = [
          ...searchResults,
          ...movieResults.results.map((m) => ({ ...m, media_type: 'movie' as const })),
        ];
      }

      if (searchType === 'shows' || searchType === 'all') {
        const showResults = await tvApi.search(searchQuery);
        searchResults = [
          ...searchResults,
          ...showResults.results.map((s) => ({ ...s, media_type: 'tv' as const })),
        ];
      }

      // Sort by popularity
      searchResults.sort((a, b) => b.popularity - a.popularity);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchType]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchContent(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchContent]);

  const handleResultPress = (item: SearchResult) => {
    const isMovie = item.media_type === 'movie' || 'title' in item;
    if (isMovie) {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation.navigate('ShowDetail', { showId: item.id });
    }
  };

  const getTitle = (item: SearchResult): string => {
    return 'title' in item ? item.title : (item as TVShow).name;
  };

  const getDate = (item: SearchResult): string => {
    const date = 'release_date' in item
      ? item.release_date
      : (item as TVShow).first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  };

  const getMediaType = (item: SearchResult): string => {
    return item.media_type === 'movie' || 'title' in item ? 'Movie' : 'TV Show';
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.posterContainer}>
        {item.poster_path ? (
          <Image
            source={{ uri: getPosterUrl(item.poster_path, 'w185') || undefined }}
            style={styles.poster}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.posterPlaceholderText}>
              {getTitle(item).charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {getTitle(item)}
        </Text>
        <Text style={styles.resultMeta}>
          {getMediaType(item)} {getDate(item) && `• ${getDate(item)}`}
        </Text>
        {item.overview && (
          <Text style={styles.resultOverview} numberOfLines={2}>
            {item.overview}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search movies, TV shows..."
        isLoading={isLoading}
        autoFocus
      />

      <View style={styles.filterContainer}>
        {(['all', 'movies', 'shows'] as const).map((type) => (
          <Pressable
            key={type}
            style={[styles.filterButton, searchType === type && styles.filterButtonActive]}
            onPress={() => setSearchType(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                searchType === type && styles.filterButtonTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading && results.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : results.length === 0 && query.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try searching for something else</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Search for movies and TV shows</Text>
          <Text style={styles.emptySubtext}>
            Find your favorite content to add to your library
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.media_type || ('title' in item ? 'movie' : 'tv')}-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.title3,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.cardSolid,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  resultItemPressed: {
    opacity: 0.8,
  },
  posterContainer: {
    width: 80,
    height: 120,
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
    ...typography.title1,
    color: colors.textTertiary,
  },
  resultInfo: {
    flex: 1,
    padding: spacing.md,
  },
  resultTitle: {
    ...typography.headline,
    color: colors.text,
  },
  resultMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultOverview: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
