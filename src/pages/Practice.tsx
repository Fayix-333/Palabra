import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Target,
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
  Sliders,
  Type,
  Calendar,
  CalendarDays,
  Palette,
  Volume2,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PacoMascot } from '../components/common/PacoMascot';
import { ProgressBar } from '../components/common/ProgressBar';
import { CATEGORIES, VOCABULARY_DATABASE } from '../data/vocabulary';
import { soundManager } from '../utils/sound';
import { CategoryId, DifficultyLevel, QuizMode } from '../types';

interface PracticeGameCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mode: QuizMode;
  category: string;
  count: number;
  strict: boolean;
  speedLimit?: number;
  xpReward: number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
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
    id: 'game-color-sprint',
    title: 'Color Chroma Sprint',
    subtitle: '45+ Colors & nuanced shades',
    description: 'Drill primary, metallic, jewel, and nuanced hues: borgoña, verde oliva, azul marino, zafiro, granate, salmón, esmeralda.',
    mode: 'type_translation',
    category: 'colours',
    count: 25,
    strict: true,
    xpReward: 35,
    icon: Palette,
    accentColor: 'border-[#CE82FF] bg-[#F6EEFF] dark:bg-purple-950/40 text-[#CE82FF]',
    badgeBg: 'bg-[#CE82FF]',
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

const CATEGORY_ICONS: Record<CategoryId, React.ComponentType<{ className?: string }>> = {
  alphabets: Type,
  numbers: Hash,
  days: Calendar,
  months: CalendarDays,
  colours: Palette,
  fruits: Apple,
  vegetables: Carrot,
};

type PracticeTab = 'games' | 'categories' | 'custom' | 'mistakes';

