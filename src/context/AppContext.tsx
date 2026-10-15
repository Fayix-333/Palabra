import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {
  CategoryId,
  DayPlanItem,
  QuizResult,
  UserSettings,
  UserStats,
  WordProgress,
  Achievement,
  DailyQuest,
} from '../types';
import { VOCABULARY_DATABASE, CATEGORIES } from '../data/vocabulary';
import {
  LocalStorageManager,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
} from '../utils/storage';
import {
  subscribeToAuth,
  syncUserDataToFirestore,
  fetchUserDataFromFirestore,
  isFirebaseConfigured,
  loginWithGoogle,
  logoutUser,
  broadcastUserLogin,
} from '../utils/firebase';
import { soundManager } from '../utils/sound';

import {
  fireLessonCompleteConfetti,
  fireUnitTestConfetti,
  fireGoalAchievedConfetti,
} from '../components/common/ConfettiCelebration';

interface CategoryMasteryStat {
  categoryId: CategoryId;
  name: string;
  total: number;
  learned: number;
  mastered: number;
  percentage: number;
}

interface AppContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  stats: UserStats;
  hearts: number;
  maxHearts: number;
  consumeHeart: () => boolean;
  refillHearts: () => void;
  refillHeartsWithXp: (cost?: number) => boolean;
  completedLessonIds: string[];
  completeLesson: (lessonId: string, xpEarned: number) => void;
  dailyQuests: DailyQuest[];
  claimQuestReward: (questId: string) => void;
  recordQuestProgress: (type: 'lesson' | 'correct' | 'mistake', count?: number) => void;
  wordProgress: Record<string, WordProgress>;
  recordWordAttempt: (vocabId: string, isCorrect: boolean, isStrict: boolean) => void;
  toggleWordFavorite: (vocabId: string) => void;
  saveWordNote: (vocabId: string, note: string) => void;
  quizHistory: QuizResult[];
  recordQuizCompletion: (result: QuizResult) => void;
  mockHistory: QuizResult[];
  recordMockCompletion: (result: QuizResult) => void;
  achievements: Achievement[];
  studyPlan: DayPlanItem[];
  togglePlanDay: (day: number) => void;
  user: User | null;
  isFirebaseAvailable: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  manualCloudSync: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetAllProgress: () => void;
  awardXp: (amount: number, reason?: string) => void;
  // Streak & Daily Goal helpers
  streakDays: number;
  longestStreak: number;
  isDailyGoalAchieved: boolean;
  dailyGoalWords: number;
  dailyGoalPercentage: number;
  celebrateGoal: () => void;
  checkAndUpdateStreak: () => void;
  triggerCelebration: (type?: 'lesson' | 'unit' | 'goal' | 'streak') => void;
  // Computed helpers
  totalWordsCount: number;
  totalWordsLearned: number;
  totalWordsMastered: number;
  wordsNeedingRevision: number;
  overallAccuracy: number;
  averageResponseTimeMs: number;
  categoryStats: Record<CategoryId, CategoryMasteryStat>;
  weakestCategory: CategoryMasteryStat | null;
  frequentlyMisspelledWords: { vocabId: string; english: string; spanish: string; incorrectCount: number }[];
  todayWordsCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(LocalStorageManager.getSettings);
  const [stats, setStats] = useState<UserStats>(LocalStorageManager.getStats);
  const [wordProgress, setWordProgress] = useState<Record<string, WordProgress>>(
    LocalStorageManager.getWordProgress
  );
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(
    LocalStorageManager.getQuizHistory
  );
  const [mockHistory, setMockHistory] = useState<QuizResult[]>(
    LocalStorageManager.getMockHistory
  );
  const [achievements, setAchievements] = useState<Achievement[]>(
    LocalStorageManager.getAchievements
  );
  const [studyPlan, setStudyPlan] = useState<DayPlanItem[]>(
    LocalStorageManager.getStudyPlan
  );
  const [user, setUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<
    'idle' | 'syncing' | 'synced' | 'error'
  >('idle');

  // Apply dark theme class
  useEffect(() => {
    const root = document.documentElement;
    if (
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Auth subscription
  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          setCloudSyncStatus('syncing');
          const cloudData = await fetchUserDataFromFirestore(authUser.uid);
          if (cloudData) {
            if (cloudData.settings) {
              setSettings((prev) => {
                const merged: UserSettings = {
                  ...prev,
                  ...(cloudData.settings as UserSettings),
                  studentName:
                    authUser.displayName ||
                    (cloudData.settings as UserSettings)?.studentName ||
                    prev.studentName,
                };
                LocalStorageManager.saveSettings(merged);
                return merged;
              });
            }
            if (cloudData.stats) {
              const cs = cloudData.stats as UserStats;
              setStats((prev) => {
                const mergedLessonIds = Array.from(
                  new Set([...(prev.completedLessonIds || []), ...(cs.completedLessonIds || [])])
                );
                const merged: UserStats = {
                  ...prev,
                  ...cs,
                  xp: Math.max(prev.xp || 0, cs.xp || 0),
                  streakDays: Math.max(prev.streakDays || 1, cs.streakDays || 1),
                  longestStreak: Math.max(prev.longestStreak || 1, cs.longestStreak || 1),
                  completedLessonIds: mergedLessonIds,
                  dailyProgress: { ...(prev.dailyProgress || {}), ...(cs.dailyProgress || {}) },
                  dailyQuests: { ...(prev.dailyQuests || {}), ...(cs.dailyQuests || {}) },
                  goalAchievedDates: Array.from(
                    new Set([...(prev.goalAchievedDates || []), ...(cs.goalAchievedDates || [])])
                  ),
                };
                LocalStorageManager.saveStats(merged);
                return merged;
              });
            }
            if (cloudData.wordProgress) {
              const cp = cloudData.wordProgress as Record<string, WordProgress>;
              setWordProgress((prev) => {
                const merged: Record<string, WordProgress> = { ...prev };
                Object.entries(cp).forEach(([id, wp]) => {
                  const cur = merged[id];
                  if (!cur) {
                    merged[id] = wp;
                  } else {
                    merged[id] = {
                      ...cur,
                      ...wp,
                      timesSeen: Math.max(cur.timesSeen, wp.timesSeen),
                      timesCorrect: Math.max(cur.timesCorrect, wp.timesCorrect),
                      mastered: cur.mastered || wp.mastered,
                      isFavorite: cur.isFavorite || wp.isFavorite,
                    };
                  }
                });
                LocalStorageManager.saveWordProgress(merged);
                return merged;
              });
            }
            if (cloudData.quizHistory && Array.isArray(cloudData.quizHistory)) {
              setQuizHistory(cloudData.quizHistory as QuizResult[]);
              LocalStorageManager.saveQuizHistory(cloudData.quizHistory as QuizResult[]);
            }
            if (cloudData.mockHistory && Array.isArray(cloudData.mockHistory)) {
              setMockHistory(cloudData.mockHistory as QuizResult[]);
              LocalStorageManager.saveMockHistory(cloudData.mockHistory as QuizResult[]);
            }
            if (cloudData.studyPlan && Array.isArray(cloudData.studyPlan)) {
              setStudyPlan(cloudData.studyPlan as DayPlanItem[]);
              LocalStorageManager.saveStudyPlan(cloudData.studyPlan as DayPlanItem[]);
            }
            if (cloudData.achievements && Array.isArray(cloudData.achievements)) {
              setAchievements(cloudData.achievements as Achievement[]);
              LocalStorageManager.saveAchievements(cloudData.achievements as Achievement[]);
            }
          }
          setCloudSyncStatus('synced');
        } catch {
          setCloudSyncStatus('error');
        }
      }
    });
    return unsub;
  }, []);

  // Helper to get local date string YYYY-MM-DD
  const getTodayDateStr = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayDateStr();

  // Streak Manager: calculates daily login streak on mount and persists to LocalStorage
  const checkAndUpdateStreak = useCallback(() => {
    const todayStr = getTodayDateStr();
    setStats((prev) => {
      const lastDate = prev.lastActiveDate;
      let newStreak = prev.streakDays || 1;
      let needsSave = false;

      if (!lastDate) {
        newStreak = 1;
        needsSave = true;
      } else if (lastDate === todayStr) {
        // Logged in today; streak intact
        newStreak = Math.max(1, prev.streakDays || 1);
      } else {
        const [tY, tM, tD] = todayStr.split('-').map(Number);
        const [lY, lM, lD] = lastDate.split('-').map(Number);
        const todayUtc = Date.UTC(tY, tM - 1, tD);
        const lastUtc = Date.UTC(lY, lM - 1, lD);
        const diffDays = Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day login: increment streak!
          newStreak = (prev.streakDays || 0) + 1;
          needsSave = true;
        } else if (diffDays > 1) {
          // Streak broken after missing 1+ day
          newStreak = 1;
          needsSave = true;
        }
      }

      if (needsSave || prev.lastActiveDate !== todayStr) {
        const longest = Math.max(prev.longestStreak || 1, newStreak);
        const updated: UserStats = {
          ...prev,
          streakDays: newStreak,
          longestStreak: longest,
          lastActiveDate: todayStr,
          goalAchievedDates: prev.goalAchievedDates || [],
        };
        LocalStorageManager.saveStats(updated);
        return updated;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      LocalStorageManager.saveSettings(updated);
      return updated;
    });
  }, []);

  const awardXp = useCallback((amount: number, _reason?: string) => {
    setStats((prev) => {
      const updated = { ...prev, xp: prev.xp + amount };
      LocalStorageManager.saveStats(updated);
      return updated;
    });
  }, []);

  // Heart management
  const hearts = stats.hearts ?? 5;
  const maxHearts = stats.maxHearts ?? 5;

  const consumeHeart = useCallback((): boolean => {
    if (settings.unlimitedHearts) return true;
    if (hearts <= 0) return false;

    setStats((prev) => {
      const nextHearts = Math.max(0, (prev.hearts ?? 5) - 1);
      const updated = { ...prev, hearts: nextHearts };
      LocalStorageManager.saveStats(updated);
      return updated;
    });
    return true;
  }, [hearts, settings.unlimitedHearts]);

  const refillHearts = useCallback(() => {
    setStats((prev) => {
      const updated = {
        ...prev,
        hearts: 5,
        lastHeartRefillDate: new Date().toISOString(),
      };
      LocalStorageManager.saveStats(updated);
      return updated;
    });
    if (settings.soundEffects) {
      soundManager.playCorrect();
    }
  }, [settings.soundEffects]);

  const refillHeartsWithXp = useCallback(
    (cost: number = 50): boolean => {
      if (stats.xp < cost) return false;
      setStats((prev) => {
        const updated = {
          ...prev,
          xp: Math.max(0, prev.xp - cost),
          hearts: 5,
          lastHeartRefillDate: new Date().toISOString(),
        };
        LocalStorageManager.saveStats(updated);
        return updated;
      });
      if (settings.soundEffects) {
        soundManager.playCorrect();
      }
      return true;
    },
    [settings.soundEffects, stats.xp]
  );

  // Lesson completion
  const completedLessonIds = stats.completedLessonIds || [];

  const completeLesson = useCallback(
    (lessonId: string, xpEarned: number) => {
      const todayStr = getTodayDateStr();
      const isUnitTest = lessonId.includes('chk') || lessonId.includes('test');

      try {
        if (isUnitTest) {
          fireUnitTestConfetti();
        } else {
          fireLessonCompleteConfetti();
        }
      } catch {
        // ignore
      }

      setStats((prev) => {
        const alreadyDone = (prev.completedLessonIds || []).includes(lessonId);
        const updatedIds = alreadyDone
          ? prev.completedLessonIds
          : [...(prev.completedLessonIds || []), lessonId];

        // Quests update
        const todayQuests = prev.dailyQuests?.[todayStr] || {
          lessonsDone: 0,
          correctCount: 0,
          mistakeReviewCount: 0,
          claimedIds: [],
        };
        const updatedQuests = {
          ...prev.dailyQuests,
          [todayStr]: {
            ...todayQuests,
            lessonsDone: todayQuests.lessonsDone + 1,
          },
        };

        const updated = {
          ...prev,
          xp: prev.xp + xpEarned,
          completedLessonIds: updatedIds,
          dailyQuests: updatedQuests,
          lastActiveDate: todayStr,
        };
        LocalStorageManager.saveStats(updated);
        return updated;
      });
    },
    []
  );

  // Daily Quests
  const todayQuestData = stats.dailyQuests?.[today] || {
    lessonsDone: 0,
    correctCount: 0,
    mistakeReviewCount: 0,
    claimedIds: [],
  };

  const dailyQuests: DailyQuest[] = useMemo(() => {
    return [
      {
        id: 'quest-lessons',
        title: 'Complete 3 Lessons',
        subtitle: 'Advance along the learning path',
        current: Math.min(3, todayQuestData.lessonsDone),
        target: 3,
        xpReward: 30,
        claimed: todayQuestData.claimedIds.includes('quest-lessons'),
        icon: 'BookOpen',
      },
      {
        id: 'quest-correct',
        title: 'Score 20 Correct Words',
        subtitle: 'Accurate Spanish translations',
        current: Math.min(20, todayQuestData.correctCount),
        target: 20,
        xpReward: 40,
        claimed: todayQuestData.claimedIds.includes('quest-correct'),
        icon: 'CheckCircle2',
      },
      {
        id: 'quest-mistakes',
        title: 'Review 5 Weak Words',
        subtitle: 'Targeted mistake remediation',
        current: Math.min(5, todayQuestData.mistakeReviewCount),
        target: 5,
        xpReward: 30,
        claimed: todayQuestData.claimedIds.includes('quest-mistakes'),
        icon: 'RotateCcw',
      },
    ];
  }, [todayQuestData]);

  const claimQuestReward = useCallback(
    (questId: string) => {
      const quest = dailyQuests.find((q) => q.id === questId);
      if (!quest || quest.claimed || quest.current < quest.target) return;

      awardXp(quest.xpReward, `Completed Quest: ${quest.title}`);
      setStats((prev) => {
        const cur = prev.dailyQuests?.[today] || {
          lessonsDone: 0,
          correctCount: 0,
          mistakeReviewCount: 0,
          claimedIds: [],
        };
        const updated = {
          ...prev,
          dailyQuests: {
            ...prev.dailyQuests,
            [today]: {
              ...cur,
              claimedIds: [...cur.claimedIds, questId],
            },
          },
        };
        LocalStorageManager.saveStats(updated);
        return updated;
      });

      if (settings.soundEffects) {
        soundManager.playFanfare();
      }
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    },
    [awardXp, dailyQuests, settings.soundEffects, today]
  );

  const recordQuestProgress = useCallback(
    (type: 'lesson' | 'correct' | 'mistake', count: number = 1) => {
      setStats((prev) => {
        const cur = prev.dailyQuests?.[today] || {
          lessonsDone: 0,
          correctCount: 0,
          mistakeReviewCount: 0,
          claimedIds: [],
        };
        const nextLessons = type === 'lesson' ? cur.lessonsDone + count : cur.lessonsDone;
        const nextCorrect = type === 'correct' ? cur.correctCount + count : cur.correctCount;
        const nextMistakes = type === 'mistake' ? cur.mistakeReviewCount + count : cur.mistakeReviewCount;

        const updated = {
          ...prev,
          dailyQuests: {
            ...prev.dailyQuests,
            [today]: {
              ...cur,
              lessonsDone: nextLessons,
              correctCount: nextCorrect,
              mistakeReviewCount: nextMistakes,
            },
          },
        };
        LocalStorageManager.saveStats(updated);
        return updated;
      });
    },
    [today]
  );

  // Check achievements after state updates
  const checkAchievements = useCallback(
    (
      currentStats: UserStats,
      currentProgress: Record<string, WordProgress>,
      quizzes: QuizResult[],
      mocks: QuizResult[]
    ) => {
      setAchievements((prevAchs) => {
        let changed = false;
        const totalLearned = Object.values(currentProgress).filter((w) => w.timesSeen > 0).length;
        const totalPracticed = Object.values(currentProgress).reduce(
          (acc, w) => acc + w.timesSeen,
          0
        );

        const categoriesPracticed = new Set<string>();
        Object.keys(currentProgress).forEach((id) => {
          const item = VOCABULARY_DATABASE.find((v) => v.id === id);
          if (item && currentProgress[id].timesSeen > 0) {
            categoriesPracticed.add(item.category);
          }
        });

        const numberItemsMastered = Object.keys(currentProgress).filter((id) => {
          const item = VOCABULARY_DATABASE.find((v) => v.id === id);
          return item && item.category === 'numbers' && currentProgress[id].mastered;
        }).length;

        const updated = prevAchs.map((ach) => {
          let newProgress = ach.progress;
          if (ach.id === 'ach-first-10') newProgress = totalLearned;
          if (ach.id === 'ach-explorer') newProgress = categoriesPracticed.size;
          if (ach.id === 'ach-100-words') newProgress = totalPracticed;
          if (ach.id === 'ach-seven-day-streak') newProgress = currentStats.streakDays;
          if (ach.id === 'ach-mock-finisher') newProgress = mocks.length;
          if (ach.id === 'ach-number-master') newProgress = numberItemsMastered;
          if (ach.id === 'ach-speed-learner') {
            const hasSpeed = quizzes.some((q) => q.mode === 'speed_round');
            newProgress = hasSpeed ? 1 : 0;
          }
          if (ach.id === 'ach-perfect-spelling') {
            const hasPerfect = quizzes.some(
              (q) => q.mode === 'spelling_challenge' && q.accuracy === 100
            );
            newProgress = hasPerfect ? 1 : 0;
          }

          const clampedProgress = Math.min(newProgress, ach.maxProgress);
          const justUnlocked = !ach.unlockedAt && clampedProgress >= ach.maxProgress;

          if (justUnlocked) {
            changed = true;
            if (settings.soundEffects) {
              soundManager.playFanfare();
            }
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
            awardXp(ach.xpReward);
            return {
              ...ach,
              progress: clampedProgress,
              unlockedAt: Date.now(),
            };
          }

          if (clampedProgress !== ach.progress) {
            changed = true;
            return { ...ach, progress: clampedProgress };
          }
          return ach;
        });

        if (changed) {
          LocalStorageManager.saveAchievements(updated);
        }
        return changed ? updated : prevAchs;
      });
    },
    [awardXp, settings.soundEffects]
  );

  const recordWordAttempt = useCallback(
    (vocabId: string, isCorrect: boolean, isStrict: boolean) => {
      setWordProgress((prev) => {
        const existing = prev[vocabId] || {
          vocabId,
          timesSeen: 0,
          timesCorrect: 0,
          timesIncorrect: 0,
          consecutiveCorrect: 0,
          lastStudied: Date.now(),
          mastered: false,
          needsRevision: false,
        };

        const newConsecutive = isCorrect ? existing.consecutiveCorrect + 1 : 0;
        const isMastered = isCorrect
          ? existing.mastered || (newConsecutive >= 3 && isStrict)
          : false;

        const updatedItem: WordProgress = {
          ...existing,
          timesSeen: existing.timesSeen + 1,
          timesCorrect: existing.timesCorrect + (isCorrect ? 1 : 0),
          timesIncorrect: existing.timesIncorrect + (isCorrect ? 0 : 1),
          consecutiveCorrect: newConsecutive,
          lastStudied: Date.now(),
          mastered: isMastered,
          needsRevision: !isCorrect || (!isMastered && existing.timesIncorrect > 0),
        };

        const nextProgress = { ...prev, [vocabId]: updatedItem };
        LocalStorageManager.saveWordProgress(nextProgress);
        return nextProgress;
      });

      if (isCorrect) {
        recordQuestProgress('correct', 1);
      }

      // Update daily word practice stats and check daily goal
      setStats((prevStats) => {
        const currentCount = prevStats.dailyProgress[today] || 0;
        const newCount = currentCount + 1;
        const updatedDaily = { ...prevStats.dailyProgress, [today]: newCount };

        let xpBonus = 0;
        const wasGoalMet = currentCount >= settings.dailyGoalWords;
        const goalMet = newCount >= settings.dailyGoalWords;
        const goalDates = prevStats.goalAchievedDates || [];

        if (!wasGoalMet && goalMet) {
          xpBonus = 35; // Sibaq daily goal bonus
          if (settings.soundEffects) {
            soundManager.playFanfare();
          }
          try {
            fireGoalAchievedConfetti();
          } catch {
            // ignore
          }
        }

        const nextStats = {
          ...prevStats,
          xp: prevStats.xp + (isCorrect ? 10 : 0) + xpBonus,
          dailyProgress: updatedDaily,
          goalAchievedDates:
            goalMet && !goalDates.includes(today) ? [...goalDates, today] : goalDates,
          lastActiveDate: today,
        };
        LocalStorageManager.saveStats(nextStats);
        return nextStats;
      });
    },
    [recordQuestProgress, settings.dailyGoalWords, settings.soundEffects, today]
  );

  const toggleWordFavorite = useCallback((vocabId: string) => {
    setWordProgress((prev) => {
      const item = prev[vocabId] || {
        vocabId,
        timesSeen: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        consecutiveCorrect: 0,
        lastStudied: Date.now(),
        mastered: false,
        needsRevision: false,
      };
      const updated = {
        ...prev,
        [vocabId]: { ...item, isFavorite: !item.isFavorite },
      };
      LocalStorageManager.saveWordProgress(updated);
      return updated;
    });
  }, []);

  const saveWordNote = useCallback((vocabId: string, note: string) => {
    setWordProgress((prev) => {
      const item = prev[vocabId] || {
        vocabId,
        timesSeen: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        consecutiveCorrect: 0,
        lastStudied: Date.now(),
        mastered: false,
        needsRevision: false,
      };
      const updated = {
        ...prev,
        [vocabId]: { ...item, userNotes: note },
      };
      LocalStorageManager.saveWordProgress(updated);
      return updated;
    });
  }, []);

  const recordQuizCompletion = useCallback(
    (result: QuizResult) => {
      LocalStorageManager.saveQuizResult(result);
      setQuizHistory((prev) => [result, ...prev]);

      setStats((prev) => {
        const next = {
          ...prev,
          xp: prev.xp + result.xpEarned,
          totalQuizzesCompleted: prev.totalQuizzesCompleted + 1,
          totalStudyTimeMinutes:
            prev.totalStudyTimeMinutes + Math.round(result.timeTakenSeconds / 60),
        };
        LocalStorageManager.saveStats(next);
        checkAchievements(next, wordProgress, [result, ...quizHistory], mockHistory);
        return next;
      });
    },
    [checkAchievements, mockHistory, quizHistory, wordProgress]
  );

  const recordMockCompletion = useCallback(
    (result: QuizResult) => {
      LocalStorageManager.saveMockResult(result);
      setMockHistory((prev) => [result, ...prev]);

      setStats((prev) => {
        const next = {
          ...prev,
          xp: prev.xp + result.xpEarned,
          totalMockTestsCompleted: prev.totalMockTestsCompleted + 1,
          totalStudyTimeMinutes:
            prev.totalStudyTimeMinutes + Math.round(result.timeTakenSeconds / 60),
        };
        LocalStorageManager.saveStats(next);
        checkAchievements(next, wordProgress, quizHistory, [result, ...mockHistory]);
        return next;
      });
    },
    [checkAchievements, mockHistory, quizHistory, wordProgress]
  );

  const togglePlanDay = useCallback((dayNumber: number) => {
    setStudyPlan((prev) => {
      const updated = prev.map((item) => {
        if (item.day === dayNumber) {
          const nextState = !item.completed;
          return {
            ...item,
            completed: nextState,
            completedAt: nextState ? Date.now() : undefined,
          };
        }
        return item;
      });
      LocalStorageManager.saveStudyPlan(updated);
      return updated;
    });
  }, []);

  const restoreAndPersistUserData = useCallback(
    (cloudData: Record<string, unknown>, authUser: User) => {
      // 1. Settings
      if (cloudData.settings) {
        setSettings((prev) => {
          const merged: UserSettings = {
            ...prev,
            ...(cloudData.settings as UserSettings),
            studentName:
              authUser.displayName ||
              (cloudData.settings as UserSettings)?.studentName ||
              prev.studentName,
          };
          LocalStorageManager.saveSettings(merged);
          return merged;
        });
      }

      // 2. Stats & Lessons
      if (cloudData.stats) {
        const cs = cloudData.stats as UserStats;
        setStats((prev) => {
          const mergedLessonIds = Array.from(
            new Set([...(prev.completedLessonIds || []), ...(cs.completedLessonIds || [])])
          );
          const merged: UserStats = {
            ...prev,
            ...cs,
            xp: Math.max(prev.xp || 0, cs.xp || 0),
            streakDays: Math.max(prev.streakDays || 1, cs.streakDays || 1),
            longestStreak: Math.max(prev.longestStreak || 1, cs.longestStreak || 1),
            completedLessonIds: mergedLessonIds,
            dailyProgress: { ...(prev.dailyProgress || {}), ...(cs.dailyProgress || {}) },
            dailyQuests: { ...(prev.dailyQuests || {}), ...(cs.dailyQuests || {}) },
            goalAchievedDates: Array.from(
              new Set([...(prev.goalAchievedDates || []), ...(cs.goalAchievedDates || [])])
            ),
          };
          LocalStorageManager.saveStats(merged);
          return merged;
        });
      }

      // 3. Word Progress
      if (cloudData.wordProgress) {
        const cp = cloudData.wordProgress as Record<string, WordProgress>;
        setWordProgress((prev) => {
          const merged: Record<string, WordProgress> = { ...prev };
          Object.entries(cp).forEach(([id, wp]) => {
            const cur = merged[id];
            if (!cur) {
              merged[id] = wp;
            } else {
              merged[id] = {
                ...cur,
                ...wp,
                timesSeen: Math.max(cur.timesSeen, wp.timesSeen),
                timesCorrect: Math.max(cur.timesCorrect, wp.timesCorrect),
                mastered: cur.mastered || wp.mastered,
                isFavorite: cur.isFavorite || wp.isFavorite,
              };
            }
          });
          LocalStorageManager.saveWordProgress(merged);
          return merged;
        });
      }

      // 4. Quiz History
      if (cloudData.quizHistory && Array.isArray(cloudData.quizHistory)) {
        setQuizHistory(cloudData.quizHistory as QuizResult[]);
        LocalStorageManager.saveQuizHistory(cloudData.quizHistory as QuizResult[]);
      }

      // 5. Mock History
      if (cloudData.mockHistory && Array.isArray(cloudData.mockHistory)) {
        setMockHistory(cloudData.mockHistory as QuizResult[]);
        LocalStorageManager.saveMockHistory(cloudData.mockHistory as QuizResult[]);
      }

      // 6. Study Plan
      if (cloudData.studyPlan && Array.isArray(cloudData.studyPlan)) {
        setStudyPlan(cloudData.studyPlan as DayPlanItem[]);
        LocalStorageManager.saveStudyPlan(cloudData.studyPlan as DayPlanItem[]);
      }

      // 7. Achievements
      if (cloudData.achievements && Array.isArray(cloudData.achievements)) {
        setAchievements(cloudData.achievements as Achievement[]);
        LocalStorageManager.saveAchievements(cloudData.achievements as Achievement[]);
      }
    },
    []
  );

  const manualCloudSync = useCallback(async () => {
    if (!user || !isFirebaseConfigured) return;
    try {
      setCloudSyncStatus('syncing');
      await syncUserDataToFirestore(user.uid, {
        userId: user.uid,
        settings,
        stats,
        wordProgress,
        quizHistory: quizHistory.slice(0, 50),
        mockHistory: mockHistory.slice(0, 30),
        studyPlan,
        achievements,
        updatedAt: Date.now(),
      });
      setCloudSyncStatus('synced');
    } catch {
      setCloudSyncStatus('error');
    }
  }, [achievements, mockHistory, quizHistory, settings, stats, studyPlan, user, wordProgress]);

  // Debounced auto-sync to cloud when logged in
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    const timer = setTimeout(() => {
      setCloudSyncStatus('syncing');
      syncUserDataToFirestore(user.uid, {
        userId: user.uid,
        settings,
        stats,
        wordProgress,
        quizHistory: quizHistory.slice(0, 50),
        mockHistory: mockHistory.slice(0, 30),
        studyPlan,
        achievements,
        updatedAt: Date.now(),
      })
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('error'));
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, stats, wordProgress, quizHistory, mockHistory, studyPlan, achievements, settings]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setCloudSyncStatus('syncing');
      const authUser = await loginWithGoogle();
      if (authUser) {
        setUser(authUser);
        // Load cloud data and persist to localStorage
        const cloudData = await fetchUserDataFromFirestore(authUser.uid);
        if (cloudData) {
          restoreAndPersistUserData(cloudData, authUser);
        } else {
          // Initialize new cloud account with existing progress
          await syncUserDataToFirestore(authUser.uid, {
            userId: authUser.uid,
            settings: {
              ...settings,
              studentName: authUser.displayName || settings.studentName,
            },
            stats,
            wordProgress,
            quizHistory: quizHistory.slice(0, 50),
            mockHistory: mockHistory.slice(0, 30),
            studyPlan,
            achievements,
            updatedAt: Date.now(),
          });
        }

        // Broadcast to all other learners in real time!
        await broadcastUserLogin(authUser);
        setCloudSyncStatus('synced');
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      setCloudSyncStatus('error');
      throw err;
    }
  }, [achievements, mockHistory, quizHistory, restoreAndPersistUserData, settings, stats, studyPlan, wordProgress]);

  const signOutUser = useCallback(async () => {
    // Before signing out, flush all latest progress to Firestore to guarantee ZERO data loss!
    if (user && isFirebaseConfigured) {
      try {
        setCloudSyncStatus('syncing');
        await syncUserDataToFirestore(user.uid, {
          userId: user.uid,
          settings,
          stats,
          wordProgress,
          quizHistory: quizHistory.slice(0, 50),
          mockHistory: mockHistory.slice(0, 30),
          studyPlan,
          achievements,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.warn('Pre-signout sync warning:', err);
      }
    }

    await logoutUser();
    setUser(null);
    setCloudSyncStatus('idle');
  }, [achievements, mockHistory, quizHistory, settings, stats, studyPlan, user, wordProgress]);

  const resetAllProgress = useCallback(() => {
    LocalStorageManager.resetAll();
    setSettings(DEFAULT_SETTINGS);
    setStats(DEFAULT_STATS);
    setWordProgress({});
    setQuizHistory([]);
    setMockHistory([]);
    setAchievements(LocalStorageManager.getAchievements());
    setStudyPlan(LocalStorageManager.getStudyPlan());
  }, []);

  // Computed values
  const totalWordsCount = VOCABULARY_DATABASE.length;

  const totalWordsLearned = useMemo(() => {
    return Object.values(wordProgress).filter((w) => w.timesSeen > 0).length;
  }, [wordProgress]);

  const totalWordsMastered = useMemo(() => {
    return Object.values(wordProgress).filter((w) => w.mastered).length;
  }, [wordProgress]);

  const wordsNeedingRevision = useMemo(() => {
    return Object.values(wordProgress).filter((w) => w.needsRevision).length;
  }, [wordProgress]);

  const overallAccuracy = useMemo(() => {
    const items = Object.values(wordProgress);
    const totalSeen = items.reduce((acc, i) => acc + i.timesSeen, 0);
    const totalCorrect = items.reduce((acc, i) => acc + i.timesCorrect, 0);
    return totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;
  }, [wordProgress]);

  const averageResponseTimeMs = useMemo(() => {
    if (quizHistory.length === 0) return 0;
    const sum = quizHistory.reduce((acc, q) => acc + (q.averageResponseTimeMs || 0), 0);
    return Math.round(sum / quizHistory.length);
  }, [quizHistory]);

  const categoryStats = useMemo(() => {
    const statsMap: Record<CategoryId, CategoryMasteryStat> = {} as Record<
      CategoryId,
      CategoryMasteryStat
    >;

    CATEGORIES.forEach((cat) => {
      const items = VOCABULARY_DATABASE.filter((v) => v.category === cat.id);
      const learned = items.filter((v) => (wordProgress[v.id]?.timesSeen || 0) > 0).length;
      const mastered = items.filter((v) => wordProgress[v.id]?.mastered).length;
      const percentage = items.length > 0 ? Math.round((mastered / items.length) * 100) : 0;

      statsMap[cat.id] = {
        categoryId: cat.id,
        name: cat.name,
        total: items.length,
        learned,
        mastered,
        percentage,
      };
    });

    return statsMap;
  }, [wordProgress]);

  const weakestCategory = useMemo(() => {
    const cats = Object.values(categoryStats);
    if (cats.length === 0) return null;
    return [...cats].sort((a, b) => a.percentage - b.percentage)[0];
  }, [categoryStats]);

  const frequentlyMisspelledWords = useMemo(() => {
    return Object.values(wordProgress)
      .filter((w) => w.timesIncorrect > 0)
      .sort((a, b) => b.timesIncorrect - a.timesIncorrect)
      .slice(0, 10)
      .map((w) => {
        const item = VOCABULARY_DATABASE.find((v) => v.id === w.vocabId);
        return {
          vocabId: w.vocabId,
          english: item?.english || 'Unknown',
          spanish: item?.spanish || 'Unknown',
          incorrectCount: w.timesIncorrect,
        };
      });
  }, [wordProgress]);

  const todayWordsCount = stats.dailyProgress[today] || 0;
  const streakDays = stats.streakDays || 1;
  const longestStreak = stats.longestStreak || 1;
  const dailyGoalWords = settings.dailyGoalWords || 20;
  const isDailyGoalAchieved = todayWordsCount >= dailyGoalWords;
  const dailyGoalPercentage = Math.min(
    100,
    Math.round((todayWordsCount / dailyGoalWords) * 100)
  );

  const celebrateGoal = useCallback(() => {
    fireGoalAchievedConfetti();
    if (settings.soundEffects) {
      soundManager.playFanfare();
    }
  }, [settings.soundEffects]);

  const triggerCelebration = useCallback(
    (type: 'lesson' | 'unit' | 'goal' | 'streak' = 'lesson') => {
      if (type === 'unit') {
        fireUnitTestConfetti();
      } else if (type === 'goal' || type === 'streak') {
        fireGoalAchievedConfetti();
      } else {
        fireLessonCompleteConfetti();
      }
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        stats,
        hearts,
        maxHearts,
        consumeHeart,
        refillHearts,
        refillHeartsWithXp,
        completedLessonIds,
        completeLesson,
        dailyQuests,
        claimQuestReward,
        recordQuestProgress,
        wordProgress,
        recordWordAttempt,
        toggleWordFavorite,
        saveWordNote,
        quizHistory,
        recordQuizCompletion,
        mockHistory,
        recordMockCompletion,
        achievements,
        studyPlan,
        togglePlanDay,
        user,
        isFirebaseAvailable: isFirebaseConfigured,
        cloudSyncStatus,
        manualCloudSync,
        signInWithGoogle,
        signOutUser,
        resetAllProgress,
        awardXp,
        streakDays,
        longestStreak,
        isDailyGoalAchieved,
        dailyGoalWords,
        dailyGoalPercentage,
        celebrateGoal,
        checkAndUpdateStreak,
        triggerCelebration,
        totalWordsCount,
        totalWordsLearned,
        totalWordsMastered,
        wordsNeedingRevision,
        overallAccuracy,
        averageResponseTimeMs,
        categoryStats,
        weakestCategory,
        frequentlyMisspelledWords,
        todayWordsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
