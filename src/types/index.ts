export type CategoryId =
  | 'alphabets'
  | 'numbers'
  | 'days'
  | 'months'
  | 'colours'
  | 'fruits'
  | 'vegetables';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface VocabularyItem {
  id: string;
  english: string;
  spanish: string; // Primary accepted answer
  alternatives: string[]; // Valid alternative accepted answers (e.g. regional variants)
  category: CategoryId;
  hasAccents: boolean;
  pronunciation?: string;
  examplePhrase?: string;
  exampleTranslation?: string;
  difficulty: DifficultyLevel;
  memoryHint?: string;
  gender?: 'el' | 'la' | 'los' | 'las' | 'masculine' | 'feminine' | 'neutral';
  regionalNotes?: string;
}

export type QuizMode =
  | 'multiple_choice'
  | 'type_translation'
  | 'spelling_challenge'
  | 'speed_round'
  | 'category_quiz'
  | 'mixed_quiz'
  | 'mistake_revision';

export interface QuizConfig {
  mode: QuizMode;
  category?: CategoryId | 'all';
  questionCount: number;
  difficulty: DifficultyLevel | 'all';
  strictAccents: boolean;
  timeLimitPerQuestion?: number; // In seconds (for speed round)
}

export interface QuizQuestion {
  id: string;
  vocab: VocabularyItem;
  direction: 'en_to_es' | 'es_to_en';
  questionType: 'multiple_choice' | 'text_input';
  options?: string[]; // for multiple choice
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpentMs?: number;
  answeredAt?: number;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  mode: QuizMode;
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeTakenSeconds: number;
  averageResponseTimeMs: number;
  xpEarned: number;
  questions: QuizQuestion[];
}

export interface MockTestSession {
  id: string;
  mode: 'strict' | 'practice';
  totalDurationSeconds: number;
  timeRemainingSeconds: number;
  isCompleted: boolean;
  startedAt: number;
  completedAt?: number;
  questions: QuizQuestion[];
  currentIndex: number;
  flaggedQuestionIds: string[];
  answers: Record<string, string>; // questionId -> answer
}

export interface WordProgress {
  vocabId: string;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  consecutiveCorrect: number;
  lastStudied: number;
  mastered: boolean; // 3+ consecutive correct typed/tested
  needsRevision: boolean;
  userNotes?: string;
  isFavorite?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  vocabIds: string[];
  targetAccuracy: number;
  completed: boolean;
  xpReward: number;
}

export interface UserSettings {
  studentName: string;
  theme: 'light' | 'dark' | 'system';
  dailyGoalWords: number;
  preferredQuizLength: number;
  strictAccents: boolean;
  pronunciationAudio: boolean;
  speechRate: number;
  soundEffects: boolean;
  reduceMotion: boolean;
  unlimitedHearts: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  subtitle: string;
  current: number;
  target: number;
  xpReward: number;
  claimed: boolean;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  institution: string;
  xp: number;
  streak: number;
  avatarColor: string;
  isCurrentStudent?: boolean;
}

export interface UserStats {
  xp: number;
  streakDays: number;
  longestStreak: number;
  hearts: number; // 0 to 5
  maxHearts: number;
  lastHeartRefillDate: string; // ISO
  lastActiveDate: string; // YYYY-MM-DD
  completedLessonIds: string[];
  totalQuizzesCompleted: number;
  totalMockTestsCompleted: number;
  totalStudyTimeMinutes: number;
  dailyProgress: Record<string, number>; // date (YYYY-MM-DD) -> words practiced count
  dailyQuests: Record<string, { lessonsDone: number; correctCount: number; mistakeReviewCount: number; claimedIds: string[] }>;
}

export interface DayPlanItem {
  day: number;
  title: string;
  category: CategoryId | 'mixed' | 'spelling' | 'speed' | 'mock' | 'revision';
  categoryLabel: string;
  focus: string;
  recommendedQuizMode: QuizMode;
  targetCount: number;
  completed: boolean;
  completedAt?: number;
}

