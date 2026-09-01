import {questionsData, Question, Category} from '../data/questions';

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

export function getAllQuestions(): Question[] {
  return questionsData.categories.flatMap(c => c.questions);
}

