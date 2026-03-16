import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors} from '../theme/colors';
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
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#FF6B9D', '#C471ED', '#00E5FF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroGradientBorder}>
            <View style={styles.heroCard}>
              {/* Background Pattern */}
              <View style={styles.heroBackground}>
                <View style={[styles.heroCircle, styles.heroCircle1]} />
                <View style={[styles.heroCircle, styles.heroCircle2]} />
                <View style={[styles.heroCircle, styles.heroCircle3]} />
              </View>

              {/* Content */}
              <View style={styles.heroContent}>
                <View style={styles.heroTop}>
                  <View style={styles.logoWrapper}>
                    <LinearGradient
                      colors={['#FF6B9D', '#C471ED', '#00E5FF']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.logoGradient}>
                      <Image
                        source={require('../../android/assets/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.heroTextContainer}>
                    <Text style={styles.greeting}>IceB</Text>
                    <Text style={styles.tagline}>Break the ice with ease</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Start</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={navigateToRandom}
              style={styles.quickActionWrapper}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF6B9D', '#C471ED', '#00E5FF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.quickActionButton}>
                <View style={styles.quickActionIconContainer}>
                  <Text style={styles.quickActionIcon}>🎲</Text>
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>Random</Text>
                  <Text style={styles.quickActionSubtitle}>Surprise me</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={navigateToFavorites}
              style={styles.quickActionWrapper}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF6B9D', '#FF8C42']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.quickActionButton}>
                <View style={styles.quickActionIconContainer}>
                  <Text style={styles.quickActionIcon}>♥</Text>
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>Favorites</Text>
                  <Text style={styles.quickActionSubtitle}>Saved</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Header */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <Text style={styles.sectionSubtitle}>Choose your vibe</Text>
        </View>
      </View>
    ),
    [totalCount, categories.length, navigateToRandom, navigateToFavorites],
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
    paddingHorizontal: 16,
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  heroContainer: {
    marginBottom: 24,
  },
  heroGradientBorder: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#00E5FF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  heroCircle1: {
    width: 150,
    height: 150,
    backgroundColor: '#FF6B9D',
    top: -50,
    right: -30,
  },
  heroCircle2: {
    width: 100,
    height: 100,
    backgroundColor: '#C471ED',
    bottom: -20,
    left: -20,
  },
  heroCircle3: {
    width: 80,
    height: 80,
    backgroundColor: '#00E5FF',
    top: 40,
    left: 20,
  },
  heroContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  logoWrapper: {
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  heroTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  statsContainer: {
    marginTop: 4,
  },
  statsGradient: {
    borderRadius: 16,
    padding: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border,
    position: 'absolute',
    left: '50%',
    top: '20%',
  },
  quickActionsContainer: {
    marginBottom: 28,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
    paddingHorizontal: 4,
    letterSpacing: -0.3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionWrapper: {
    flex: 1,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    gap: 12,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.1,
  },
  categoriesHeader: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  row: {
    justifyContent: 'space-between',
  },
  leftCard: {
    width: (width - 44) / 2,
  },
  rightCard: {
    width: (width - 44) / 2,
  },
});
