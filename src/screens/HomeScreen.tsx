import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {CategoryCard} from '../components/CategoryCard';
import {getCategories, getTotalQuestionCount} from '../utils/questionEngine';
import type {RootStackParamList} from '../navigation/AppNavigator';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({navigation}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const categories = getCategories();
  const totalCount = getTotalQuestionCount();

  const navigateToCategory = useCallback(
    (categoryId: string) => {
      navigation.navigate('Questions', {categoryId});
    },
    [navigation],
  );

  const navigateToFavorites = useCallback(() => {
    navigation.navigate('Favorites');
  }, [navigation]);

  const navigateToRandom = useCallback(() => {
    navigation.navigate('Questions', {categoryId: 'random'});
  }, [navigation]);

  const renderCategory = useCallback(
    ({item, index}: {item: (typeof categories)[0]; index: number}) => (
      <View style={index % 2 === 0 ? styles.leftCard : styles.rightCard}>
        <CategoryCard
          id={item.id}
          title={item.title}
          emoji={item.emoji}
          description={item.description}
          questionCount={item.questions.length}
          onPress={() => navigateToCategory(item.id)}
        />
      </View>
    ),
    [navigateToCategory],
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        <Text style={styles.greeting}>IceB</Text>
        <Text style={styles.tagline}>
          {totalCount} conversation starters to break the ice
        </Text>

        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={navigateToRandom}
            style={styles.randomButton}
            activeOpacity={0.7}>
            <Text style={styles.randomEmoji}>{'\u{1F3B2}'}</Text>
            <View style={styles.randomTextContainer}>
              <Text style={styles.randomTitle}>Random Mode</Text>
              <Text style={styles.randomSubtitle}>Surprise me</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={navigateToFavorites}
            style={styles.favoritesButton}
            activeOpacity={0.7}>
            <Text style={styles.favoritesEmoji}>{'\u2665'}</Text>
            <View style={styles.randomTextContainer}>
              <Text style={styles.favoritesTitle}>Favorites</Text>
              <Text style={styles.favoritesSubtitle}>Saved</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
      </View>
    ),
    [totalCount, navigateToRandom, navigateToFavorites],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + 20},
        ]}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 14,
  },
  headerSection: {
    paddingHorizontal: 6,
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 4,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  randomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  randomEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  randomTextContainer: {
    flex: 1,
  },
  randomTitle: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  randomSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  favoritesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  favoritesEmoji: {
    fontSize: 28,
    marginRight: 12,
    color: colors.favorite,
  },
  favoritesTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  favoritesSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  row: {
    justifyContent: 'space-between',
  },
  leftCard: {
    width: (width - 40) / 2,
  },
  rightCard: {
    width: (width - 40) / 2,
  },
});
