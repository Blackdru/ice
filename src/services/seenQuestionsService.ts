import AsyncStorage from '@react-native-async-storage/async-storage';
import {Question, questionsData} from '../data/questions';
import {
  getQuestionsForCategory,
  shuffleQuestions,
} from '../utils/questionEngine';

const SEEN_QUESTIONS_KEY = '@iceb_seen_questions_v1';

export interface SeenQuestionsMap {
  [categoryId: string]: number[];
}

/**
 * Validates and retrieves the parsed map of seen question IDs per category.
 */
export async function getSeenQuestionsMap(): Promise<SeenQuestionsMap> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_QUESTIONS_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const validatedMap: SeenQuestionsMap = {};
      for (const [catId, ids] of Object.entries(parsed)) {
        if (Array.isArray(ids)) {
          validatedMap[catId] = ids.filter(
            (id): id is number => typeof id === 'number',
          );
        }
      }
      return validatedMap;
    }
    return {};
  } catch (error) {
    console.error('Failed to load seen questions map:', error);
    return {};
  }
}

/**
 * Saves the seen questions map to AsyncStorage.
 */
export async function saveSeenQuestionsMap(
  map: SeenQuestionsMap,
): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save seen questions map:', error);
  }
}

/**
 * Returns a Set of seen question IDs for a specific category.
 */
export async function getSeenQuestionIds(
  categoryId: string,
): Promise<Set<number>> {
  const map = await getSeenQuestionsMap();
  return new Set(map[categoryId] ?? []);
}

/**
 * Marks a single question as seen for a given category.
 */
export async function markQuestionAsSeen(
  categoryId: string,
  questionId: number,
): Promise<void> {
  try {
    const map = await getSeenQuestionsMap();
    const existing = map[categoryId] ?? [];
    if (!existing.includes(questionId)) {
      map[categoryId] = [...existing, questionId];
      await saveSeenQuestionsMap(map);
    }
  } catch (error) {
    console.error('Failed to mark question as seen:', error);
  }
}

/**
 * Marks multiple questions as seen for a given category.
 */
export async function markQuestionsAsSeen(
  categoryId: string,
  questionIds: number[],
): Promise<void> {
  try {
    if (questionIds.length === 0) {
      return;
    }
    const map = await getSeenQuestionsMap();
    const existingSet = new Set(map[categoryId] ?? []);
    let changed = false;

    for (const id of questionIds) {
      if (!existingSet.has(id)) {
        existingSet.add(id);
        changed = true;
      }
    }

    if (changed) {
      map[categoryId] = Array.from(existingSet);
      await saveSeenQuestionsMap(map);
    }
  } catch (error) {
    console.error('Failed to mark questions as seen:', error);
  }
}

/**
 * Retrieves unseen questions for a new session.
 * If all questions have been seen in that category, automatically resets the seen history
 * so the user can explore all questions again in a fresh shuffle.
 */
export async function getUnseenQuestionsForSession(
  categoryId: string,
): Promise<Question[]> {
  const seenMap = await getSeenQuestionsMap();

  if (categoryId === 'random') {
    // Collect all questions with their categoryId attached
    const allQuestionsWithCategory: Question[] =
      questionsData.categories.flatMap(cat =>
        cat.questions.map(q => ({
          ...q,
          categoryId: cat.id,
        })),
      );

    // Filter out questions already seen in their respective category
    const unseen = allQuestionsWithCategory.filter(q => {
      const catSeen = seenMap[q.categoryId ?? ''] ?? [];
      return !catSeen.includes(q.id);
    });

    if (unseen.length === 0) {
      // All questions across all categories explored! Reset everything.
      await resetAllSeenQuestions();
      return shuffleQuestions(allQuestionsWithCategory);
    }

    return shuffleQuestions(unseen);
  }

  // Specific category mode
  const allCategoryQuestions = getQuestionsForCategory(categoryId).map(q => ({
    ...q,
    categoryId,
  }));

  const seenIds = new Set(seenMap[categoryId] ?? []);
  const unseen = allCategoryQuestions.filter(q => !seenIds.has(q.id));

  if (unseen.length === 0) {
    // All questions in this category explored! Reset this category's seen list.
    await resetSeenForCategory(categoryId);
    return shuffleQuestions(allCategoryQuestions);
  }

  return shuffleQuestions(unseen);
}

/**
 * Resets the seen questions history for a specific category.
 */
export async function resetSeenForCategory(
  categoryId: string,
): Promise<void> {
  try {
    const map = await getSeenQuestionsMap();
    delete map[categoryId];
    await saveSeenQuestionsMap(map);
  } catch (error) {
    console.error(`Failed to reset seen questions for ${categoryId}:`, error);
  }
}

/**
 * Resets all seen questions history across all categories.
 */
export async function resetAllSeenQuestions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SEEN_QUESTIONS_KEY);
  } catch (error) {
    console.error('Failed to reset all seen questions:', error);
  }
}

/**
 * Returns the count of seen questions per category.
 */
export async function getSeenCounts(): Promise<Record<string, number>> {
  const map = await getSeenQuestionsMap();
  const counts: Record<string, number> = {};
  for (const [catId, ids] of Object.entries(map)) {
    counts[catId] = ids.length;
  }
  return counts;
}
