import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Shield, ArrowUp, Zap, TrendingUp, Sparkles, Rocket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PacoMascot } from '../components/common/PacoMascot';
import { LeaderboardEntry } from '../types';
import { subscribeToLiveLeaderboard, updateLeaderboardRecord } from '../utils/firebase';

interface BotProfile {
  id: string;
  name: string;
  institution: string;
  baseXp: number;
  streak: number;
  avatarColor: string;
}

const INITIAL_BOTS: BotProfile[] = [
  { id: 'asp-1', name: 'Zaid Al-Bukhari', institution: 'Darul Huda PG Campus', baseXp: 520, streak: 12, avatarColor: 'bg-emerald-500' },
  { id: 'asp-2', name: 'Salman Faris', institution: 'KMMO Academy Tirur', baseXp: 460, streak: 9, avatarColor: 'bg-blue-500' },
  { id: 'asp-3', name: 'Ameen Rashadi', institution: 'IHSR Campus Calicut', baseXp: 410, streak: 8, avatarColor: 'bg-purple-500' },
  { id: 'asp-4', name: 'Nabeel Fayis', institution: 'Darul Huda Chemmad', baseXp: 360, streak: 6, avatarColor: 'bg-amber-500' },
  { id: 'asp-5', name: 'Irfan Habib', institution: 'Sibaq Arts College', baseXp: 310, streak: 5, avatarColor: 'bg-rose-500' },
  { id: 'asp-6', name: 'Bilal Mansoor', institution: 'Al-Huda Nilambur', baseXp: 275, streak: 4, avatarColor: 'bg-teal-500' },
  { id: 'asp-7', name: 'Hanan Basheer', institution: 'ISAC Campus', baseXp: 240, streak: 3, avatarColor: 'bg-indigo-500' },
  { id: 'asp-8', name: 'Rayan Shihab', institution: 'Darunnoor Wayanad', baseXp: 200, streak: 2, avatarColor: 'bg-cyan-500' },
  { id: 'asp-9', name: 'Shabeeb Ali', institution: 'Sibaq Regional Hub', baseXp: 160, streak: 2, avatarColor: 'bg-orange-500' },
  { id: 'asp-10', name: 'Adil Kareem', institution: 'Al-Birr Institute', baseXp: 120, streak: 1, avatarColor: 'bg-pink-500' },
];

