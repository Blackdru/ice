import React, {useCallback} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {colors} from '../theme/colors';
import {Header} from '../components/Header';
import {AdBanner} from '../components/AdBanner';
import {QuestionCard} from '../components/QuestionCard';
import {useQuestions} from '../hooks/useQuestions';
import {useFavorites} from '../hooks/useFavorites';
import {getCategoryById} from '../utils/questionEngine';
import {trackSwipe} from '../services/adService';
import type {RootStackParamList} from '../navigation/AppNavigator';

type QuestionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Questions'>;
  route: RouteProp<RootStackParamList, 'Questions'>;
};

export function QuestionScreen({navigation, route}: QuestionScreenProps) {
  const {categoryId} = route.params;
  const insets = useSafeAreaInsets();
  const category = getCategoryById(categoryId);
  const {
    currentQuestion,
    currentIndex,
    totalCount,
    loading,
    goToNext,
    goToPrevious,
  } = useQuestions(categoryId);
  const {isFavorite, toggleFavorite} = useFavorites();

  const handleSwipeLeft = useCallback(() => {
    trackSwipe();
    goToNext();
  }, [goToNext]);

  const handleSwipeRight = useCallback(() => {
    goToPrevious();
  }, [goToPrevious]);

  const activeCategoryId = currentQuestion?.categoryId || categoryId;

  const handleToggleFavorite = useCallback(() => {
    if (currentQuestion) {
      toggleFavorite(currentQuestion, activeCategoryId);
    }
  }, [currentQuestion, activeCategoryId, toggleFavorite]);

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          isFavorite={isFavorite(currentQuestion.id, activeCategoryId)}
          onToggleFavorite={handleToggleFavorite}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          currentIndex={currentIndex}
          totalCount={totalCount}
        />
      ) : null}

      <AdBanner style={{paddingBottom: insets.bottom}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
