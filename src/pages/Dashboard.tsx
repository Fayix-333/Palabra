import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Flame,
  Award,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Zap,
  Timer,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, VOCABULARY_DATABASE } from '../data/vocabulary';
import { ProgressBar } from '../components/common/ProgressBar';
import { CategoryId } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    stats,
    totalWordsCount,
    totalWordsLearned,
    totalWordsMastered,
    wordsNeedingRevision,
    overallAccuracy,
    averageResponseTimeMs,
    categoryStats,
    todayWordsCount,
    awardXp,
  } = useApp();

  const [dailyClaimed, setDailyClaimed] = useState(false);

  // Daily challenge calculation
  const todayGoalMet = todayWordsCount >= settings.dailyGoalWords;
  const handleClaimDailyChallenge = () => {
    if (todayGoalMet && !dailyClaimed) {
      awardXp(50, 'Daily Challenge Completed');
      setDailyClaimed(true);
    }
  };

  const handleStartCategory = (categoryId: CategoryId) => {
    navigate(`/learn?category=${categoryId}`);
  };

  const handleQuickQuiz = (mode: string, count: number = 20) => {
    navigate(`/quiz?mode=${mode}&count=${count}&category=all`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* A. Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
              PALABRA TN.31 • DHIU Sibaq National Arts Fest
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {stats.streakDays} Day Streak
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            ¡Hola, {settings.studentName}!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Ready to master Spanish vocabulary for the 60-minute translation competition? Train with
            strict accents, practice rapid typing, and conquer all seven official syllabus areas.
          </p>

          {/* Today's goal bar */}
          <div className="pt-2 max-w-md">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5 font-medium">
              <span>Today's Goal: {todayWordsCount} of {settings.dailyGoalWords} words practiced</span>
              <span className="font-mono text-amber-300">
                {Math.min(100, Math.round((todayWordsCount / settings.dailyGoalWords) * 100))}%
              </span>
            </div>
            <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-rose-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (todayWordsCount / settings.dailyGoalWords) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Primary CTA buttons */}
          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all shadow-md active:scale-98"
            >
              <BookOpen className="w-4 h-4" />
              Continue Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/mock-test"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 text-sm font-medium transition-all"
            >
              <Timer className="w-4 h-4 text-rose-400" />
              60-Min Mock Test
            </Link>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 text-sm font-medium transition-all"
            >
              15-Day Plan
            </Link>
          </div>
        </div>
      </section>

      {/* B. Performance Overview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-600" />
            Performance Overview
          </h2>
          <Link
            to="/progress"
            className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Words Learned</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {totalWordsLearned}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {totalWordsCount}</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
              {Math.round((totalWordsLearned / Math.max(1, totalWordsCount)) * 100)}% of syllabus
            </span>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mastered</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {totalWordsMastered}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">3+ correct strict</span>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Need Revision</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">
                {wordsNeedingRevision}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {wordsNeedingRevision > 0 ? (
                <Link to="/practice?mode=mistake_revision" className="text-rose-600 underline">
                  Revise now
                </Link>
              ) : (
                'All caught up'
              )}
            </span>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Accuracy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {overallAccuracy}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Overall performance</span>
          </div>

          {/* Card 5 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Avg Speed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white font-mono">
                {averageResponseTimeMs > 0 ? (averageResponseTimeMs / 1000).toFixed(1) : '—'}
              </span>
              <span className="text-xs text-slate-400">sec</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Per question</span>
          </div>

          {/* Card 6 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Quizzes Done</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {stats.totalQuizzesCompleted}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              +{stats.totalMockTestsCompleted} mocks
            </span>
          </div>
        </div>
      </section>

      {/* D. Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Quick Training Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => handleQuickQuiz('multiple_choice', 20)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Quick 20 Quiz
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Multiple choice
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickQuiz('spelling_challenge', 20)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Spelling Challenge
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Accents & strict mode
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickQuiz('speed_round', 15)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Speed Round
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Rapid countdown
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickQuiz('type_translation', 25)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Type Translation
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Direct Sibaq format
            </span>
          </button>

          <Link
            to="/mock-test"
            className="flex flex-col items-start p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 hover:border-rose-400 transition-all text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
              60-Min Mock
            </span>
            <span className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-0.5">
              Full competition
            </span>
          </Link>

          <button
            type="button"
            onClick={() => handleQuickQuiz('mistake_revision', 20)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Revise Mistakes
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {wordsNeedingRevision} items due
            </span>
          </button>
        </div>
      </section>

      {/* E. Daily Challenge Card */}
      <section className="p-5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
              Daily Challenge
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              +50 XP
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Practice at least {settings.dailyGoalWords} words today to maintain momentum
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Progress: {todayWordsCount} / {settings.dailyGoalWords} words practiced today.
          </p>
        </div>

        <div>
          {todayGoalMet ? (
            dailyClaimed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Completed & Claimed
              </span>
            ) : (
              <button
                type="button"
                onClick={handleClaimDailyChallenge}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs"
              >
                Claim +50 XP
              </button>
            )
          ) : (
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100/50 transition-colors"
            >
              Start Practice
            </Link>
          )}
        </div>
      </section>

      {/* C. Syllabus Progress (7 Categories) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Official Sibaq Syllabus
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All 7 examination areas from the official PALABRA TN.31 handbook
            </p>
          </div>
          <Link
            to="/vocabulary"
            className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            Full Dictionary <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const stat = categoryStats[cat.id] || {
              total: 0,
              learned: 0,
              mastered: 0,
              percentage: 0,
            };

            return (
              <div
                key={cat.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        Area 0{idx + 1}
                      </span>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </h3>
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        {cat.spanishName}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {stat.total} words
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Mastery</span>
                      <span className="font-mono font-medium">{stat.percentage}%</span>
                    </div>
                    <ProgressBar
                      value={stat.percentage}
                      size="sm"
                      showPercentage={false}
                      colorClassName="bg-rose-600 dark:bg-rose-500"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{stat.learned} learned</span>
                      <span>{stat.mastered} mastered</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartCategory(cat.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Learn
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/quiz?mode=type_translation&category=${cat.id}&count=20`)
                      }
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
