import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, categoryColors} from '../theme/colors';
import {typography} from '../theme/typography';

interface CategoryCardProps {
  id: string;
  title: string;
  emoji: string;
  description: string;
  questionCount: number;
  onPress: () => void;
}

export const CategoryCard = React.memo(function CategoryCard({
  id,
  title,
  emoji,
  description,
  questionCount,
  onPress,
}: CategoryCardProps) {
  const palette = categoryColors[id] ?? {bg: colors.primaryLight, accent: colors.primary};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}>
      <View style={[styles.emojiContainer, {backgroundColor: palette.bg}]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      <View style={[styles.badge, {backgroundColor: palette.bg}]}>
        <Text style={[styles.badgeText, {color: palette.accent}]}>
          {questionCount} questions
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '600',
  },
});
