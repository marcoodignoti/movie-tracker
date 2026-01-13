import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onPress,
  rightElement,
}) => {
  const content = (
    <>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.container} onPress={onPress}>
        <View style={styles.left}>{content}</View>
        {rightElement}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>{content}</View>
      {rightElement}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  left: {
    flex: 1,
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
});
