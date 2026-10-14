import React from 'react';
import { Trophy, Flame, Shield, ArrowUp, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PacoMascot } from '../components/common/PacoMascot';
import { LeaderboardEntry } from '../types';

const MOCK_ASPIRANTS: Omit<LeaderboardEntry, 'isCurrentStudent'>[] = [
  { id: 'asp-1', name: 'Zaid Al-Bukhari', institution: 'Darul Huda PG Campus', xp: 480, streak: 12, avatarColor: 'bg-emerald-500' },
  { id: 'asp-2', name: 'Salman Faris', institution: 'KMMO Academy Tirur', xp: 420, streak: 9, avatarColor: 'bg-blue-500' },
  { id: 'asp-3', name: 'Ameen Rashadi', institution: 'IHSR Campus Calicut', xp: 390, streak: 8, avatarColor: 'bg-purple-500' },
  { id: 'asp-4', name: 'Nabeel Fayis', institution: 'Darul Huda Chemmad', xp: 340, streak: 6, avatarColor: 'bg-amber-500' },
  { id: 'asp-5', name: 'Irfan Habib', institution: 'Sibaq Arts College', xp: 290, streak: 5, avatarColor: 'bg-rose-500' },
  { id: 'asp-6', name: 'Bilal Mansoor', institution: 'Al-Huda Nilambur', xp: 260, streak: 4, avatarColor: 'bg-teal-500' },
  { id: 'asp-7', name: 'Hanan Basheer', institution: 'ISAC Campus', xp: 230, streak: 3, avatarColor: 'bg-indigo-500' },
  { id: 'asp-8', name: 'Rayan Shihab', institution: 'Darunnoor Wayanad', xp: 190, streak: 2, avatarColor: 'bg-cyan-500' },
  { id: 'asp-9', name: 'Shabeeb Ali', institution: 'Sibaq Regional Hub', xp: 150, streak: 2, avatarColor: 'bg-orange-500' },
  { id: 'asp-10', name: 'Adil Kareem', institution: 'Al-Birr Institute', xp: 110, streak: 1, avatarColor: 'bg-pink-500' },
];

export const Leaderboard: React.FC = () => {
  const { stats, settings } = useApp();

  // Combine student into the leaderboard list and sort by XP
  const fullLeaderboard: LeaderboardEntry[] = [
    ...MOCK_ASPIRANTS,
    {
      id: 'current-user',
      name: `${settings.studentName} (You)`,
      institution: 'DHIU Sibaq National Candidate',
      xp: stats.xp,
      streak: stats.streakDays,
      avatarColor: 'bg-[#58CC02]',
      isCurrentStudent: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  const studentRank = fullLeaderboard.findIndex((e) => e.isCurrentStudent) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 select-none">
      {/* League Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider opacity-90">
            <Shield className="w-4 h-4 fill-white text-white" />
            <span>Sibaq National League</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Emerald Division
          </h1>
          <p className="text-xs opacity-90 max-w-sm">
            Top 5 aspirants advance to the National Finals in the TN.31 PALABRA category!
          </p>
        </div>

        <PacoMascot size="md" mood="cheering" />
      </div>

      {/* Student Rank Banner */}
      <div className="p-4 rounded-2xl border-2 border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#58CC02] text-white flex items-center justify-center font-black text-sm font-mono">
            #{studentRank}
          </span>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              You are currently rank #{studentRank}
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {studentRank <= 5
                ? '🎉 You are in the Promotion Zone for the Sibaq Finals!'
                : 'Complete more lessons to break into the Top 5!'}
            </span>
          </div>
        </div>

        <span className="font-mono font-black text-base text-[#58CC02]">
          {stats.xp} XP
        </span>
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
                  className={`w-10 h-10 rounded-2xl ${entry.avatarColor} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0`}
                >
                  {entry.name.charAt(0)}
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
