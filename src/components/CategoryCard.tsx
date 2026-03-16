import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
      activeOpacity={0.8}
      style={styles.wrapper}>
      <LinearGradient
        colors={['#FF6B9D', '#C471ED', '#00D9FF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBorder}>
        <View style={styles.container}>
          {/* Emoji Icon with gradient background */}
          <LinearGradient
            colors={[palette.accent + '40', palette.accent + '20']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.emojiContainer}>
            <Text style={styles.emoji}>{emoji}</Text>
          </LinearGradient>

          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {/* Question Count Badge */}
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={[palette.accent + '30', palette.accent + '20']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.badge}>
              <Text style={[styles.badgeText, {color: palette.accent}]}>
                {questionCount}
              </Text>
              <Text style={styles.badgeLabel}>questions</Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 6,
  },
  gradientBorder: {
    borderRadius: 20,
    padding: 2,
    shadowColor: '#00E5FF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  container: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 0,
    letterSpacing: -0.3,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
});
