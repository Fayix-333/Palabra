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
  ChevronDown,
  ChevronUp,
  Check,
  CheckSquare,
  Square,
  Search,
  X,
  Filter,
  Layers,
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
    title: 'Number Ninja: Random Numbers',
    subtitle: 'Dynamic random numbers (2345, 1546...)',
    description: 'Learn compound numbers and translate fresh, unpredictable numbers every time: four-digit numbers like 2,345, 1,546, irregular hundreds, and strict accents.',
    mode: 'type_translation',
    category: 'numbers_random',
    count: 20,
    strict: true,
    xpReward: 45,
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
  const [customCount, setCustomCount] = useState<number>(10);
  const [customMode, setCustomMode] = useState<QuizMode>('mixed_quiz');
  const [customDifficulty, setCustomDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [customStrict, setCustomStrict] = useState<boolean>(true);
  const [customSpeedLimit, setCustomSpeedLimit] = useState<number>(10);

  // Multi-Category Dropdown and Granular Options
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);

  // Wanted Words State
  const [selectedIncludeIds, setSelectedIncludeIds] = useState<string[]>([]);
  const [showWordSelector, setShowWordSelector] = useState<boolean>(false);
  const [wordSearchFilter, setWordSearchFilter] = useState<string>('');
  const [selectorCategoryTab, setSelectorCategoryTab] = useState<string>('all');

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

  const handleSelectPresetCombo = (combo: 'numbers_colors' | 'fruits_veggies' | 'time' | 'random_numbers' | 'all') => {
    if (combo === 'all') {
      setSelectedCategories(['all']);
    } else if (combo === 'numbers_colors') {
      setSelectedCategories(['numbers', 'colours']);
    } else if (combo === 'fruits_veggies') {
      setSelectedCategories(['fruits', 'vegetables']);
    } else if (combo === 'time') {
      setSelectedCategories(['days', 'months']);
    } else if (combo === 'random_numbers') {
      setSelectedCategories(['numbers_random']);
    }
  };

  // Filter words available for inclusion/exclusion based on selectedCategories
  const allCategoryWords = useMemo(() => {
    if (selectedCategories.includes('all')) return VOCABULARY_DATABASE;
    return VOCABULARY_DATABASE.filter((v) => {
      return selectedCategories.some((cat) => {
        if (cat === 'numbers' || cat === 'numbers_all' || cat === 'numbers_random') return v.category === 'numbers';
        if (cat === 'numbers_0_20') {
          return (
            v.category === 'numbers' &&
            ['num-0', 'num-1', 'num-2', 'num-3', 'num-4', 'num-5', 'num-6', 'num-7', 'num-8', 'num-9',
             'num-10', 'num-11', 'num-12', 'num-13', 'num-14', 'num-15', 'num-16', 'num-17', 'num-18', 'num-19', 'num-20'].includes(v.id)
          );
        }
        if (cat === 'numbers_21_100') {
          return (
            v.category === 'numbers' &&
            /^num-(2[1-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|100)$/.test(v.id)
          );
        }
        if (cat === 'numbers_hundreds') {
          return (
            v.category === 'numbers' &&
            ['num-101', 'num-200', 'num-300', 'num-400', 'num-500', 'num-600', 'num-700', 'num-800',
             'num-900', 'num-1000', 'num-2000', 'num-10000', 'num-100000', 'num-1000000', 'num-2000000'].includes(v.id)
          );
        }
        if (cat === 'numbers_accents') {
          return v.category === 'numbers' && (v.hasAccents || /[áéíóúñÁÉÍÓÚÑ]/.test(v.spanish));
        }
        return v.category === cat;
      });
    });
  }, [selectedCategories]);

  const categoryWordsForSelector = useMemo(() => {
    let base = allCategoryWords;
    if (selectorCategoryTab !== 'all') {
      base = base.filter((v) => v.category === selectorCategoryTab);
    }
    if (!wordSearchFilter.trim()) return base;
    const q = wordSearchFilter.toLowerCase().trim();
    return base.filter(
      (v) =>
        v.english.toLowerCase().includes(q) ||
        v.spanish.toLowerCase().includes(q) ||
        v.alternatives.some((a) => a.toLowerCase().includes(q))
    );
  }, [allCategoryWords, selectorCategoryTab, wordSearchFilter]);

  const handleToggleWordInclude = (id: string) => {
    setSelectedIncludeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePickRandomWanted = (count: number) => {
    const shuffled = [...allCategoryWords].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((w) => w.id);
    setSelectedIncludeIds(picked);
    setCustomCount(picked.length);
  };

  const handlePickAccentTrapsWanted = () => {
    const accentWords = allCategoryWords.filter(
      (w) => w.hasAccents || /[áéíóúñÁÉÍÓÚÑ]/.test(w.spanish)
    );
    const ids = accentWords.map((w) => w.id);
    setSelectedIncludeIds(ids);
    if (ids.length > 0) setCustomCount(ids.length);
  };

  const handleSelectAllFilteredWanted = () => {
    const currentIds = new Set(selectedIncludeIds);
    categoryWordsForSelector.forEach((w) => currentIds.add(w.id));
    const next = Array.from(currentIds);
    setSelectedIncludeIds(next);
    setCustomCount(next.length);
  };

  const handleClearWanted = () => {
    setSelectedIncludeIds([]);
  };

  const handleRemoveWantedWord = (id: string) => {
    setSelectedIncludeIds((prev) => prev.filter((item) => item !== id));
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
    const isAll = selectedCategories.includes('all');
    const hasRandomNumbers = selectedCategories.includes('numbers_random');
    const finalCount = selectedIncludeIds.length > 0
      ? (customCount > 0 ? customCount : selectedIncludeIds.length)
      : customCount;

    const params = new URLSearchParams({
      mode: customMode,
      category: isAll ? 'all' : selectedCategories[0],
      count: String(finalCount),
      strict: String(customStrict),
      difficulty: customDifficulty,
      speedLimit: String(customSpeedLimit),
    });
    if (hasRandomNumbers) {
      params.set('randomNumbers', 'true');
    }
    if (!isAll && selectedCategories.length > 0) {
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

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchCategory(cat.id)}
                      className="w-full py-2.5 rounded-xl btn-duo-blue text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-button"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>PRACTICE {cat.name.toUpperCase()}</span>
                    </button>

                    {cat.id === 'numbers' && (
                      <button
                        type="button"
                        onClick={() => navigate('/quiz?mode=type_translation&category=numbers_random&count=20&strict=true')}
                        className="w-full py-2 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      >
                        <span>🎲 DRILL RANDOM NUMBERS (2345, 1546...)</span>
                      </button>
                    )}
                  </div>
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
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                    1. Select Syllabus Categories (Multi-Select Enabled)
                  </label>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Pick 2, 3 or more categories together (e.g. Numbers + Colours fixed, or all 7)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-sky-100 dark:bg-sky-950 text-[#1CB0F6]">
                    {selectedCategories.includes('all')
                      ? `🌟 All 7 Categories (${VOCABULARY_DATABASE.length} Words)`
                      : `${selectedCategories.length} Selected (${allCategoryWords.length} Words)`}
                  </span>
                </div>
              </div>

              {/* Quick Preset Combos requested by user */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase text-slate-400">Quick Combos:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPresetCombo('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    selectedCategories.includes('all')
                      ? 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  ⭐ All 7 ({VOCABULARY_DATABASE.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetCombo('numbers_colors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    !selectedCategories.includes('all') &&
                    selectedCategories.length === 2 &&
                    selectedCategories.includes('numbers') &&
                    selectedCategories.includes('colours')
                      ? 'border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  🔢+🎨 Numbers & Colours Fixed (87+47)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetCombo('fruits_veggies')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    !selectedCategories.includes('all') &&
                    selectedCategories.length === 2 &&
                    selectedCategories.includes('fruits') &&
                    selectedCategories.includes('vegetables')
                      ? 'border-[#FF9600] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  🍎+🥕 Fruits & Vegetables (37+40)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetCombo('random_numbers')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    !selectedCategories.includes('all') &&
                    selectedCategories.length === 1 &&
                    selectedCategories.includes('numbers_random')
                      ? 'border-[#FF9600] bg-[#FFF5E5] dark:bg-amber-950/60 text-[#FF9600]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  🎲 Random Numbers (2345, 1546...)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetCombo('time')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    !selectedCategories.includes('all') &&
                    selectedCategories.length === 2 &&
                    selectedCategories.includes('days') &&
                    selectedCategories.includes('months')
                      ? 'border-[#CE82FF] bg-purple-50 dark:bg-purple-950/40 text-[#CE82FF]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  📅 Days & Months (7+12)
                </button>
                {!selectedCategories.includes('all') && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories(['all'])}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset to All
                  </button>
                )}
              </div>

              {/* Screenshot-Style Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left flex items-center justify-between cursor-pointer hover:border-[#1CB0F6] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {selectedCategories.includes('all')
                        ? `⭐ All 7 Syllabus Categories (${VOCABULARY_DATABASE.length}+ Words)`
                        : `⭐ Selected (${selectedCategories.length}): ${selectedCategories
                            .map((c) => {
                              const match = CATEGORIES.find((cat) => cat.id === c);
                              return match ? match.name : c.replace('numbers_', 'Numbers: ');
                            })
                            .join(', ')} (${allCategoryWords.length} Words)`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {allCategoryWords.length} words
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isCategoryDropdownOpen ? 'rotate-180 text-[#1CB0F6]' : ''
                      }`}
                    />
                  </div>
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-[#0B1526] text-white shadow-2xl p-3 space-y-3 max-h-96 overflow-y-auto">
                    {/* All option */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('all')}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                        selectedCategories.includes('all')
                          ? 'bg-sky-500/20 text-[#1CB0F6] font-black'
                          : 'hover:bg-slate-800 text-slate-200 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                            selectedCategories.includes('all')
                              ? 'bg-[#1CB0F6] border-[#1CB0F6] text-white'
                              : 'border-slate-500'
                          }`}
                        >
                          {selectedCategories.includes('all') && '✓'}
                        </div>
                        <span className="text-xs">⭐ All 7 Syllabus Categories ({VOCABULARY_DATABASE.length}+ Words)</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">All Words</span>
                    </button>

                    {/* Core Syllabus Categories Header */}
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-2.5 pb-1">
                        Core Syllabus Categories
                      </span>
                      <div className="space-y-1">
                        {CATEGORIES.map((cat) => {
                          const isChecked = selectedCategories.includes(cat.id);
                          const count = VOCABULARY_DATABASE.filter((v) => v.category === cat.id).length;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleToggleCategory(cat.id)}
                              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-500/20 text-emerald-400 font-black'
                                  : 'hover:bg-slate-800/80 text-slate-200 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                                    isChecked
                                      ? 'bg-[#58CC02] border-[#58CC02] text-white'
                                      : 'border-slate-500'
                                  }`}
                                >
                                  {isChecked && '✓'}
                                </div>
                                <span className="text-xs truncate">
                                  {cat.name}{' '}
                                  <span className="text-slate-400 text-[11px]">({cat.spanishName})</span>
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {count} words
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Numbers Sub-Sections & Drills Header */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-2.5 pb-1">
                        Numbers Sub-Sections & Drills
                      </span>
                      <div className="space-y-1">
                        {[
                          {
                            id: 'numbers_random',
                            title: 'Numbers: Random Dynamic Numbers (2345, 1546...)',
                            count: 'Dynamic',
                            icon: '🎲',
                          },
                          {
                            id: 'numbers',
                            title: 'Numbers (All 0 to 1,000,000)',
                            count: 87,
                            icon: '🔢',
                          },
                          {
                            id: 'numbers_0_20',
                            title: 'Numbers: 0 to 20 (Foundations & dieciséis)',
                            count: 21,
                            icon: '🔢',
                          },
                          {
                            id: 'numbers_21_100',
                            title: 'Numbers: 21 to 100 (Tens & Compounds)',
                            count: 28,
                            icon: '🔢',
                          },
                          {
                            id: 'numbers_hundreds',
                            title: 'Numbers: Hundreds & Large Numbers (quinientos, millón)',
                            count: 15,
                            icon: '🔢',
                          },
                          {
                            id: 'numbers_accents',
                            title: 'Numbers: Accent Traps (dieciséis, veintidós, veintitrés, veintiséis)',
                            count: 8,
                            icon: '✨',
                          },
                        ].map((drill) => {
                          const isChecked = selectedCategories.includes(drill.id);
                          return (
                            <button
                              key={drill.id}
                              type="button"
                              onClick={() => handleToggleCategory(drill.id)}
                              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                                isChecked
                                  ? 'bg-sky-500/20 text-[#1CB0F6] font-black'
                                  : 'hover:bg-slate-800/80 text-slate-200 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                                    isChecked
                                      ? 'bg-[#1CB0F6] border-[#1CB0F6] text-white'
                                      : 'border-slate-500'
                                  }`}
                                >
                                  {isChecked && '✓'}
                                </div>
                                <span className="text-xs truncate">
                                  {drill.icon} {drill.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {drill.count} words
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Category Cards Grid (Click to toggle any category on or off) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleCategory('all')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedCategories.includes('all')
                      ? 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6] font-black shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs block">🌟 All 7 Categories</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                        selectedCategories.includes('all')
                          ? 'bg-[#1CB0F6] border-[#1CB0F6] text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {selectedCategories.includes('all') ? '✓' : ''}
                    </div>
                  </div>
                  <span className="text-[10px] opacity-75">{VOCABULARY_DATABASE.length} Words Total</span>
                </button>

                {CATEGORIES.map((c) => {
                  const isChecked = selectedCategories.includes(c.id);
                  const count = VOCABULARY_DATABASE.filter((v) => v.category === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleCategory(c.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-black shadow-xs ring-1 ring-emerald-400/40'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate block">{c.name}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                            isChecked
                              ? 'bg-[#58CC02] border-[#58CC02] text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 truncate mt-0.5">
                        <span>{c.spanishName}</span>
                        <span className="font-mono">{count} words</span>
                      </div>
                    </button>
                  );
                })}

                {/* Direct Card for Random Dynamic Numbers */}
                {(() => {
                  const isChecked = selectedCategories.includes('numbers_random');
                  return (
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('numbers_random')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#FF9600] bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white font-black shadow-xs ring-1 ring-amber-400/40'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate block">🎲 Random Numbers</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                            isChecked
                              ? 'bg-[#FF9600] border-[#FF9600] text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 truncate mt-0.5">
                        <span>2345, 1546...</span>
                        <span className="font-mono text-amber-500 font-bold">Infinite</span>
                      </div>
                    </button>
                  );
                })()}
              </div>

              {/* Selected Categories Chips Preview */}
              {!selectedCategories.includes('all') && selectedCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-black uppercase text-slate-400">Active Filters:</span>
                  {selectedCategories.map((catId) => {
                    const catObj = CATEGORIES.find((c) => c.id === catId);
                    const label = catObj
                      ? catObj.name
                      : catId === 'numbers_random'
                      ? '🎲 Random Numbers (2345, 1546...)'
                      : catId.replace('numbers_', 'Numbers: ');
                    return (
                      <span
                        key={catId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-black"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(catId)}
                          className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                          title="Remove category"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Mode */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                2. Challenge Mode
              </label>
              <select
                value={customMode}
                onChange={(e) => setCustomMode(e.target.value as QuizMode)}
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#1CB0F6]"
              >
                <option value="mixed_quiz">🔀 Mixed Sprint (Multiple Choice + Typing)</option>
                <option value="multiple_choice">🔘 Multiple Choice (4 Confusable Spelling & Accent Options)</option>
                <option value="type_translation">⌨️ Typing Translation (Strict Spelling & Accents)</option>
                <option value="speed_round">⚡ Rapid Speed Round (10s countdown)</option>
                <option value="spelling_challenge">✨ Accent Master (Targeted Accents)</option>
                <option value="mistake_revision">🔄 Mistake Revision (Prior Missed Words)</option>
              </select>
            </div>

            {/* 3. Question Count (Expanded Counts, Stepper, Direct Typing, Slider) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                    3. Question Count
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Pool has {allCategoryWords.length} words available
                  </span>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6]">
                  {customCount} Questions
                </span>
              </div>

              {/* Extensive Question Presets */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200].map((cnt) => (
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
                <button
                  type="button"
                  onClick={() => setCustomCount(allCategoryWords.length)}
                  className={`py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    customCount === allCategoryWords.length
                      ? 'border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/40 text-[#58CC02] shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-emerald-600 hover:border-emerald-300'
                  }`}
                  title={`Test all ${allCategoryWords.length} words in selected categories`}
                >
                  All ({allCategoryWords.length})
                </button>
              </div>

              {/* Stepper & Exact Direct Number Input */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomCount((prev) => Math.max(1, prev - 10))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => setCustomCount((prev) => Math.max(1, prev - 5))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  -5
                </button>
                <input
                  type="range"
                  min="1"
                  max={Math.max(10, allCategoryWords.length)}
                  step="1"
                  value={Math.min(customCount, Math.max(10, allCategoryWords.length))}
                  onChange={(e) => setCustomCount(Math.max(1, Number(e.target.value) || 1))}
                  className="flex-1 accent-[#1CB0F6] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setCustomCount((prev) => Math.min(allCategoryWords.length * 2, prev + 5))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setCustomCount((prev) => Math.min(allCategoryWords.length * 2, prev + 10))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  +10
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max={allCategoryWords.length * 3}
                    value={customCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setCustomCount(Math.max(1, val));
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

            {/* Word Inclusion: Wanted Words Selection (Dedicated Section) */}
            <div className="md:col-span-2 p-5 sm:p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                      Select Specific Wanted Words
                    </span>
                    {selectedIncludeIds.length > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#58CC02]">
                        {selectedIncludeIds.length} Wanted Words Selected
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    {selectedIncludeIds.length === 0
                      ? 'Optional: Select specific words to test exclusively in your quiz session.'
                      : `Quiz is configured to test these ${selectedIncludeIds.length} chosen words.`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedIncludeIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomCount(selectedIncludeIds.length)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black hover:bg-emerald-200 cursor-pointer"
                      title="Set quiz questions count to match wanted words count"
                    >
                      Match Count ({selectedIncludeIds.length} Qs)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearWanted}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWordSelector((prev) => !prev)}
                    className="px-4 py-2 rounded-xl btn-duo-blue text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-button"
                  >
                    <span>{showWordSelector ? 'Close Word Picker' : 'Open Wanted Words Picker'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showWordSelector ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Selected Words Chips Flow */}
              {selectedIncludeIds.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-500">
                    <span>
                      🎯 Your Chosen Wanted Words ({selectedIncludeIds.length} words):
                    </span>
                    <button
                      type="button"
                      onClick={handleClearWanted}
                      className="text-rose-500 hover:underline font-bold text-[11px]"
                    >
                      Remove All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedIncludeIds.map((id) => {
                      const vocab = VOCABULARY_DATABASE.find((v) => v.id === id);
                      if (!vocab) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-black text-[#1CB0F6]"
                        >
                          <span>{vocab.spanish}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">({vocab.english})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWantedWord(id)}
                            className="hover:text-rose-500 ml-0.5 text-slate-400 hover:text-rose-500 font-black cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Word Selector Panel */}
              {showWordSelector && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  {/* Quick Pick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-slate-400">Quick Pick:</span>
                    <button
                      type="button"
                      onClick={() => handlePickRandomWanted(5)}
                      className="px-3 py-1.5 rounded-xl bg-[#E5F6FF] dark:bg-sky-950 text-[#1CB0F6] text-xs font-black hover:bg-sky-200/60 cursor-pointer"
                    >
                      Pick 5 Random
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePickRandomWanted(10)}
                      className="px-3 py-1.5 rounded-xl bg-[#E5F6FF] dark:bg-sky-950 text-[#1CB0F6] text-xs font-black hover:bg-sky-200/60 cursor-pointer"
                    >
                      Pick 10 Random
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePickRandomWanted(20)}
                      className="px-3 py-1.5 rounded-xl bg-[#E5F6FF] dark:bg-sky-950 text-[#1CB0F6] text-xs font-black hover:bg-sky-200/60 cursor-pointer"
                    >
                      Pick 20 Random
                    </button>
                    <button
                      type="button"
                      onClick={handlePickAccentTrapsWanted}
                      className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#CE82FF] text-xs font-black hover:bg-purple-200/60 cursor-pointer"
                    >
                      ✨ Accent Trap Words
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllFilteredWanted}
                      className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black hover:bg-emerald-200/60 cursor-pointer"
                    >
                      Select All Filtered ({categoryWordsForSelector.length})
                    </button>
                  </div>

                  {/* Category Pills Inside Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectorCategoryTab('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
                        selectorCategoryTab === 'all'
                          ? 'bg-[#1CB0F6] text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      All Categories ({allCategoryWords.length})
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectorCategoryTab(cat.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
                          selectorCategoryTab === cat.id
                            ? 'bg-[#1CB0F6] text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Word quick search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={wordSearchFilter}
                      onChange={(e) => setWordSearchFilter(e.target.value)}
                      placeholder="Quick search words to include (e.g. burgundy, wine red, dieciséis, lima, esmeralda, maíz)..."
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1CB0F6]"
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

                  {/* Word Grid */}
                  <div className="max-h-72 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {categoryWordsForSelector.map((v) => {
                      const isSelected = selectedIncludeIds.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleToggleWordInclude(v.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'border-[#58CC02] bg-emerald-50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 rounded text-[#58CC02] accent-[#58CC02] cursor-pointer shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                                {v.spanish}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                                {v.english}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundManager.speakSpanish(v.spanish, settings.speechRate);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-[#1CB0F6] hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                              title="Pronounce"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                              {v.category}
                            </span>
                          </div>
                        </div>
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
