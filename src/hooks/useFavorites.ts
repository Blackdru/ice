import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Question} from '../data/questions';

const FAVORITES_KEY = '@iceb_favorites';

interface FavoriteItem {
  question: Question;
  categoryId: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (items: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch {
      // silently fail
    }
  };

  const addFavorite = useCallback(
    (question: Question, categoryId: string) => {
      const exists = favorites.some(
        f => f.question.id === question.id && f.categoryId === categoryId,
      );
      if (!exists) {
        const updated = [{question, categoryId}, ...favorites];
        setFavorites(updated);
        saveFavorites(updated);
      }
    },
    [favorites],
  );

  const removeFavorite = useCallback(
    (questionId: number, categoryId: string) => {
      const updated = favorites.filter(
        f => !(f.question.id === questionId && f.categoryId === categoryId),
      );
      setFavorites(updated);
      saveFavorites(updated);
    },
    [favorites],
  );

  const isFavorite = useCallback(
    (questionId: number, categoryId: string): boolean => {
      return favorites.some(
        f => f.question.id === questionId && f.categoryId === categoryId,
      );
    },
    [favorites],
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

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites,
  };
}
