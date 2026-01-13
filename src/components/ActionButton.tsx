import React from 'react';
import { StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface ActionButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  isActive?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'outline',
  isActive = false,
  isLoading = false,
  disabled = false,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getBackgroundColor = () => {
    if (isActive) return colors.primary;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'outline':
      default:
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (isActive) return colors.primary;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'outline':
      default:
        return colors.border;
    }
  };

  const getTextColor = () => {
    if (isActive) return colors.text;
    switch (variant) {
      case 'primary':
        return colors.text;
      case 'secondary':
      case 'outline':
      default:
        return colors.text;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon as any}
              size={18}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, { color: getTextColor() }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    minWidth: 120,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.subhead,
    fontWeight: '600',
  },
});
