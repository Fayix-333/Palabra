import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  Heart,
  Plus,
  Infinity as InfinityIcon,
  Cloud,
  Check,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PacoMascot } from '../common/PacoMascot';
import { FireFlame } from '../common/FireFlame';
import { Modal } from '../common/Modal';
import { ChatModal } from '../common/ChatModal';
import { StreakModal } from '../common/StreakModal';

export const Navbar: React.FC = () => {
  const {
    stats,
    streakDays,
    isDailyGoalAchieved,
    hearts,
    maxHearts,
    refillHeartsWithXp,
    settings,
    updateSettings,
    user,
    signInWithGoogle,
    cloudSyncStatus,
  } = useApp();
  const [showHeartModal, setShowHeartModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch {
      // ignore
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full ios27-glass border-b border-white/40 dark:border-white/10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="https://res.cloudinary.com/ml3haxvw/image/upload/f_auto/q_auto/image-removebg-preview_1.png"
              alt="PALABRA Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs transition-transform group-hover:scale-105 shrink-0"
            />
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

            {/* Streak Button */}
            <button
              type="button"
              onClick={() => setShowStreakModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 font-black text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isDailyGoalAchieved
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-[#FF9600] shadow-2xs ring-2 ring-amber-400/20'
                  : 'bg-[#FFF5E5] dark:bg-amber-950/40 border-[#FFD280] dark:border-amber-800/60 text-[#FF9600]'
              }`}
              title={`${streakDays} Day Learning Streak • Click to inspect or adjust streak`}
            >
              <FireFlame
                size="xs"
                isBurning={true}
                isGoalAchieved={isDailyGoalAchieved}
                showSparks={false}
              />
              <span className="font-mono text-sm">{streakDays}</span>
            </button>

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

            {/* Chat Room Button */}
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E5F6FF] dark:bg-sky-950/40 border-2 border-[#1CB0F6] text-[#1CB0F6] font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-2xs"
              title="Open Sibaq Live Learner Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            {/* Google Login / Profile Avatar */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 hover:scale-105 active:scale-95 transition-all"
                title={`${user.displayName || 'Google Account'} • Progress synced with Firebase`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-lg object-cover border border-emerald-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-[#58CC02] text-white flex items-center justify-center text-xs font-black">
                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-black text-slate-800 dark:text-slate-100 max-w-[80px] truncate">
                  {user.displayName?.split(' ')[0] || 'User'}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#58CC02] shadow-xs" title="Synced" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#1CB0F6] bg-white dark:bg-slate-800 hover:bg-[#E5F6FF] dark:hover:bg-sky-950/40 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-[#1CB0F6] transition-all shadow-2xs hover:shadow-xs active:scale-95"
                title="Sign in with Google to save your streak and progress in Firebase"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isSigningIn ? 'Connecting...' : 'Save Progress'}
                </span>
              </button>
            )}
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

      {/* Chat Room Modal */}
      <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} />

      {/* Streak Management & Details Modal */}
      <StreakModal isOpen={showStreakModal} onClose={() => setShowStreakModal(false)} />
    </>
  );
};
