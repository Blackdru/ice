import {questionsData, Question, Category} from '../data/questions';

let recentlyShown: Set<string> = new Set();
const MAX_RECENT = 50;

export function getCategories(): Category[] {
  return questionsData.categories;
}

export function getCategoryById(id: string): Category | undefined {
  return questionsData.categories.find(c => c.id === id);
}

export function getQuestionsForCategory(categoryId: string): Question[] {
  const category = getCategoryById(categoryId);
  return category?.questions ?? [];
}

export function getRandomQuestion(): {question: Question; categoryId: string} | null {
  const allQuestions = questionsData.categories.flatMap(c =>
    c.questions.map(q => ({question: q, categoryId: c.id})),
  );

  const available = allQuestions.filter(
    item => !recentlyShown.has(`${item.categoryId}_${item.question.id}`),
  );

  const pool = available.length > 0 ? available : allQuestions;

  if (available.length === 0) {
    recentlyShown.clear();
  }

  const idx = Math.floor(Math.random() * pool.length);
  const selected = pool[idx];

  const key = `${selected.categoryId}_${selected.question.id}`;
  recentlyShown.add(key);

  if (recentlyShown.size > MAX_RECENT) {
    const first = recentlyShown.values().next().value;
    if (first) {
      recentlyShown.delete(first);
    }
  }

  return selected;
}

export function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getTotalQuestionCount(): number {
  return questionsData.categories.reduce(
    (sum, c) => sum + c.questions.length,
    0,
  );
}
