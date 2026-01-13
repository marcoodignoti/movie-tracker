import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getPosterUrl } from '../api/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  subtitle?: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
}

const SIZES = {
  small: { width: 100, height: 150 },
  medium: { width: 140, height: 210 },
  large: { width: SCREEN_WIDTH * 0.55, height: SCREEN_WIDTH * 0.82 },
};

export const MediaCard: React.FC<MediaCardProps> = ({
  id,
  title,
  posterPath,
  subtitle,
  onPress,
  size = 'medium',
  showTitle = true,
}) => {
  const dimensions = SIZES[size];
  const imageUrl = getPosterUrl(posterPath, size === 'large' ? 'w500' : 'w342');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width: dimensions.width },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageContainer, { width: dimensions.width, height: dimensions.height }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceLight }]}>
            <Text style={styles.placeholderText}>{title}</Text>
          </View>
        )}
        {size === 'large' && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
        )}
        {size === 'large' && showTitle && (
          <View style={styles.largeCardInfo}>
            <Text style={styles.largeTitle} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.largeSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>
      {size !== 'large' && showTitle && (
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  largeCardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  largeTitle: {
    ...typography.title3,
    color: colors.text,
  },
  largeSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.caption1,
    color: colors.text,
    marginTop: spacing.sm,
  },
});
