import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import { MediaCard } from './MediaCard';
import { Movie, TVShow } from '../types';

interface MediaCarouselProps {
  title: string;
  subtitle?: string;
  data: (Movie | TVShow)[];
  onPressItem: (item: Movie | TVShow) => void;
  onPressMore?: () => void;
  isLoading?: boolean;
  cardSize?: 'small' | 'medium' | 'large';
  showRank?: boolean;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  subtitle,
  data,
  onPressItem,
  onPressMore,
  isLoading = false,
  cardSize = 'medium',
  showRank = false,
}) => {
  const listRef = useRef<FlatList>(null);

  const getItemTitle = (item: Movie | TVShow): string => {
    return 'title' in item ? item.title : item.name;
  };

  const getItemSubtitle = (item: Movie | TVShow): string => {
    const date = 'release_date' in item ? item.release_date : item.first_air_date;
    return item.overview?.slice(0, 100) + '...' || '';
  };

  const renderItem = ({ item, index }: { item: Movie | TVShow; index: number }) => (
    <View style={styles.itemContainer}>
      {showRank && (
        <Text style={styles.rankText}>{index + 1}</Text>
      )}
      <MediaCard
        id={item.id}
        title={getItemTitle(item)}
        posterPath={item.poster_path}
        subtitle={cardSize === 'large' ? getItemSubtitle(item) : undefined}
        onPress={() => onPressItem(item)}
        size={cardSize}
        showTitle={cardSize !== 'large'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={onPressMore}
        disabled={!onPressMore}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {onPressMore && (
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          )}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Pressable>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={cardSize === 'large' ? 240 : undefined}
          decelerationRate={cardSize === 'large' ? 'fast' : 'normal'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.title3,
    color: colors.text,
  },
  subtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rankText: {
    fontSize: 80,
    fontWeight: '900',
    color: colors.background,
    textShadowColor: colors.text,
    textShadowOffset: { width: -2, height: 0 },
    textShadowRadius: 1,
    marginRight: -spacing.md,
    marginBottom: -spacing.sm,
    zIndex: -1,
  },
});
