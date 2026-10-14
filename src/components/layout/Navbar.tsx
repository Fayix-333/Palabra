import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Heart, Plus, Infinity as InfinityIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PacoMascot } from '../common/PacoMascot';
import { Modal } from '../common/Modal';

export const Navbar: React.FC = () => {
  const { stats, hearts, maxHearts, refillHeartsWithXp, settings, updateSettings } = useApp();
  const [showHeartModal, setShowHeartModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <PacoMascot size="sm" mood="happy" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-[#58CC02] tracking-tight">
                  PALABRA
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-[#FF4B4B] text-white tracking-wider">
                  TN.31
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden sm:block leading-none">
                Spanish Vocabulary Mastery • DHIU Sibaq
              </p>
            </div>
          </Link>

          {/* Stats bar: Flag, Streak, XP, Hearts */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spanish Flag */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-xs"
              title="Target language: Spanish (Spain & Latin America)"
            >
              <span className="text-base leading-none">🇪🇸</span>
              <span className="hidden sm:inline font-bold text-slate-700 dark:text-slate-300">
                Español
              </span>
            </div>

            {/* Streak */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF5E5] dark:bg-amber-950/40 border-2 border-[#FFD280] dark:border-amber-800/60 text-[#FF9600] font-black text-xs"
              title={`${stats.streakDays} Day Learning Streak`}
            >
              <Flame className="w-4 h-4 fill-[#FF9600] text-[#FF9600] animate-bounce" />
              <span className="font-mono text-sm">{stats.streakDays}</span>
            </div>

            {/* XP */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F6EEFF] dark:bg-purple-950/40 border-2 border-[#E1C2FF] dark:border-purple-800/60 text-[#CE82FF] font-black text-xs"
              title={`${stats.xp} Total XP`}
            >
              <Sparkles className="w-4 h-4 text-[#CE82FF]" />
              <span className="font-mono text-sm">{stats.xp}</span>
            </div>

            {/* Hearts Button */}
            <button
              type="button"
              onClick={() => setShowHeartModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEBEB] dark:bg-rose-950/40 border-2 border-[#FFA8A8] dark:border-rose-900/60 text-[#FF4B4B] font-black text-xs hover:scale-105 active:scale-95 transition-transform"
              title="Learning Hearts (click to refill)"
            >
              <Heart className="w-4 h-4 fill-[#FF4B4B] text-[#FF4B4B]" />
              {settings.unlimitedHearts ? (
                <InfinityIcon className="w-4 h-4" />
              ) : (
                <span className="font-mono text-sm">
                  {hearts}/{maxHearts}
                </span>
              )}
              {!settings.unlimitedHearts && hearts < maxHearts && (
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Heart Refill Modal */}
      <Modal
        isOpen={showHeartModal}
        onClose={() => setShowHeartModal(false)}
        title="Learning Hearts & Energy"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mx-auto text-[#FF4B4B]">
            <Heart className="w-8 h-8 fill-[#FF4B4B]" />
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {settings.unlimitedHearts
                ? 'Unlimited Hearts Active!'
                : `${hearts} of ${maxHearts} Hearts Left`}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Hearts motivate careful Spanish spelling and accent accuracy. Missed words consume a
              heart, but you can always refill them or practice mistakes!
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {!settings.unlimitedHearts && hearts < maxHearts && (
              <button
                type="button"
                onClick={() => {
                  refillHeartsWithXp(50);
                  setShowHeartModal(false);
                }}
                disabled={stats.xp < 50}
                className="w-full py-3 px-4 rounded-xl btn-duo-green flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Refill Hearts for 50 XP</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                updateSettings({ unlimitedHearts: !settings.unlimitedHearts });
                setShowHeartModal(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl btn-duo-white text-xs font-bold"
            >
              {settings.unlimitedHearts
                ? 'Switch to Realistic 5-Heart Mode'
                : 'Enable Free Unlimited Hearts'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
