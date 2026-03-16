import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {Header} from '../components/Header';
import {useFavorites} from '../hooks/useFavorites';
import {getCategoryById} from '../utils/questionEngine';
import type {RootStackParamList} from '../navigation/AppNavigator';
import type {Question} from '../data/questions';

type FavoritesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
};

interface FavoriteItem {
  question: Question;
  categoryId: string;
}

export function FavoritesScreen({navigation}: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const {favorites, removeFavorite, loading} = useFavorites();

  const handleShare = useCallback(async (question: string) => {
    try {
      await Share.share({
        message: `Conversation Starter:\n\n"${question}"\n\nShared from IceB`,
      });
    } catch {
      // share cancelled
    }
  }, []);

  const renderItem = useCallback(
    ({item, index: _index}: {item: FavoriteItem; index: number}) => {
      const category = getCategoryById(item.categoryId);
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryLabel}>
              {category?.emoji} {category?.title ?? item.categoryId}
            </Text>
            <TouchableOpacity
              onPress={() => removeFavorite(item.question.id, item.categoryId)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.removeIcon}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.questionText}>{item.question.question}</Text>

          {item.question.followup && (
            <Text style={styles.followUpText}>{item.question.followup}</Text>
          )}

          <TouchableOpacity
            onPress={() => handleShare(item.question.question)}
            style={styles.shareButton}
            activeOpacity={0.7}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [removeFavorite, handleShare],
  );

  const EmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\u2661'}</Text>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart icon on any question to save it here
        </Text>
      </View>
    ),
    [],
  );

  if (loading) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <Header title="Favorites" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Header
        title="Favorites"
        subtitle={`${favorites.length} saved questions`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          `${item.categoryId}_${item.question.id}_${index}`
        }
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyList,
          {paddingBottom: insets.bottom + 20},
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  removeIcon: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: 4,
  },
  questionText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  followUpText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  shareButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  shareText: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    color: colors.textTertiary,
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