export const Practice: React.FC = () => {
  const navigate = useNavigate();
  const {
    wordsNeedingRevision,
    wordProgress,
    totalWordsMastered,
    totalWordsLearned,
    overallAccuracy,
    categoryStats,
    todayWordsCount,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<PracticeTab>('games');

  // Custom Quiz Builder State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [customCount, setCustomCount] = useState<number>(5); // default to 5 as requested
  const [customMode, setCustomMode] = useState<QuizMode>('mixed_quiz');
  const [customDifficulty, setCustomDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [customStrict, setCustomStrict] = useState<boolean>(true);
  const [customSpeedLimit, setCustomSpeedLimit] = useState<number>(10);

  // Include / Exclude Specific Words State
  const [selectedIncludeIds, setSelectedIncludeIds] = useState<string[]>([]);
  const [showWordSelector, setShowWordSelector] = useState<boolean>(false);
  const [wordSearchFilter, setWordSearchFilter] = useState<string>('');

  const handleToggleCategory = (catId: string) => {
    if (catId === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((c) => c !== 'all');
      if (withoutAll.includes(catId)) {
        const next = withoutAll.filter((c) => c !== catId);
        return next.length === 0 ? ['all'] : next;
      } else {
        return [...withoutAll, catId];
      }
    });
  };

  // Filter words available for inclusion/exclusion based on selectedCategories
  const allCategoryWords = useMemo(() => {
    if (selectedCategories.includes('all')) return VOCABULARY_DATABASE;
    return VOCABULARY_DATABASE.filter((v) =>
      selectedCategories.some((cat) => (cat.startsWith('numbers') ? v.category === 'numbers' : v.category === cat))
    );
  }, [selectedCategories]);

  const categoryWordsForSelector = useMemo(() => {
    if (!wordSearchFilter.trim()) return allCategoryWords;
    const q = wordSearchFilter.toLowerCase().trim();
    return allCategoryWords.filter(
      (v) =>
        v.english.toLowerCase().includes(q) ||
        v.spanish.toLowerCase().includes(q) ||
        v.alternatives.some((a) => a.toLowerCase().includes(q))
    );
  }, [allCategoryWords, wordSearchFilter]);

  const handleToggleWordInclude = (id: string) => {
    setSelectedIncludeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // List of mistakes synced from wordProgress
  const mistakeList = useMemo(() => {
    return Object.values(wordProgress)
      .filter((w) => w.needsRevision || (w.timesIncorrect || 0) > 0)
      .sort((a, b) => (b.timesIncorrect || 0) - (a.timesIncorrect || 0))
      .map((w) => {
        const vocab = VOCABULARY_DATABASE.find((v) => v.id === w.vocabId);
        return {
          ...w,
          vocab,
        };
      })
      .filter(
        (w): w is typeof w & { vocab: (typeof VOCABULARY_DATABASE)[number] } =>
          w.vocab !== undefined
      );
  }, [wordProgress]);

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

  const handleLaunchCategory = (catId: CategoryId) => {
    const params = new URLSearchParams({
      mode: 'category_quiz',
      category: catId,
      count: '25',
      strict: 'true',
    });
    navigate(`/quiz?${params.toString()}`);
  };

  const handleLaunchCustom = () => {
    const finalCount = selectedIncludeIds.length > 0 ? selectedIncludeIds.length : customCount;
    const isAll = selectedCategories.includes('all');
    const params = new URLSearchParams({
      mode: customMode,
      category: isAll ? 'all' : selectedCategories[0],
      count: String(finalCount),
      strict: String(customStrict),
      difficulty: customDifficulty,
      speedLimit: String(customSpeedLimit),
    });
    if (!isAll && selectedCategories.length > 1) {
      params.set('categories', selectedCategories.join(','));
    }
    if (selectedIncludeIds.length > 0) {
      params.set('includeIds', selectedIncludeIds.join(','));
    }
    navigate(`/quiz?${params.toString()}`);
  };

  const handleDrillSingleWord = (vocabId: string) => {
    const vocab = VOCABULARY_DATABASE.find((v) => v.id === vocabId);
    if (!vocab) return;
    const params = new URLSearchParams({
      mode: 'type_translation',
      category: vocab.category,
      count: '5',
      strict: 'true',
    });
    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#58CC02] block">
            Practice Centre
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Targeted Spanish Training
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Arcade challenges, syllabus category drills, mistake remediation, and custom tests
          </p>
        </div>

        <PacoMascot size="sm" mood="happy" />
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#58CC02]" />
            <span>Mastered</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalWordsMastered}{' '}
            <span className="text-xs font-bold text-slate-400">/ {VOCABULARY_DATABASE.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Target className="w-4 h-4 text-[#1CB0F6]" />
            <span>Accuracy</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {overallAccuracy}%
          </div>
        </div>

        <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <RotateCcw className="w-4 h-4 text-[#FF4B4B]" />
            <span>Mistakes</span>
          </div>
          <div className="text-2xl font-black text-[#FF4B4B] mt-1">
            {wordsNeedingRevision}{' '}
            <span className="text-xs font-bold text-slate-400">waiting</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-[#FF9600]" />
            <span>Today's Goal</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {todayWordsCount}{' '}
            <span className="text-xs font-bold text-slate-400">/ {settings.dailyGoalWords}</span>
          </div>
        </div>
      </div>

      {/* Prominent Review Mistakes Alert if pending */}
      {wordsNeedingRevision > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 bg-[#FFEBEB] dark:bg-rose-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FF4B4B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm font-black text-rose-900 dark:text-rose-200 block">
                {wordsNeedingRevision} Vocabulary Words Need Review
              </span>
              <span className="text-xs font-semibold text-rose-700/80 dark:text-rose-300/80">
                Turn your previous mistakes into mastered words with focused drills!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('mistakes')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-black hover:bg-rose-100/50 dark:hover:bg-rose-900/40 transition-colors"
            >
              VIEW LIST
            </button>
            <button
              type="button"
              onClick={() =>
                navigate('/quiz?mode=mistake_revision&count=20&strict=true&category=all')
              }
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl btn-duo-red text-xs font-black shadow-button"
            >
              PRACTICE NOW
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'games'
              ? 'bg-[#1CB0F6] text-white shadow-button'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 stroke-[2.5]" />
          <span>Training Games</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#1CB0F6] text-white shadow-button'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>7 Syllabus Categories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'custom'
              ? 'bg-[#1CB0F6] text-white shadow-button'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 stroke-[2.5]" />
          <span>Custom Quiz Builder</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mistakes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
            activeTab === 'mistakes'
              ? 'bg-[#FF4B4B] text-white shadow-button'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>My Mistakes</span>
          {wordsNeedingRevision > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'mistakes'
                  ? 'bg-white text-[#FF4B4B]'
                  : 'bg-[#FF4B4B] text-white'
              }`}
            >
              {wordsNeedingRevision}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: FEATURED TRAINING GAMES */}
      {activeTab === 'games' && (
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
                  className="w-full py-3 rounded-2xl btn-duo-green text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-button"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>START CHALLENGE</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SYLLABUS CATEGORY DRILLS */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-800 dark:text-sky-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1CB0F6] shrink-0" />
            <span>
              Target any of the 7 official Sibaq competition syllabus modules directly to build perfect mastery.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || BookOpen;
              const catStat = categoryStats[cat.id];
              const totalItems = catStat?.total || 0;
              const masteredItems = catStat?.mastered || 0;
              const percentage = catStat?.percentage || 0;

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5F6FF] dark:bg-sky-950/60 border-2 border-[#1CB0F6]/40 text-[#1CB0F6] flex items-center justify-center">
                        <Icon className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-mono font-black text-[#58CC02]">
                        {percentage}% Mastered
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {cat.spanishName}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Mastery Progress</span>
                        <span>
                          {masteredItems} / {totalItems} words
                        </span>
                      </div>
                      <ProgressBar
                        value={percentage}
                        size="sm"
                        showPercentage={false}
                        colorClassName="bg-[#58CC02]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunchCategory(cat.id)}
                    className="w-full py-2.5 rounded-xl btn-duo-blue text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-button"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>PRACTICE {cat.name.toUpperCase()}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM QUIZ BUILDER */}
      {activeTab === 'custom' && (
        <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1CB0F6] block">
              Quiz Customizer
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Build Your Custom Practice Session
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Choose your syllabus category, question format, count, and strictness rules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 1. Categories (Multi-select) */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Categories (Select One or More)
                </label>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-[#1CB0F6]">
                  {selectedCategories.includes('all') ? 'All 7 Categories' : `${selectedCategories.length} Selected`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleCategory('all')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedCategories.includes('all')
                      ? 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6] font-black shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs block">🌟 All 7 Categories</span>
                  <span className="text-[10px] opacity-75">{VOCABULARY_DATABASE.length} Words</span>
                </button>

                {CATEGORIES.map((c) => {
                  const isChecked = selectedCategories.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleCategory(c.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-black shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate block">{c.name}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                          isChecked ? 'bg-[#58CC02] border-[#58CC02] text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5">{c.spanishName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Mode */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                Challenge Mode
              </label>
              <select
                value={customMode}
                onChange={(e) => setCustomMode(e.target.value as QuizMode)}
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#1CB0F6]"
              >
                <option value="mixed_quiz">🔀 Mixed Sprint (Multiple Choice + Typing)</option>
                <option value="multiple_choice">🔘 Multiple Choice (4 Choices Per Question)</option>
                <option value="type_translation">⌨️ Typing Translation (Strict Spelling)</option>
                <option value="speed_round">⚡ Rapid Speed Round (10s countdown)</option>
                <option value="spelling_challenge">✨ Accent Master (Targeted Accents)</option>
                <option value="mistake_revision">🔄 Mistake Revision (Prior Missed Words)</option>
              </select>
            </div>

            {/* 3. Question Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Question Count
                </label>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6]">
                  {customCount} Questions
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[5, 10, 20, 30, 50, 75].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setCustomCount(cnt)}
                    className={`py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      customCount === cnt
                        ? 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6] shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, Math.min(100, Number(e.target.value) || 20)))}
                  className="flex-1 accent-[#1CB0F6] cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setCustomCount(Math.max(1, Math.min(100, val)));
                    }}
                    className="w-16 p-1.5 text-center text-xs font-black rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#1CB0F6]"
                  />
                  <span className="text-[11px] font-bold text-slate-400">words</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Guaranteed: Quiz delivers all {customCount} questions without cutting short.
              </p>
            </div>

            {/* Word Inclusion / Exclusion Granular Selector */}
            <div className="md:col-span-2 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide block">
                    Include & Exclude Specific Words (Granular Control)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {selectedIncludeIds.length === 0
                      ? 'All words in category included by default. Check words to restrict quiz to specific items (e.g. exactly 5).'
                      : `Custom filter active: ${selectedIncludeIds.length} words selected.`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIncludeIds([])}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIncludeIds(categoryWordsForSelector.slice(0, 5).map((v) => v.id))}
                    className="px-3 py-1.5 rounded-xl bg-[#E5F6FF] dark:bg-sky-950 text-[#1CB0F6] text-xs font-black cursor-pointer"
                  >
                    Pick 5 Words
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWordSelector((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-xl btn-duo-blue text-xs font-black cursor-pointer"
                  >
                    {showWordSelector ? 'Hide Selector' : 'Select Words...'}
                  </button>
                </div>
              </div>

              {showWordSelector && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-500">
                    <span>
                      Available in [{selectedCategories.includes('all') ? 'All Categories' : selectedCategories.join(', ')}]: {categoryWordsForSelector.length} of {allCategoryWords.length} words
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedIncludeIds(allCategoryWords.map((v) => v.id))}
                        className="text-[#1CB0F6] hover:underline cursor-pointer font-black"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedIncludeIds([])}
                        className="text-rose-500 hover:underline cursor-pointer font-black"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Word quick search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={wordSearchFilter}
                      onChange={(e) => setWordSearchFilter(e.target.value)}
                      placeholder="Quick search words to include (e.g. burgundy, wine, sapphire, esmeralda)..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1CB0F6]"
                    />
                    {wordSearchFilter && (
                      <button
                        type="button"
                        onClick={() => setWordSearchFilter('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {categoryWordsForSelector.map((v) => {
                      const isSelected = selectedIncludeIds.includes(v.id);
                      return (
                        <label
                          key={v.id}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleWordInclude(v.id)}
                              className="w-4 h-4 rounded text-[#58CC02] accent-[#58CC02] cursor-pointer"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                                {v.spanish}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate block">
                                {v.english}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                            {v.difficulty}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'easy', label: 'Easy' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'hard', label: 'Hard' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setCustomDifficulty(diff.id as DifficultyLevel | 'all')}
                    className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      customDifficulty === diff.id
                        ? 'border-[#58CC02] bg-[#D7FFB8]/40 dark:bg-emerald-950/60 text-[#58CC02]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Strict Accents Toggle */}
            <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Strict Accents & Spellings
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Enforce exact á, é, í, ó, ú, and ñ for top marks
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCustomStrict((prev) => !prev)}
                className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                  customStrict ? 'bg-[#58CC02]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform absolute top-1 ${
                    customStrict ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 6. Speed Limit (if speed round) */}
            {customMode === 'speed_round' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Speed Limit Per Question: <span className="text-[#FF9600]">{customSpeedLimit}s</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCustomSpeedLimit(sec)}
                      className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        customSpeedLimit === sec
                          ? 'border-[#FF9600] bg-[#FFF5E5] dark:bg-amber-950/60 text-[#FF9600]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {sec} Seconds
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLaunchCustom}
            className="w-full py-4 rounded-2xl btn-duo-green text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-button"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START CUSTOM PRACTICE SESSION</span>
          </button>
        </div>
      )}

      {/* TAB 4: MISTAKES HUB */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#FF4B4B] block">
                Targeted Remediation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Words You Missed in Recent Quizzes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Automatically updated from your quizzes and practice sessions to eliminate recurring errors.
              </p>
            </div>

            {mistakeList.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate('/quiz?mode=mistake_revision&count=20&strict=true&category=all')
                }
                className="px-5 py-3 rounded-2xl btn-duo-red text-xs font-black flex items-center gap-2 shadow-button shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>DRILL ALL {mistakeList.length} MISTAKES</span>
              </button>
            )}
          </div>

          {mistakeList.length === 0 ? (
            <div className="p-8 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-[#D7FFB8]/30 dark:bg-emerald-950/20 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-[#58CC02] text-white flex items-center justify-center mx-auto shadow-button">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Zero Mistakes Pending!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  You have answered all words with 100% precision. Start a random challenge to keep testing yourself!
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate('/quiz?mode=mixed_quiz&count=20&strict=true&category=all')
                }
                className="px-6 py-3 rounded-2xl btn-duo-green text-xs font-black inline-flex items-center gap-2 shadow-button"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>TAKE A CHALLENGE QUIZ</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mistakeList.map((item) => (
                <div
                  key={item.vocabId}
                  className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        soundManager.speakSpanish(item.vocab.spanish, settings.speechRate)
                      }
                      className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#1CB0F6] flex items-center justify-center shrink-0 hover:bg-[#1CB0F6] hover:text-white transition-colors"
                      title="Hear pronunciation"
                    >
                      <Volume2 className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 dark:text-white truncate">
                          {item.vocab.spanish}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.vocab.category}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {item.vocab.english}
                      </div>
                      <div className="text-[10px] font-bold text-rose-500 mt-0.5">
                        Missed {item.timesIncorrect} time{item.timesIncorrect === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDrillSingleWord(item.vocabId)}
                    className="px-3.5 py-2 rounded-xl border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-black hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  >
                    DRILL
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
