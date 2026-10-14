import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Target,
  Edit3,
  RotateCcw,
  Sparkles,
  Shuffle,
  Apple,
  Carrot,
  Hash,
  CheckCircle2,
  Play,
  Flame,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PacoMascot } from '../components/common/PacoMascot';

interface PracticeGameCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mode: string;
  category: string;
  count: number;
  strict: boolean;
  speedLimit?: number;
  xpReward: number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string; // Tailwind color theme
  badgeBg: string;
}

const PRACTICE_GAMES: PracticeGameCard[] = [
  {
    id: 'game-quick-10',
    title: 'Quick 10-Word Challenge',
    subtitle: 'Fast 2-minute burst',
    description: 'Rapid-fire vocabulary drill from all 7 syllabus categories to build speed.',
    mode: 'multiple_choice',
    category: 'all',
    count: 10,
    strict: false,
    xpReward: 20,
    icon: Zap,
    accentColor: 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/40 text-[#1CB0F6]',
    badgeBg: 'bg-[#1CB0F6]',
  },
  {
    id: 'game-daily-20',
    title: '20-Word Daily Quiz',
    subtitle: 'Daily routine standard',
    description: 'The standard 20-question translation test aligned with the handbook 45-min routine.',
    mode: 'type_translation',
    category: 'all',
    count: 20,
    strict: true,
    xpReward: 35,
    icon: CheckCircle2,
    accentColor: 'border-[#58CC02] bg-[#D7FFB8]/40 dark:bg-emerald-950/40 text-[#58CC02]',
    badgeBg: 'bg-[#58CC02]',
  },
  {
    id: 'game-spelling-master',
    title: 'Spelling Master',
    subtitle: 'Zero-tolerance accuracy',
    description: 'Strict accent enforcement on á, é, í, ó, ú, and ñ. Essential for top Sibaq marks.',
    mode: 'spelling_challenge',
    category: 'all',
    count: 20,
    strict: true,
    xpReward: 40,
    icon: Target,
    accentColor: 'border-[#FF4B4B] bg-[#FFEBEB] dark:bg-rose-950/40 text-[#FF4B4B]',
    badgeBg: 'bg-[#FF4B4B]',
  },
  {
    id: 'game-accent-trainer',
    title: 'Accent Trainer',
    subtitle: 'Trap words intensive',
    description: 'Drill words with written accents: miércoles, sábado, dieciséis, veintidós, millón.',
    mode: 'spelling_challenge',
    category: 'all',
    count: 15,
    strict: true,
    xpReward: 30,
    icon: Sparkles,
    accentColor: 'border-[#CE82FF] bg-[#F6EEFF] dark:bg-purple-950/40 text-[#CE82FF]',
    badgeBg: 'bg-[#CE82FF]',
  },
  {
    id: 'game-fruit-fiesta',
    title: 'Fruit Fiesta',
    subtitle: '30+ Fruit vocabulary',
    description: 'Practice fruits including accents and regional pairs: plátano/banana, piña, sandía.',
    mode: 'type_translation',
    category: 'fruits',
    count: 25,
    strict: true,
    xpReward: 35,
    icon: Apple,
    accentColor: 'border-[#FF9600] bg-[#FFF5E5] dark:bg-amber-950/40 text-[#FF9600]',
    badgeBg: 'bg-[#FF9600]',
  },
  {
    id: 'game-veggie-voyage',
    title: 'Vegetable Voyage',
    subtitle: '30+ Garden & root items',
    description: 'Master vegetable spellings: zanahoria (silent h), quingombó, brócoli, maíz.',
    mode: 'type_translation',
    category: 'vegetables',
    count: 25,
    strict: true,
    xpReward: 35,
    icon: Carrot,
    accentColor: 'border-[#00CD9C] bg-teal-50 dark:bg-teal-950/40 text-[#00CD9C]',
    badgeBg: 'bg-[#00CD9C]',
  },
  {
    id: 'game-number-ninja',
    title: 'Number Ninja',
    subtitle: '0 to 1,000,000 drill',
    description: 'Learn compound numbers (veintitrés, veintiséis) and irregular hundreds (quinientos).',
    mode: 'type_translation',
    category: 'numbers',
    count: 25,
    strict: true,
    xpReward: 40,
    icon: Hash,
    accentColor: 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/40 text-[#1CB0F6]',
    badgeBg: 'bg-[#1CB0F6]',
  },
  {
    id: 'game-random-mix',
    title: 'Random Mix Sprint',
    subtitle: 'Unpredictable questions',
    description: 'Combines letters, days, months, colours, fruits, vegetables, and numbers.',
    mode: 'mixed_quiz',
    category: 'all',
    count: 30,
    strict: true,
    xpReward: 45,
    icon: Shuffle,
    accentColor: 'border-[#CE82FF] bg-[#F6EEFF] dark:bg-purple-950/40 text-[#CE82FF]',
    badgeBg: 'bg-[#CE82FF]',
  },
  {
    id: 'game-review-mistakes',
    title: 'Review Mistakes',
    subtitle: 'Targeted remediation',
    description: 'Practice exclusively the vocabulary words you previously answered incorrectly.',
    mode: 'mistake_revision',
    category: 'all',
    count: 20,
    strict: true,
    xpReward: 40,
    icon: RotateCcw,
    accentColor: 'border-[#FF4B4B] bg-[#FFEBEB] dark:bg-rose-950/40 text-[#FF4B4B]',
    badgeBg: 'bg-[#FF4B4B]',
  },
  {
    id: 'game-speed-100',
    title: '100-Word Speed Challenge',
    subtitle: 'High-tempo endurance',
    description: 'Grand sprint against the clock. Rapid 10-second timer per question to hone reflexes.',
    mode: 'speed_round',
    category: 'all',
    count: 50,
    strict: true,
    speedLimit: 10,
    xpReward: 80,
    icon: Flame,
    accentColor: 'border-[#FF9600] bg-[#FFF5E5] dark:bg-amber-950/40 text-[#FF9600]',
    badgeBg: 'bg-[#FF9600]',
  },
];

export const Practice: React.FC = () => {
  const navigate = useNavigate();
  const { wordsNeedingRevision } = useApp();

  const handleLaunchGame = (game: PracticeGameCard) => {
    const params = new URLSearchParams({
      mode: game.mode,
      category: game.category,
      count: String(game.count),
      strict: String(game.strict),
      speedLimit: String(game.speedLimit || 10),
    });
    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#58CC02] block">
            Practice Centre
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Choose Your Training Game
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Playful arcade drills to sharpen accuracy, spelling precision, and translation speed
          </p>
        </div>

        <PacoMascot size="sm" mood="happy" />
      </div>

      {/* Review Mistakes Notice if any */}
      {wordsNeedingRevision > 0 && (
        <div className="p-4 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 bg-[#FFEBEB] dark:bg-rose-950/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-[#FF4B4B]" />
            <div>
              <span className="text-xs font-black text-rose-900 dark:text-rose-200 block">
                {wordsNeedingRevision} Words Waiting for Revision
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Turn your recent mistakes into mastered vocabulary!
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/quiz?mode=mistake_revision&count=20&strict=true&category=all')
            }
            className="px-4 py-2 rounded-xl btn-duo-red text-xs font-black shrink-0"
          >
            PRACTICE MISTAKES
          </button>
        </div>
      )}

      {/* Grid of colourful game cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRACTICE_GAMES.map((game) => {
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 ${game.accentColor}`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-xs text-[#CE82FF] block">
                      +{game.xpReward} XP
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {game.count} Qs
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {game.subtitle}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold pt-1">
                    {game.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchGame(game)}
                className="w-full py-3 rounded-2xl btn-duo-green text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>START CHALLENGE</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
