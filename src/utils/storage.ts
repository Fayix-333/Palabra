import {
  Achievement,
  DayPlanItem,
  MockTestSession,
  QuizResult,
  UserSettings,
  UserStats,
  WordProgress,
} from '../types';
import { INITIAL_STUDY_PLAN } from '../data/studyPlan';

const STORAGE_KEYS = {
  SETTINGS: 'palabra_user_settings',
  STATS: 'palabra_user_stats',
  WORD_PROGRESS: 'palabra_word_progress',
  QUIZ_HISTORY: 'palabra_quiz_history',
  MOCK_HISTORY: 'palabra_mock_history',
  ACHIEVEMENTS: 'palabra_achievements',
  STUDY_PLAN: 'palabra_study_plan',
  ACTIVE_MOCK: 'palabra_active_mock_session',
};

export const DEFAULT_SETTINGS: UserSettings = {
  studentName: 'Sibaq Aspirant',
  theme: 'light',
  dailyGoalWords: 20,
  preferredQuizLength: 20,
  strictAccents: true,
  pronunciationAudio: true,
  speechRate: 0.9,
  soundEffects: true,
  reduceMotion: false,
  unlimitedHearts: false,
};

export const DEFAULT_STATS: UserStats = {
  xp: 120, // Starting bonus XP
  streakDays: 1,
  longestStreak: 1,
  hearts: 5,
  maxHearts: 5,
  lastHeartRefillDate: new Date().toISOString(),
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessonIds: [],
  totalQuizzesCompleted: 0,
  totalMockTestsCompleted: 0,
  totalStudyTimeMinutes: 0,
  dailyProgress: {},
  dailyQuests: {},
  goalAchievedDates: [],
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-10',
    title: 'First 10 Words',
    description: 'Learn or practice your first 10 Spanish vocabulary items.',
    icon: 'Sparkles',
    progress: 0,
    maxProgress: 10,
    xpReward: 50,
  },
  {
    id: 'ach-explorer',
    title: 'Vocabulary Explorer',
    description: 'Practice words from all 7 official Sibaq syllabus categories.',
    icon: 'Compass',
    progress: 0,
    maxProgress: 7,
    xpReward: 100,
  },
  {
    id: 'ach-perfect-spelling',
    title: 'Perfect Spelling',
    description: 'Score 100% on a Spelling Challenge with strict accents enabled.',
    icon: 'CheckCircle2',
    progress: 0,
    maxProgress: 1,
    xpReward: 80,
  },
  {
    id: 'ach-speed-learner',
    title: 'Speed Learner',
    description: 'Complete a Speed Round quiz under strict countdown pressure.',
    icon: 'Zap',
    progress: 0,
    maxProgress: 1,
    xpReward: 60,
  },
  {
    id: 'ach-100-words',
    title: '100 Words Practised',
    description: 'Practice 100 vocabulary words across learn and quiz modes.',
    icon: 'Award',
    progress: 0,
    maxProgress: 100,
    xpReward: 150,
  },
  {
    id: 'ach-seven-day-streak',
    title: 'Seven-Day Streak',
    description: 'Maintain a 7-day daily study streak.',
    icon: 'Flame',
    progress: 1,
    maxProgress: 7,
    xpReward: 200,
  },
  {
    id: 'ach-mock-finisher',
    title: 'Sibaq Simulation Finisher',
    description: 'Complete a full 60-Minute Sibaq Mock Competition.',
    icon: 'Trophy',
    progress: 0,
    maxProgress: 1,
    xpReward: 250,
  },
  {
    id: 'ach-number-master',
    title: 'Master of Numbers',
    description: 'Master at least 15 Spanish numbers with correct accents.',
    icon: 'Hash',
    progress: 0,
    maxProgress: 15,
    xpReward: 100,
  },
];

