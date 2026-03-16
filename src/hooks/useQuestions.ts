import {useState, useCallback, useMemo} from 'react';
import {Question} from '../data/questions';
import {
  getQuestionsForCategory,
  shuffleQuestions,
  getRandomQuestion,
} from '../utils/questionEngine';

interface UseQuestionsResult {
  questions: Question[];
  currentIndex: number;
  currentQuestion: Question | null;
  categoryId: string | null;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  totalCount: number;
}

export function useQuestions(categoryId?: string): UseQuestionsResult {
  const questions = useMemo(() => {
    if (categoryId === 'random') {
      const randomItems: Question[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const result = getRandomQuestion();
        if (result) {
          const key = `${result.categoryId}_${result.question.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            randomItems.push(result.question);
          }
        }
      }
      return randomItems;
    }
    if (categoryId) {
      return shuffleQuestions(getQuestionsForCategory(categoryId));
    }
    return [];
  }, [categoryId]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex] ?? null;

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion,
    categoryId: categoryId ?? null,
    goToNext,
    goToPrevious,
    goToIndex,
    isFirst: currentIndex === 0,
    isLast: currentIndex === questions.length - 1,
    totalCount: questions.length,
  };
}
