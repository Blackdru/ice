import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {Header} from '../components/Header';
import {AdBanner} from '../components/AdBanner';
import {useFavorites} from '../hooks/useFavorites';
import {getCategoryById} from '../utils/questionEngine';
import type {RootStackParamList} from '../navigation/AppNavigator';
import type {FavoriteItem} from '../context/FavoritesContext';
import {ShareableCard} from '../components/ShareableCard';

type FavoritesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
};

export function FavoritesScreen({navigation}: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const {favorites, removeFavorite, loading} = useFavorites();
  // Lazy shareable card: only render when user requests share
  const [sharingItemKey, setSharingItemKey] = useState<string | null>(null);
  const shareableRef = useRef<ViewShot | null>(null);

  const handleCopy = useCallback((question: string) => {
    try {
      Clipboard.setString(question);
      Alert.alert('Copied!', 'Question copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy question');
    }
  }, []);

  const handleShare = useCallback(async (itemKey: string) => {
    // Set the sharing key to lazily render the ShareableCard
    setSharingItemKey(itemKey);

    // Wait a frame for the ShareableCard to mount and render
    requestAnimationFrame(async () => {
      try {
        const ref = shareableRef.current;
        if (ref && ref.capture) {
          const uri = await ref.capture();
          await Share.open({
            url: Platform.OS === 'ios' ? uri : `file://${uri}`,
            message: 'Check out this conversation starter from IceB!',
          });
        }
      } catch (error: unknown) {
        const shareError = error as {message?: string};
        if (shareError?.message !== 'User did not share') {
          console.error('Share error:', error);
        }
      } finally {
        setSharingItemKey(null);
      }
    });
  }, []);

  const renderItem = useCallback(
    ({item, index}: {item: FavoriteItem; index: number}) => {
      const category = getCategoryById(item.categoryId);
      const itemKey = `${item.categoryId}_${item.question.id}_${index}`;

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

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => handleCopy(item.question.question)}
              style={styles.actionButton}
              activeOpacity={0.7}>
              <Icon name="content-copy" size={16} color={colors.primary} />
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare(itemKey)}
              style={styles.actionButton}
              activeOpacity={0.7}>
              <Icon name="share" size={16} color={colors.primary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [removeFavorite, handleCopy, handleShare],
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

  // Find the question text for the currently sharing item
  const sharingQuestion = sharingItemKey
    ? favorites.find((_item, idx) => {
        const key = `${_item.categoryId}_${_item.question.id}_${idx}`;
        return key === sharingItemKey;
      })
    : null;

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

      {/* Lazy shareable card — only rendered when user taps Share */}
      {sharingQuestion && (
        <View style={styles.hiddenCard}>
          <ShareableCard
            ref={ref => { shareableRef.current = ref; }}
            questionText={sharingQuestion.question.question}
          />
        </View>
      )}

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          `${item.categoryId}_${item.question.id}_${index}`
        }
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />

      {/* Fixed Banner Ad at bottom */}
      <AdBanner style={{paddingBottom: insets.bottom}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hiddenCard: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 380,
    height: 520,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: {
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
