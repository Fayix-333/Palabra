import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  Gift,
  ArrowRight,
  Timer,
  CalendarCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PacoMascot } from '../common/PacoMascot';
import { FireFlame } from '../common/FireFlame';

export const RightSidebar: React.FC = () => {
  const {
    stats,
    settings,
    dailyQuests,
    claimQuestReward,
    totalWordsLearned,
    totalWordsCount,
    streakDays,
    longestStreak,
    isDailyGoalAchieved,
    dailyGoalWords,
    dailyGoalPercentage,
    todayWordsCount,
    celebrateGoal,
  } = useApp();

  // Generate 7-day week calendar (Mon to Sun)
  const weekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Monday ... 6 for Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return labels.map((label, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      const isToday = index === dayOfWeek;
      const isPast = index < dayOfWeek;
      const wordsOnDay = stats.dailyProgress?.[dateStr] || 0;
      const hasPracticed = wordsOnDay > 0 || (isToday && todayWordsCount > 0);
      const isGoalMet =
        stats.goalAchievedDates?.includes(dateStr) ||
        (isToday && isDailyGoalAchieved);

      return {
        label,
        dateStr,
        isToday,
        isPast,
        hasPracticed,
        isGoalMet,
      };
    });
  }, [stats.dailyProgress, stats.goalAchievedDates, todayWordsCount, isDailyGoalAchieved]);

  return (
    <aside className="hidden xl:flex xl:flex-col xl:w-80 xl:shrink-0 p-4 space-y-4 select-none sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* 1. STREAK MANAGER & DAILY GOAL FLAME CARD */}
      <div
        className={`p-4 rounded-3xl border-2 transition-all duration-300 ${
          isDailyGoalAchieved
            ? 'border-amber-300 dark:border-amber-600/80 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 shadow-md ring-2 ring-amber-400/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
        }`}
      >
        {/* Streak Header with Animated FireFlame */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FireFlame
              size="lg"
              isBurning={true}
              isGoalAchieved={isDailyGoalAchieved}
              showSparks={true}
              onClick={celebrateGoal}
            />
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-[#FF9600]">
                  {streakDays}
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Day Streak
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 block">
                Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {isDailyGoalAchieved && (
            <button
              type="button"
              onClick={celebrateGoal}
              className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 hover:scale-105 active:scale-95 transition-transform"
              title="Click to trigger celebration confetti!"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 7-Day Weekly Streak Tracker */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              This Week
            </span>
            <span className="text-[10px] font-bold text-[#FF9600]">
              {weekDays.filter((d) => d.hasPracticed).length}/7 Days Active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, idx) => {
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-slate-400">
                    {day.label}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      day.isGoalMet
                        ? 'bg-[#FF9600] text-white shadow-xs font-black'
                        : day.hasPracticed
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300'
                        : day.isToday
                        ? 'border-2 border-dashed border-[#FF9600] text-[#FF9600] bg-orange-50/50 dark:bg-orange-950/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                    }`}
                    title={
                      day.isGoalMet
                        ? `${day.dateStr}: Goal Met! 🔥`
                        : day.hasPracticed
                        ? `${day.dateStr}: Active`
                        : day.isToday
                        ? `Today: Practice to ignite streak!`
                        : `${day.dateStr}`
                    }
                  >
                    {day.isGoalMet ? (
                      <span className="text-xs">🔥</span>
                    ) : day.hasPracticed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-bold">
                        {day.isToday ? '•' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Vocabulary Goal Progress */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              Daily Goal
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              <strong className={isDailyGoalAchieved ? 'text-[#58CC02]' : 'text-slate-800 dark:text-slate-200'}>
                {todayWordsCount}
              </strong>
              /{dailyGoalWords} words
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDailyGoalAchieved
                  ? 'bg-gradient-to-r from-[#FF9600] to-[#58CC02]'
                  : 'bg-[#FF9600]'
              }`}
              style={{ width: `${dailyGoalPercentage}%` }}
            />
          </div>

          {isDailyGoalAchieved ? (
            <div className="p-2.5 rounded-2xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <span className="text-[11px] font-black text-amber-900 dark:text-amber-200">
                  Daily Goal Achieved!
                </span>
              </div>
              <button
                type="button"
                onClick={celebrateGoal}
                className="text-[10px] font-black text-amber-700 dark:text-amber-300 hover:underline"
              >
                CELEBRATE 🎉
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {Math.max(0, dailyGoalWords - todayWordsCount)} words left today
              </span>
              <Link
                to="/practice"
                className="font-bold text-[#1CB0F6] hover:underline flex items-center gap-0.5"
              >
                <span>Practice</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. Sibaq League / Ranking Card */}
      <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-500">
              <Trophy className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
                Sibaq League
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Emerald Tier
              </h4>
            </div>
          </div>

          <Link
            to="/leaderboard"
            className="text-[11px] font-bold text-[#1CB0F6] hover:underline"
          >
            VIEW LEAGUE
          </Link>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Rank #4 in Emerald League. Top 5 aspirants qualify for the DHIU Sibaq National Finals!
        </p>
      </div>

      {/* 3. Daily Quests Card */}
      <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#FF9600]" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Daily Quests</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Resets daily</span>
        </div>

        <div className="space-y-2.5">
          {dailyQuests.map((quest) => {
            const isReady = quest.current >= quest.target;
            const pct = Math.round((quest.current / quest.target) * 100);

            return (
              <div
                key={quest.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {quest.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {quest.subtitle}
                    </span>
                  </div>
                  <span className="text-[11px] font-black font-mono text-[#CE82FF]">
                    +{quest.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FF9600] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {quest.current}/{quest.target}
                  </span>
                </div>

                {isReady && !quest.claimed && (
                  <button
                    type="button"
                    onClick={() => claimQuestReward(quest.id)}
                    className="w-full py-1.5 rounded-xl btn-duo-green text-xs font-black"
                  >
                    CLAIM +{quest.xpReward} XP
                  </button>
                )}

                {quest.claimed && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Mascot Encouragement Box */}
      <div className="p-4 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-3">
        <PacoMascot size="sm" mood="encouraging" />
        <div className="text-xs space-y-0.5">
          <p className="font-extrabold text-[#58CC02] dark:text-emerald-400">
            ¡Hola, Aspirante!
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-tight">
            You have mastered {totalWordsLearned} of {totalWordsCount} competition words. Keep the flame alive!
          </p>
        </div>
      </div>

      {/* 5. Quick Links to Sibaq Arena & Plan */}
      <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Competition Prep
        </h4>

        <Link
          to="/mock-test"
          className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:scale-[1.02] transition-transform text-xs"
        >
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#FF4B4B]" />
            <span className="font-black text-rose-900 dark:text-rose-200">
              60-Min Mock Test
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF4B4B]" />
        </Link>

        <Link
          to="/plan"
          className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 hover:scale-[1.02] transition-transform text-xs"
        >
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#58CC02]" />
            <span className="font-black text-emerald-900 dark:text-emerald-200">
              15-Day Curriculum
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#58CC02]" />
        </Link>
      </div>
    </aside>
  );
};
