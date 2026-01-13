import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

type RatingType = 'critics' | 'audience' | 'imdb' | 'runtime';

interface RatingBadgeProps {
  type: RatingType;
  value: number | string;
  label?: string;
}

const getRatingConfig = (type: RatingType, value: number | string) => {
  switch (type) {
    case 'critics':
      const criticsScore = typeof value === 'number' ? value : parseInt(value as string, 10);
      return {
        icon: 'ellipse',
        color: criticsScore >= 60 ? colors.error : colors.warning,
        label: 'Critics',
        displayValue: `${value}%`,
      };
    case 'audience':
      const audienceScore = typeof value === 'number' ? value : parseInt(value as string, 10);
      return {
        icon: 'ticket',
        color: audienceScore >= 60 ? colors.audienceGood : colors.warning,
        label: 'Audience',
        displayValue: `${value}%`,
      };
    case 'imdb':
      return {
        icon: 'star',
        color: colors.imdbYellow,
        label: 'IMDb',
        displayValue: String(value),
      };
    case 'runtime':
      return {
        icon: 'time',
        color: colors.textSecondary,
        label: 'Runtime',
        displayValue: typeof value === 'number' ? `${value} MIN` : value,
      };
    default:
      return {
        icon: 'help',
        color: colors.textSecondary,
        label: '',
        displayValue: String(value),
      };
  }
};

export const RatingBadge: React.FC<RatingBadgeProps> = ({ type, value, label }) => {
  const config = getRatingConfig(type, value);

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Ionicons
          name={config.icon as any}
          size={type === 'critics' ? 10 : 14}
          color={config.color}
        />
        <Text style={[styles.label, { color: config.color }]}>
          {label || config.label}
        </Text>
      </View>
      <Text style={styles.value}>{config.displayValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption2,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  value: {
    ...typography.headline,
    color: colors.text,
  },
});
