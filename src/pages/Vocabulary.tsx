import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Volume2,
  Copy,
  Check,
  Bookmark,
  Printer,
  FileText,
  Edit3,
  Save,
  BookOpen,
} from 'lucide-react';
import { VOCABULARY_DATABASE, CATEGORIES } from '../data/vocabulary';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';
import { VocabularyItem } from '../types';

export const Vocabulary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';

  const { settings, wordProgress, toggleWordFavorite, saveWordNote } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [filterAccentOnly, setFilterAccentOnly] = useState(false);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>('all');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Sync category from URL if it changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Filtered vocabulary list
  const filteredList = useMemo(() => {
    return VOCABULARY_DATABASE.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Difficulty filter
      if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) return false;
      // Accent filter
      if (filterAccentOnly && !item.hasAccents) return false;
      // Bookmark filter
      if (filterFavoritesOnly && !wordProgress[item.id]?.isFavorite) return false;

      // Alphabetical browse
      if (activeLetter !== 'all') {
        const firstLetter = item.spanish.charAt(0).toLowerCase();
        if (firstLetter !== activeLetter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const enMatch = item.english.toLowerCase().includes(q);
        const esMatch = item.spanish.toLowerCase().includes(q);
        const altMatch = item.alternatives.some((a) => a.toLowerCase().includes(q));
        const catMatch =
          item.category.toLowerCase().includes(q) ||
          ((q === 'color' || q === 'colors' || q === 'colour' || q === 'colours' || q === 'colores') && item.category === 'colours');
        if (!enMatch && !esMatch && !altMatch && !catMatch) return false;
      }

      return true;
    });
  }, [
    activeLetter,
    filterAccentOnly,
    filterFavoritesOnly,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    wordProgress,
  ]);

  const handleCopy = (item: VocabularyItem) => {
    navigator.clipboard.writeText(item.spanish);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSpeak = (spanish: string) => {
    soundManager.speakSpanish(spanish, settings.speechRate);
  };

  const handleOpenNote = (item: VocabularyItem) => {
    setEditingNoteId(item.id);
    setNoteText(wordProgress[item.id]?.userNotes || '');
  };

  const handleSaveNote = (vocabId: string) => {
    saveWordNote(vocabId, noteText);
    setEditingNoteId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Alphabet letter index for quick jump
  const alphabetLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            Vocabulary Database & Reference
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Searchable dictionary of {VOCABULARY_DATABASE.length} words across all 7 official Sibaq syllabus areas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPrintMode(!isPrintMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>{isPrintMode ? 'Normal View' : 'Printable Revision Sheet'}</span>
          </button>

          {isPrintMode && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4</span>
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE REVISION SHEET VIEW */}
      {isPrintMode ? (
        <div className="print-page bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-900">
          <div className="border-b border-slate-300 pb-4 flex justify-between items-baseline">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-slate-950">
                PALABRA — Spanish Vocabulary Revision Sheet
              </h2>
              <p className="text-xs text-slate-600">
                DHIU Sibaq National Arts Fest • Competition Code: TN.31 PALABRA
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              Total entries: {filteredList.length} words
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3 w-12">#</th>
                  <th className="py-2 px-3 w-48">English Word</th>
                  <th className="py-2 px-3 w-32">Category</th>
                  <th className="py-2 px-3 w-60">Spanish Translation</th>
                  <th className="py-2 px-3">Self-Recall Practice Column</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{item.english}</td>
                    <td className="py-2 px-3 text-slate-600 capitalize">{item.category}</td>
                    <td className="py-2 px-3 font-medium text-slate-950">
                      {item.spanish}
                      {item.alternatives.length > 0 && (
                        <span className="text-[10px] text-slate-400 block">
                          alt: {item.alternatives.join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-b border-slate-200 border-dashed">
                      {/* Blank recall column for print testing */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STANDARD DICTIONARY VIEW */
        <div className="space-y-6">
          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              All ({VOCABULARY_DATABASE.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = VOCABULARY_DATABASE.filter((v) => v.category === c.id).length;
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#1CB0F6] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search English or Spanish words (e.g. apple, plátano, dieciséis, miércoles)..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Difficulty */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Toggle Accent Only */}
              <button
                type="button"
                onClick={() => setFilterAccentOnly(!filterAccentOnly)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  filterAccentOnly
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Accents Only
              </button>

              {/* Toggle Favorites Only */}
              <button
                type="button"
                onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
                className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                  filterFavoritesOnly
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Bookmarked
              </button>

              <div className="ml-auto text-xs font-mono text-slate-400">
                {filteredList.length} matching words
              </div>
            </div>

            {/* Alphabet quick jump row */}
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Browse:</span>
              <button
                type="button"
                onClick={() => setActiveLetter('all')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  activeLetter === 'all'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All
              </button>
              {alphabetLetters.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => setActiveLetter(char)}
                  className={`w-5 h-5 rounded text-[11px] font-mono uppercase flex items-center justify-center transition-colors ${
                    activeLetter === char
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Vocabulary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredList.map((item) => {
              const progress = wordProgress[item.id];
              const isEditing = editingNoteId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Header line: category & tags */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 text-[10px]">
                          {item.category}
                        </span>
                        <span>·</span>
                        <span className="capitalize text-[10px]">{item.difficulty}</span>
                        {item.hasAccents && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Accent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleWordFavorite(item.id)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                          title="Bookmark word"
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              progress?.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="Copy Spanish translation"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.spanish)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Speak Spanish"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Word display */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                          {item.english}
                        </h3>
                        <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                          {item.spanish}
                        </span>
                      </div>

                      {item.pronunciation && (
                        <p className="text-[11px] font-mono text-slate-400">
                          {item.pronunciation}
                        </p>
                      )}

                      {item.alternatives.length > 0 && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Alt:
                          </span>{' '}
                          {item.alternatives.join(', ')}
                        </p>
                      )}

                      {item.examplePhrase && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                          "{item.examplePhrase}"
                        </p>
                      )}

                      {item.memoryHint && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-0.5">
                          💡 {item.memoryHint}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Personal Student Note section */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add mnemonic or personal note..."
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-2 py-0.5 rounded text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(item.id)}
                            className="px-2 py-0.5 rounded text-[11px] bg-rose-600 text-white font-medium hover:bg-rose-500"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <span className="text-[11px] truncate max-w-[200px]">
                          {progress?.userNotes ? `📝 ${progress.userNotes}` : 'No personal note'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenNote(item)}
                          className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{progress?.userNotes ? 'Edit' : 'Add Note'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
