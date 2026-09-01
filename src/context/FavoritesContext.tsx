import React, {createContext, useContext, useState, useEffect, useCallback, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Question} from '../data/questions';

const FAVORITES_KEY = '@iceb_favorites';

export interface FavoriteItem {
  question: Question;
  categoryId: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  loading: boolean;
  addFavorite: (question: Question, categoryId: string) => void;
  removeFavorite: (questionId: number, categoryId: string) => void;
  isFavorite: (questionId: number, categoryId: string) => boolean;
  toggleFavorite: (question: Question, categoryId: string) => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Validates that parsed JSON matches the FavoriteItem[] shape.
 * Returns only valid items, discarding corrupted entries.
 */
function validateFavorites(data: unknown): FavoriteItem[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(
    (item): item is FavoriteItem =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.categoryId === 'string' &&
      item.question !== null &&
      typeof item.question === 'object' &&
      typeof item.question.id === 'number' &&
      typeof item.question.question === 'string',
  );
}

export function FavoritesProvider({children}: {children: React.ReactNode}) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const validated = validateFavorites(parsed);
        setFavorites(validated);

        // If validation filtered out corrupt entries, persist the clean version
        if (Array.isArray(parsed) && validated.length !== parsed.length) {
          console.warn(
            `Filtered ${parsed.length - validated.length} corrupt favorite entries`,
          );
          await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(validated));
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const saveFavorites = useCallback(async (items: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save favorites:', error);
      // Reload from storage to re-sync in-memory state with persisted state
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(validateFavorites(JSON.parse(stored)));
        }
      } catch (reloadError) {
        console.error('Failed to reload favorites after save error:', reloadError);
      }
    }
  }, []);

  const addFavorite = useCallback(
    (question: Question, categoryId: string) => {
      setFavorites(prev => {
        const exists = prev.some(
          f => f.question.id === question.id && f.categoryId === categoryId,
        );
        if (!exists) {
          const updated = [{question, categoryId}, ...prev];
          saveFavorites(updated);
          return updated;
        }
        return prev;
      });
    },
    [saveFavorites],
  );

  const removeFavorite = useCallback(
    (questionId: number, categoryId: string) => {
      setFavorites(prev => {
        const updated = prev.filter(
          f => !(f.question.id === questionId && f.categoryId === categoryId),
        );
        saveFavorites(updated);
        return updated;
      });
    },
    [saveFavorites],
  );

  // O(1) lookup using a memoized Set instead of O(n) .some() scan
  const favoriteKeys = useMemo(
    () => new Set(favorites.map(f => `${f.categoryId}_${f.question.id}`)),
    [favorites],
  );

  const isFavorite = useCallback(
    (questionId: number, categoryId: string): boolean => {
      return favoriteKeys.has(`${categoryId}_${questionId}`);
    },
    [favoriteKeys],
  );

  const toggleFavorite = useCallback(
    (question: Question, categoryId: string) => {
      if (isFavorite(question.id, categoryId)) {
        removeFavorite(question.id, categoryId);
      } else {
        addFavorite(question, categoryId);
      }
    },
    [isFavorite, removeFavorite, addFavorite],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        refreshFavorites: loadFavorites,
      }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
