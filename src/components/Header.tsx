import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({title, subtitle, onBack, rightAction}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <LinearGradient
              colors={['#FF6B9D', '#C471ED', '#00E5FF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightAction && <View style={styles.rightSection}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    marginLeft: 12,
  },
});
