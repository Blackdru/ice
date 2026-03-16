import React, {useCallback, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {BannerAd} from 'react-native-google-mobile-ads';
import {colors} from '../theme/colors';
import {Header} from '../components/Header';
import {QuestionCard} from '../components/QuestionCard';
import {useQuestions} from '../hooks/useQuestions';
import {useFavorites} from '../hooks/useFavorites';
import {getCategoryById} from '../utils/questionEngine';
import {trackSwipe, BANNER_AD_UNIT, BANNER_SIZE, initializeAds} from '../services/adService';
import type {RootStackParamList} from '../navigation/AppNavigator';

type QuestionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Questions'>;
  route: RouteProp<RootStackParamList, 'Questions'>;
};

export function QuestionScreen({navigation, route}: QuestionScreenProps) {
  const {categoryId} = route.params;
  const insets = useSafeAreaInsets();
  const category = getCategoryById(categoryId);
  const {currentQuestion, currentIndex, totalCount, goToNext, goToPrevious} =
    useQuestions(categoryId);
  const {isFavorite, toggleFavorite} = useFavorites();

  useEffect(() => {
    try {
      initializeAds();
    } catch (error) {
      console.warn('Failed to initialize ads:', error);
    }
  }, []);

  const handleSwipeLeft = useCallback(() => {
    trackSwipe();
    goToNext();
  }, [goToNext]);

  const handleSwipeRight = useCallback(() => {
    goToPrevious();
  }, [goToPrevious]);

  const handleToggleFavorite = useCallback(() => {
    if (currentQuestion) {
      toggleFavorite(currentQuestion, categoryId);
    }
  }, [currentQuestion, categoryId, toggleFavorite]);

  const title =
    categoryId === 'random'
      ? 'Random Mode'
      : category?.title ?? 'Questions';
  const subtitle =
    categoryId === 'random'
      ? 'Questions from all categories'
      : category?.description;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
        <Header
          title={title}
          subtitle={subtitle}
          onBack={() => navigation.goBack()}
        />

        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            categoryId={categoryId}
            isFavorite={isFavorite(currentQuestion.id, categoryId)}
            onToggleFavorite={handleToggleFavorite}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            currentIndex={currentIndex}
            totalCount={totalCount}
          />
        )}

        <View style={[styles.bannerContainer, {paddingBottom: insets.bottom}]}>
          <BannerAd
            unitId={BANNER_AD_UNIT}
            size={BANNER_SIZE}
            requestOptions={{requestNonPersonalizedAdsOnly: true}}
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bannerContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
