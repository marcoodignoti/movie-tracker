import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getPosterUrl } from '../api/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

interface CollectionCardProps {
  title: string;
  posterPaths: (string | null)[];
  onPress: () => void;
  color?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  title,
  posterPaths,
  onPress,
  color = colors.primary,
}) => {
  // Get up to 2 poster images for the stacked effect
  const posters = posterPaths.slice(0, 2);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={[`${color}40`, `${color}20`, colors.cardSolid]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.postersContainer}>
          {posters.length > 0 ? (
            posters.map((path, index) => (
              <View
                key={index}
                style={[
                  styles.posterWrapper,
                  index === 1 && styles.posterBack,
                  index === 0 && styles.posterFront,
                ]}
              >
                {path ? (
                  <Image
                    source={{ uri: getPosterUrl(path, 'w185') || undefined }}
                    style={styles.poster}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.poster, styles.placeholderPoster]} />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  postersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  posterWrapper: {
    position: 'absolute',
    width: 70,
    height: 105,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  posterBack: {
    transform: [{ rotate: '8deg' }, { translateX: 15 }, { translateY: -5 }],
    zIndex: 1,
  },
  posterFront: {
    transform: [{ rotate: '-5deg' }, { translateX: -10 }, { translateY: 5 }],
    zIndex: 2,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholderPoster: {
    backgroundColor: colors.surfaceLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.footnote,
    color: colors.textTertiary,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
  },
});
