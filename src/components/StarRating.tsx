import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../constants/theme';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 28,
  onRatingChange,
  readonly = false,
}) => {
  const handlePress = (index: number) => {
    if (readonly || !onRatingChange) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newRating = index + 1;
    // If tapping the same star, toggle it off
    onRatingChange(newRating === rating ? 0 : newRating);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => {
        const filled = index < rating;
        const halfFilled = !filled && index < rating + 0.5;

        return (
          <Pressable
            key={index}
            onPress={() => handlePress(index)}
            disabled={readonly}
            style={({ pressed }) => [
              styles.starButton,
              !readonly && pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={filled ? 'star' : halfFilled ? 'star-half' : 'star-outline'}
              size={size}
              color={filled || halfFilled ? colors.imdbYellow : colors.textTertiary}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