export class LocalStorageManager {
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Storage unavailable
    }
  }

  static getStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) return DEFAULT_STATS;
      const parsed = JSON.parse(data);
      // Validate streak
      const today = new Date().toISOString().split('T')[0];
      const lastActive = parsed.lastActiveDate || today;

      const date1 = new Date(lastActive);
      const date2 = new Date(today);
      const diffDays = Math.floor(
        (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
      );

      let streak = parsed.streakDays || 1;
      if (diffDays === 1) {
        // Continuous streak
      } else if (diffDays > 1) {
        // Streak broken
        streak = 1;
      }

      return {
        ...DEFAULT_STATS,
        ...parsed,
        streakDays: streak,
        longestStreak: Math.max(parsed.longestStreak || 1, streak),
        lastActiveDate: today,
      };
    } catch {
      return DEFAULT_STATS;
    }
  }

  static saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {
      // Storage unavailable
    }
  }

  static getWordProgress(): Record<string, WordProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORD_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveWordProgress(progress: Record<string, WordProgress>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORD_PROGRESS, JSON.stringify(progress));
    } catch {
      // Storage unavailable
    }
  }

  static getQuizHistory(): QuizResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveQuizResult(result: QuizResult): void {
    try {
      const history = LocalStorageManager.getQuizHistory();
      history.unshift(result);
      // Keep up to 100 recent results
      const trimmed = history.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(trimmed));
    } catch {
      // Storage unavailable
    }
  }

  static getMockHistory(): QuizResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOCK_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveMockResult(result: QuizResult): void {
    try {
      const history = LocalStorageManager.getMockHistory();
      history.unshift(result);
      localStorage.setItem(STORAGE_KEYS.MOCK_HISTORY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // Storage unavailable
    }
  }

  static saveQuizHistory(history: QuizResult[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history.slice(0, 100)));
    } catch {
      // Storage unavailable
    }
  }

  static saveMockHistory(history: QuizResult[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MOCK_HISTORY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // Storage unavailable
    }
  }

  static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) return INITIAL_ACHIEVEMENTS;
      const stored = JSON.parse(data) as Achievement[];
      // Merge with INITIAL_ACHIEVEMENTS in case new achievements were added
      return INITIAL_ACHIEVEMENTS.map((init) => {
        const found = stored.find((s) => s.id === init.id);
        return found ? { ...init, ...found } : init;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  static saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {
      // Storage unavailable
    }
  }

  static getStudyPlan(): DayPlanItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN);
      if (!data) return INITIAL_STUDY_PLAN;
      const stored = JSON.parse(data) as DayPlanItem[];
      return INITIAL_STUDY_PLAN.map((init) => {
        const found = stored.find((s) => s.day === init.day);
        return found ? { ...init, ...found } : init;
      });
    } catch {
      return INITIAL_STUDY_PLAN;
    }
  }

  static saveStudyPlan(plan: DayPlanItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(plan));
    } catch {
      // Storage unavailable
    }
  }

  static getActiveMockSession(): MockTestSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_MOCK);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveActiveMockSession(session: MockTestSession | null): void {
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_MOCK);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MOCK, JSON.stringify(session));
      }
    } catch {
      // Storage unavailable
    }
  }

  static exportAllData(): string {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: LocalStorageManager.getSettings(),
      stats: LocalStorageManager.getStats(),
      wordProgress: LocalStorageManager.getWordProgress(),
      quizHistory: LocalStorageManager.getQuizHistory(),
      mockHistory: LocalStorageManager.getMockHistory(),
      achievements: LocalStorageManager.getAchievements(),
      studyPlan: LocalStorageManager.getStudyPlan(),
    };
    return JSON.stringify(exportData, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) LocalStorageManager.saveSettings(data.settings);
      if (data.stats) LocalStorageManager.saveStats(data.stats);
      if (data.wordProgress) LocalStorageManager.saveWordProgress(data.wordProgress);
      if (data.achievements) LocalStorageManager.saveAchievements(data.achievements);
      if (data.studyPlan) LocalStorageManager.saveStudyPlan(data.studyPlan);
      if (data.quizHistory) {
        localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(data.quizHistory));
      }
      if (data.mockHistory) {
        localStorage.setItem(STORAGE_KEYS.MOCK_HISTORY, JSON.stringify(data.mockHistory));
      }
      return true;
    } catch {
      return false;
    }
  }

  static resetAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch {
      // Storage unavailable
    }
  }
}
