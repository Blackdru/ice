import {useState, useCallback, useEffect} from 'react';
import {Question} from '../data/questions';
import {
  getUnseenQuestionsForSession,
  markQuestionAsSeen,
} from '../services/seenQuestionsService';

interface UseQuestionsResult {
  questions: Question[];
  currentIndex: number;
  currentQuestion: Question | null;
  categoryId: string | null;
  loading: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  totalCount: number;
}

export function useQuestions(categoryId?: string): UseQuestionsResult {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load unseen questions when categoryId changes or screen mounts
  useEffect(() => {
    let isMounted = true;
    async function loadSessionQuestions() {
      if (!categoryId) {
        if (isMounted) {
          setQuestions([]);
          setCurrentIndex(0);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const sessionQuestions = await getUnseenQuestionsForSession(categoryId);
        if (isMounted) {
          setQuestions(sessionQuestions);
          setCurrentIndex(0);
          if (sessionQuestions.length > 0) {
            const first = sessionQuestions[0];
            const targetCat = first.categoryId || categoryId;
            if (targetCat && targetCat !== 'random') {
              markQuestionAsSeen(targetCat, first.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session questions:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSessionQuestions();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const currentQuestion =
    questions.length > 0 ? questions[currentIndex] ?? null : null;

  // Mark the new question as seen whenever currentIndex advances
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      if (q && categoryId) {
        const targetCat = q.categoryId || categoryId;
        if (targetCat && targetCat !== 'random') {
          markQuestionAsSeen(targetCat, q.id);
        }
      }
    }
  }, [currentIndex, questions, categoryId]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const maxIndex = Math.max(questions.length - 1, 0);
      return Math.min(prev + 1, maxIndex);
    });
  }, [questions.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(
        0,
        Math.min(index, Math.max(questions.length - 1, 0)),
      );
      setCurrentIndex(clamped);
    },
    [questions.length],
  );

  return {
    questions,
    currentIndex,
    currentQuestion,
    categoryId: categoryId ?? null,
    loading,
    goToNext,
    goToPrevious,
    goToIndex,
    isFirst: currentIndex === 0,
    isLast: currentIndex === Math.max(questions.length - 1, 0),
    totalCount: questions.length,
  };
}
