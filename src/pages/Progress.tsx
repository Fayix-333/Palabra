import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  AlertOctagon,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
  History,
  Target,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, VOCABULARY_DATABASE } from '../data/vocabulary';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';

export const Progress: React.FC = () => {
  const {
    stats,
    wordProgress,
    totalWordsCount,
    totalWordsLearned,
    totalWordsMastered,
    wordsNeedingRevision,
    overallAccuracy,
    averageResponseTimeMs,
    categoryStats,
    weakestCategory,
    frequentlyMisspelledWords,
    quizHistory,
    mockHistory,
    achievements,
    resetAllProgress,
  } = useApp();

  const [showResetModal, setShowResetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'history' | 'achievements'>('overview');

  // Daily study progress for last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = stats.dailyProgress[dateStr] || 0;
    return { dateStr, dayName, count };
  });

  const maxDailyCount = Math.max(1, ...last7Days.map((d) => d.count));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Progress & Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Performance Analytics & Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track vocabulary retention, study streaks, and competition readiness
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors"
        >
          Reset Progress
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Quiz History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Achievements
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Words Mastered
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  {totalWordsMastered}
                </span>
                <span className="text-xs text-slate-400">/ {totalWordsCount}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Criteria: 3+ correct strict answers
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Overall Accuracy
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  {overallAccuracy}%
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Across all quizzes & learn
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Active Streak
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-display text-amber-500 font-mono">
                  {stats.streakDays}
                </span>
                <span className="text-xs text-slate-400">days</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Longest: {stats.longestStreak} days
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Total Study Time
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-white font-mono">
                  {stats.totalStudyTimeMinutes}
                </span>
                <span className="text-xs text-slate-400">min</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {stats.totalQuizzesCompleted} quizzes completed
              </span>
            </div>
          </div>

          {/* 7-Day Activity Chart */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                  7-Day Practice Volume
                </h3>
                <p className="text-xs text-slate-500">Words answered per day</p>
              </div>
              <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
                Weekly Total: {last7Days.reduce((acc, d) => acc + d.count, 0)} words
              </span>
            </div>

            <div className="h-36 flex items-end justify-between gap-2 pt-4">
              {last7Days.map((d) => {
                const heightPct = Math.max(8, Math.round((d.count / maxDailyCount) * 100));
                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">{d.count}</span>
                    <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-24 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-rose-600 dark:bg-rose-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${d.count > 0 ? heightPct : 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weakest Area & Most Frequently Misspelled Words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weakest Area */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                Focus Syllabus Area
              </h3>

              {weakestCategory ? (
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {weakestCategory.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-amber-600">
                      {weakestCategory.percentage}% mastery
                    </span>
                  </div>

                  <ProgressBar
                    value={weakestCategory.percentage}
                    size="sm"
                    showPercentage={false}
                    colorClassName="bg-amber-500"
                  />

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {weakestCategory.name} has the lowest mastery level across your attempts.
                    Targeted practice here will give you the fastest scoring boost.
                  </p>

                  <Link
                    to={`/quiz?category=${weakestCategory.categoryId}&mode=type_translation`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    Drill {weakestCategory.name} Now
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4">No category data recorded yet.</p>
              )}
            </div>

            {/* Most Misspelled Words */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                Frequent Spelling Traps
              </h3>

              {frequentlyMisspelledWords.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {frequentlyMisspelledWords.slice(0, 5).map((w) => (
                    <div
                      key={w.vocabId}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {w.english}
                        </span>{' '}
                        → <span className="text-rose-600 font-medium">{w.spanish}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {w.incorrectCount} missed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p>Zero spelling traps! Your accuracy is spotless.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES BREAKDOWN */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const stat = categoryStats[cat.id];
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
                >
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-rose-600">{cat.spanishName}</p>
                    </div>
                    <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                      {stat.percentage}%
                    </span>
                  </div>

                  <ProgressBar
                    value={stat.percentage}
                    size="md"
                    showPercentage={false}
                    colorClassName="bg-rose-600 dark:bg-rose-500"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>
                      {stat.mastered} of {stat.total} words mastered
                    </span>
                    <Link
                      to={`/quiz?category=${cat.id}&mode=type_translation`}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ & MOCK HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Recent Quizzes & Mocks ({quizHistory.length + mockHistory.length} Sessions)
            </h3>

            {quizHistory.length === 0 && mockHistory.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                No quiz history yet. Take your first quiz in the Practice section!
              </div>
            ) : (
              <div className="space-y-2">
                {[...mockHistory, ...quizHistory]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white capitalize">
                            {res.mode.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 capitalize">{res.category}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(res.timestamp).toLocaleDateString()} at{' '}
                          {new Date(res.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {res.correctAnswers} / {res.totalQuestions}
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              res.accuracy >= 80 ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {res.accuracy}%
                          </span>
                        </div>

                        <span className="font-mono text-purple-600 font-semibold">
                          +{res.xpEarned} XP
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            const pct = Math.round((ach.progress / ach.maxProgress) * 100);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {ach.title}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-purple-600">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{ach.description}</p>
                  <div className="pt-1.5">
                    <ProgressBar
                      value={pct}
                      size="sm"
                      showPercentage={false}
                      colorClassName={isUnlocked ? 'bg-amber-500' : 'bg-slate-300'}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                      <span>{isUnlocked ? 'Unlocked' : `${pct}%`}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal For Reset */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Progress?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This action will clear all your study streaks, quiz history, word mastery statuses, and
            achievements. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetAllProgress();
                setShowResetModal(false);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
