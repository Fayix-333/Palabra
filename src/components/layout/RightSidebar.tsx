import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Gift,
  ArrowRight,
  Timer,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PacoMascot } from '../common/PacoMascot';
import { ProgressBar } from '../common/ProgressBar';

export const RightSidebar: React.FC = () => {
  const { stats, dailyQuests, claimQuestReward, totalWordsLearned, totalWordsCount } = useApp();

  return (
    <aside className="hidden xl:flex xl:flex-col xl:w-80 xl:shrink-0 p-4 space-y-5 select-none sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* 1. Sibaq League / Ranking Card */}
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

      {/* 2. Daily Quests Card */}
      <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#FF9600]" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Daily Quests</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Resets daily</span>
        </div>

        <div className="space-y-3">
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

      {/* 3. Mascot Encouragement Box */}
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

      {/* 4. Quick Links to Sibaq Arena & Plan */}
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