export const Leaderboard: React.FC = () => {
  const { stats, settings, user } = useApp();
  const [liveUsers, setLiveUsers] = useState<LeaderboardEntry[]>([]);
  const [botIntensity, setBotIntensity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('palabra_bot_intensity');
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [botOffsets, setBotOffsets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('palabra_bot_offsets');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Periodically increment bot XP based on selected training intensity to drive competition
  useEffect(() => {
    const timer = setInterval(() => {
      setBotOffsets((prev) => {
        const next = { ...prev };
        INITIAL_BOTS.forEach((bot) => {
          const currentBonus = next[bot.id] || 0;
          const inc = (Math.floor(Math.random() * 11) + 5) * botIntensity;
          next[bot.id] = currentBonus + inc;
        });
        try {
          localStorage.setItem('palabra_bot_offsets', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }, 20000);

    return () => clearInterval(timer);
  }, [botIntensity]);

  const handleBoostAllBots = (amount: number = 50) => {
    setBotOffsets((prev) => {
      const next = { ...prev };
      INITIAL_BOTS.forEach((bot) => {
        const currentBonus = next[bot.id] || 0;
        next[bot.id] = currentBonus + amount * botIntensity;
      });
      try {
        localStorage.setItem('palabra_bot_offsets', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleIntensityChange = (level: number) => {
    setBotIntensity(level);
    try {
      localStorage.setItem('palabra_bot_intensity', String(level));
    } catch {
      // ignore
    }
    handleBoostAllBots(30 * level);
  };

  // Sync current user to live leaderboard Firestore
  useEffect(() => {
    if (user) {
      updateLeaderboardRecord(user, { xp: stats.xp, streak: stats.streakDays }, 'DHIU Sibaq National Candidate');
    }
  }, [user, stats.xp, stats.streakDays]);

  // Subscribe to live users from Firestore
  useEffect(() => {
    const unsub = subscribeToLiveLeaderboard((records) => {
      setLiveUsers(records);
    });
    return unsub;
  }, []);

  const botEntries: LeaderboardEntry[] = INITIAL_BOTS.map((bot) => ({
    id: bot.id,
    name: bot.name,
    institution: bot.institution,
    xp: bot.baseXp + (botOffsets[bot.id] || 0),
    streak: bot.streak,
    avatarColor: bot.avatarColor,
    isRealUser: false,
  }));

  const currentUserEntry: LeaderboardEntry = {
    id: user?.uid || 'current-user',
    name: `${settings.studentName} (You)`,
    institution: 'DHIU Sibaq National Candidate',
    xp: stats.xp,
    streak: stats.streakDays,
    avatarColor: 'bg-[#58CC02]',
    isCurrentStudent: true,
    isRealUser: true,
    photoURL: user?.photoURL || '',
  };

  const otherLiveUsers = liveUsers.filter((u) => u.id !== currentUserEntry.id);

  const fullLeaderboard: LeaderboardEntry[] = [
    ...botEntries,
    ...otherLiveUsers,
    currentUserEntry,
  ].sort((a, b) => b.xp - a.xp);

  const studentRank = fullLeaderboard.findIndex((e) => e.isCurrentStudent) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 select-none animate-in fade-in duration-200">
      {/* League Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider opacity-90">
            <Shield className="w-4 h-4 fill-white text-white" />
            <span>Sibaq National League • Live Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Emerald Division
          </h1>
          <p className="text-xs opacity-90 max-w-sm">
            Top 5 aspirants advance to the National Finals in the TN.31 PALABRA category! Real competitors and bots are live.
          </p>
        </div>

        <PacoMascot size="md" mood="cheering" />
      </div>

      {/* Bot Training & XP Focus Control Panel */}
      <div className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                Bot Training & XP Intensity Control
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Increase bot XP growth rate to push yourself harder in daily lessons and quizzes!
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { level: 1, label: '1x Normal' },
              { level: 2, label: '2x Intense' },
              { level: 5, label: '5x Hardcore' },
            ].map((lvl) => (
              <button
                key={lvl.level}
                type="button"
                onClick={() => handleIntensityChange(lvl.level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  botIntensity === lvl.level
                    ? 'bg-[#58CC02] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleBoostAllBots(50)}
            className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Boost All Bots +50 XP</span>
          </button>
          <button
            type="button"
            onClick={() => handleBoostAllBots(120)}
            className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center gap-1.5 cursor-pointer hover:bg-purple-100 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trigger Study Sprint (+120 XP)</span>
          </button>
          <span className="text-[11px] font-bold text-slate-400 ml-auto">
            Current multiplier: <strong className="text-[#58CC02]">{botIntensity}x</strong>
          </span>
        </div>
      </div>

      {/* Student Rank Banner */}
      <div className="p-4 rounded-2xl border-2 border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#58CC02] text-white flex items-center justify-center font-black text-sm font-mono shadow-xs">
            #{studentRank}
          </span>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              You are currently rank #{studentRank} of {fullLeaderboard.length} competitors (Real users & active bots)
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {studentRank <= 5
                ? '🎉 You are in the Promotion Zone for the Sibaq Finals!'
                : 'Complete more lessons & quizzes to outscore active bots and real users!'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono font-black text-base text-[#58CC02] block">
            {stats.xp} XP
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 justify-end">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" /> Live Sync Active
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs divide-y-2 divide-slate-100 dark:divide-slate-800">
        {fullLeaderboard.map((entry, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const isPromotionZone = rank <= 5;

          return (
            <div
              key={entry.id}
              className={`p-4 flex items-center justify-between transition-colors ${
                entry.isCurrentStudent
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 font-black'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Rank Number */}
                <span
                  className={`w-7 text-center font-black text-sm font-mono ${
                    isTop3 ? 'text-[#FF9600]' : 'text-slate-400'
                  }`}
                >
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </span>

                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl ${entry.avatarColor} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 overflow-hidden`}
                >
                  {entry.photoURL ? (
                    <img src={entry.photoURL} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    entry.name.charAt(0)
                  )}
                </div>

                {/* Name & College */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black truncate ${
                        entry.isCurrentStudent
                          ? 'text-[#58CC02]'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {entry.name}
                    </span>
                    {(entry.isRealUser || entry.isCurrentStudent) && !entry.isCurrentStudent && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#1CB0F6]">
                        Real User
                      </span>
                    )}
                    {!entry.isRealUser && !entry.isCurrentStudent && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        Bot Aspirant
                      </span>
                    )}
                    {isPromotionZone && (
                      <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                        <ArrowUp className="w-3 h-3 stroke-[3]" /> Promotion
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 truncate block">
                    {entry.institution}
                  </span>
                </div>
              </div>

              {/* XP and Streak */}
              <div className="flex items-center gap-4 text-right shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-[#FF9600] font-black">
                  <Flame className="w-3.5 h-3.5 fill-[#FF9600]" />
                  <span>{entry.streak}d</span>
                </div>

                <span className="font-mono font-black text-sm text-[#CE82FF]">
                  {entry.xp} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
