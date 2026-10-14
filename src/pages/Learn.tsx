import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Volume2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Star,
  Bookmark,
  ArrowUpDown,
  Filter,
  Info,
} from 'lucide-react';
import { VOCABULARY_DATABASE, CATEGORIES } from '../data/vocabulary';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';
import { CategoryId, VocabularyItem } from '../types';

export const Learn: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as CategoryId) || 'all';

  const {
    settings,
    wordProgress,
    recordWordAttempt,
    toggleWordFavorite,
    awardXp,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, unlearned, revision, mastered
  const [direction, setDirection] = useState<'en_to_es' | 'es_to_en'>('en_to_es');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  // Filter items
  const filteredVocab = useMemo(() => {
    return VOCABULARY_DATABASE.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (filterDifficulty !== 'all' && item.difficulty !== filterDifficulty) return false;

      const progress = wordProgress[item.id];
      if (filterStatus === 'unlearned' && (progress?.timesSeen || 0) > 0) return false;
      if (filterStatus === 'revision' && !progress?.needsRevision) return false;
      if (filterStatus === 'mastered' && !progress?.mastered) return false;
      if (filterStatus === 'favorite' && !progress?.isFavorite) return false;

      return true;
    });
  }, [selectedCategory, filterDifficulty, filterStatus, wordProgress]);

  // Sync category param with state
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams, selectedCategory]);

  // Reset index & build initial index order
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffledOrder(filteredVocab.map((_, i) => i));
  }, [filteredVocab]);

  const activeIndex = shuffledOrder[currentIndex] ?? 0;
  const currentItem: VocabularyItem | undefined = filteredVocab[activeIndex];
  const itemProgress = currentItem ? wordProgress[currentItem.id] : undefined;

  const handleNext = useCallback(() => {
    if (currentIndex < filteredVocab.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, filteredVocab.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    const indices = [...shuffledOrder];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSpeak = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    soundManager.speakSpanish(currentItem.spanish, settings.speechRate);
  };

  const handleRating = (rating: 'easy' | 'got_it' | 'difficult') => {
    if (!currentItem) return;
    const isCorrect = rating !== 'difficult';
    const isStrict = rating === 'easy';
    recordWordAttempt(currentItem.id, isCorrect, isStrict);

    if (rating === 'easy') {
      awardXp(15, 'Flashcard Easy rating');
    } else if (rating === 'got_it') {
      awardXp(10, 'Flashcard Got It');
    } else {
      awardXp(5, 'Flashcard Practice');
    }

    if (settings.soundEffects) {
      if (isCorrect) soundManager.playCorrect();
      else soundManager.playIncorrect();
    }

    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && isFlipped) {
        handleRating('difficult');
      } else if (e.key === '2' && isFlipped) {
        handleRating('got_it');
      } else if (e.key === '3' && isFlipped) {
        handleRating('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Learn Mode</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            Flashcard Vocabulary Training
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive spaced repetition for the official Sibaq Spanish syllabus
          </p>
        </div>

        {/* Direction Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection((d) => (d === 'en_to_es' ? 'es_to_en' : 'en_to_es'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="Switch study direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-600" />
            <span>
              {direction === 'en_to_es' ? 'English → Spanish (Sibaq)' : 'Spanish → English'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Category:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSearchParams(e.target.value === 'all' ? {} : { category: e.target.value });
          }}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">All 7 Categories ({VOCABULARY_DATABASE.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({VOCABULARY_DATABASE.filter((v) => v.category === c.id).length})
            </option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">All Statuses</option>
          <option value="unlearned">Unlearned Only</option>
          <option value="revision">Needs Revision</option>
          <option value="mastered">Mastered Only</option>
          <option value="favorite">Bookmarked / Favorites</option>
        </select>

        <div className="ml-auto text-xs font-mono text-slate-500 dark:text-slate-400">
          Card {filteredVocab.length > 0 ? currentIndex + 1 : 0} of {filteredVocab.length}
        </div>
      </div>

      {/* Main Flashcard Container */}
      {filteredVocab.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No vocabulary matches the current filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting the category, difficulty, or status filter to continue practicing.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setFilterDifficulty('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        currentItem && (
          <div className="space-y-6">
            {/* The Flashcard */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[340px] sm:min-h-[380px] w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all p-8 sm:p-10 flex flex-col justify-between cursor-pointer select-none group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {currentItem.category}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{currentItem.difficulty}</span>
                  {currentItem.hasAccents && (
                    <>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Accents</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWordFavorite(currentItem.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                    title="Bookmark word"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        itemProgress?.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Pronounce Spanish"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="my-auto text-center space-y-4 py-6">
                {!isFlipped ? (
                  /* FRONT OF CARD */
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      {direction === 'en_to_es' ? 'English Prompt' : 'Spanish Prompt'}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                      {direction === 'en_to_es' ? currentItem.english : currentItem.spanish}
                    </h2>
                    {currentItem.gender && (
                      <span className="inline-block text-xs text-slate-400 font-mono">
                        Gender: {currentItem.gender}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 pt-2 flex items-center justify-center gap-1">
                      <span>Click or press</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                        Space
                      </kbd>
                      <span>to reveal answer</span>
                    </p>
                  </div>
                ) : (
                  /* BACK OF CARD */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <span className="text-xs uppercase font-semibold tracking-wider text-rose-600 dark:text-rose-400">
                      {direction === 'en_to_es' ? 'Spanish Translation' : 'English Meaning'}
                    </span>

                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                        {direction === 'en_to_es' ? currentItem.spanish : currentItem.english}
                      </h2>
                      <button
                        type="button"
                        onClick={handleSpeak}
                        className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                        title="Listen again"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Pronunciation & alternatives */}
                    {currentItem.pronunciation && (
                      <p className="text-xs font-mono text-slate-400">
                        {currentItem.pronunciation}
                      </p>
                    )}

                    {currentItem.alternatives.length > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Also accepted:
                        </span>{' '}
                        {currentItem.alternatives.join(', ')}
                      </div>
                    )}

                    {currentItem.examplePhrase && (
                      <div className="p-3 max-w-lg mx-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-1">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          "{currentItem.examplePhrase}"
                        </p>
                        {currentItem.exampleTranslation && (
                          <p className="text-slate-500 dark:text-slate-400">
                            {currentItem.exampleTranslation}
                          </p>
                        )}
                      </div>
                    )}

                    {currentItem.memoryHint && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto italic">
                        💡 {currentItem.memoryHint}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Rating or Flip CTA */}
              <div
                className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                {!isFlipped ? (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Reveal Spanish Answer
                  </button>
                ) : (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Rate recall:</span>
                      <span className="font-mono">Keys [1, 2, 3]</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRating('difficult')}
                        className="py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
                      >
                        1. Difficult
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRating('got_it')}
                        className="py-2 px-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
                      >
                        2. Got It
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRating('easy')}
                        className="py-2 px-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        3. Easy (+15 XP)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Previous / Next Controls */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous (Left Arrow)
              </button>

              <div className="text-center">
                <span className="text-xs font-mono font-medium text-slate-500">
                  {currentIndex + 1} / {filteredVocab.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === filteredVocab.length - 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                Next (Right Arrow)
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
