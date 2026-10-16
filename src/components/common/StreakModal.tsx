import React, { useState, useEffect } from 'react';
import { Flame, Check, Sparkles, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { Modal } from './Modal';
import { FireFlame } from './FireFlame';
import { useApp } from '../../context/AppContext';
import { soundManager } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose }) => {
  const {
    stats,
    streakDays,
    longestStreak,
    isDailyGoalAchieved,
    todayWordsCount,
    setStreakDays,
    settings,
  } = useApp();

  const [inputDays, setInputDays] = useState<number>(streakDays || 3);
  const [showAdjustSection, setShowAdjustSection] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setInputDays(streakDays || 3);
      setSavedSuccess(false);
    }
  }, [isOpen, streakDays]);

  const handleApplyStreak = () => {
    const val = Math.max(1, Math.min(365, Math.round(Number(inputDays) || 3)));
    setStreakDays(val);
    setSavedSuccess(true);
    if (settings.soundEffects) {
      soundManager.playCorrect();
    }
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#FF9600', '#FFC800', '#58CC02'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  // 7-day display
  const pastWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = i === 6;
    const isPracticed =
      (stats.dailyProgress?.[dateStr] || 0) > 0 ||
      (stats.streakDates?.includes(dateStr) ?? false) ||
      (isToday && ((streakDays || 0) > 0 || todayWordsCount > 0));
    return { dateStr, dayLetter, isPracticed, isToday };
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Learning Streak" maxWidth="md">
      <div className="text-center space-y-5 select-none pt-2">
        {/* Animated Fire Display */}
        <div className="relative inline-flex flex-col items-center justify-center">
          <FireFlame
            size="xl"
            isBurning={true}
            isGoalAchieved={isDailyGoalAchieved}
            showSparks={true}
          />
          <div className="mt-3">
            <span className="text-4xl font-black font-mono text-[#FF9600] tracking-tight block">
              {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Current Streak
            </span>
          </div>
        </div>

        {/* Motivational Status */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1">
          <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9600]" />
            <span>Keep your Spanish study blazing!</span>
          </div>
          <p className="leading-relaxed opacity-90">
            Practice at least one vocabulary item or quiz each day to keep your streak alive. Your longest streak so far is <strong className="font-mono">{longestStreak} days</strong>.
          </p>
        </div>

        {/* 7-Day Activity Calendar */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF9600]" />
              <span>Last 7 Days</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {pastWeek.filter((d) => d.isPracticed).length} of 7 active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {pastWeek.map((day, idx) => (
              <div
                key={idx}
                className={`py-2 px-1 rounded-xl text-center border transition-all ${
                  day.isPracticed
                    ? 'bg-[#FF9600] text-white border-[#E58500] shadow-2xs font-black'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-400 border-slate-200 dark:border-slate-700'
                } ${day.isToday ? 'ring-2 ring-[#FF9600]/40' : ''}`}
              >
                <span className="text-[10px] block opacity-90">{day.dayLetter}</span>
                <div className="h-4 flex items-center justify-center mt-0.5">
                  {day.isPracticed ? (
                    <Flame className="w-3 h-3 fill-white text-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Adjustment Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-left">
          {!showAdjustSection ? (
            <button
              type="button"
              onClick={() => setShowAdjustSection(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Need to adjust or fix your streak? Click here</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF9600]" />
                  <span>Correct / Adjust Streak Days</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdjustSection(false)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                If your streak was incorrectly showing 9 days instead of your true 3 days, set it here to sync your badges and records accurately.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputDays((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 font-black text-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Decrease streak"
                >
                  -
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={inputDays}
                    onChange={(e) => setInputDays(Number(e.target.value))}
                    className="w-full text-center font-mono font-black text-xl py-2 px-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9600]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    days
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInputDays((prev) => Math.min(365, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 font-black text-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Increase streak"
                >
                  +
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setInputDays(3)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                    inputDays === 3
                      ? 'bg-[#FF9600] text-white border-[#E58500]'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  3 Days (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setInputDays(1)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-colors ${
                    inputDays === 1
                      ? 'bg-[#FF9600] text-white border-[#E58500]'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  1 Day
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplyStreak}
                className="w-full py-2.5 rounded-xl bg-[#FF9600] hover:bg-[#E58500] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-button active:translate-y-0.5 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Streak Saved! ({inputDays} Days)</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 fill-white" />
                    <span>Update Streak to {inputDays} {inputDays === 1 ? 'Day' : 'Days'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl btn-duo-green text-sm font-black"
        >
          Keep Learning
        </button>
      </div>
    </Modal>
  );
};
