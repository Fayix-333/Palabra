import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  Settings,
  Calendar,
  BookOpen,
  Cloud,
  CloudCheck,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PacoMascot } from '../components/common/PacoMascot';
import { ProgressBar } from '../components/common/ProgressBar';

export const Profile: React.FC = () => {
  const {
    settings,
    stats,
    achievements,
    completedLessonIds,
    totalWordsLearned,
    totalWordsCount,
    overallAccuracy,
    user,
    signInWithGoogle,
    signOutUser,
    cloudSyncStatus,
    manualCloudSync,
  } = useApp();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
  };

  // 7-day streak calendar
  const today = new Date();
  const pastWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isPracticed = (stats.dailyProgress[dateStr] || 0) > 0;
    return { dateStr, dayLetter, isPracticed };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 select-none">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <PacoMascot size="lg" mood="champion" />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {settings.studentName}
            </h1>
            <p className="text-xs font-bold text-[#58CC02]">
              DHIU Sibaq National Candidate • TN.31 PALABRA
            </p>
            <p className="text-xs text-slate-400">
              Joined {new Date(stats.lastHeartRefillDate || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <Link
          to="/settings"
          className="px-4 py-2 rounded-xl btn-duo-white text-xs font-black flex items-center gap-1.5 self-center sm:self-start"
        >
          <Settings className="w-4 h-4" />
          <span>EDIT SETTINGS</span>
        </Link>
      </div>

      {/* Google Login & Firebase Cloud Save Card */}
      <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Account'}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center text-lg font-black shadow-xs">
                  {(user.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {user.displayName || 'Google User'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-[#58CC02] border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    <span>Firebase Synced</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {user.email} • Progress automatically protected in cloud
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => manualCloudSync()}
                disabled={cloudSyncStatus === 'syncing'}
                className="px-3.5 py-2 rounded-xl btn-duo-blue text-xs font-black flex items-center gap-1.5"
                title="Force sync latest progress to Firebase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-rose-300 bg-white dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-[#FF4B4B] flex items-center gap-1.5 transition-all"
                title="Sign out of Google"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1CB0F6]">
                <ShieldCheck className="w-4 h-4 text-[#1CB0F6]" />
                <span>Cloud Progress Save</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Save your progress with Google & Firebase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-lg leading-relaxed">
                Connect your Google account so your streak, XP, mastered vocabulary, and Sibaq test records are safely backed up across devices.
              </p>
              {authError && (
                <p className="text-xs font-bold text-rose-500 mt-1">{authError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="px-5 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:border-[#4285F4] bg-white dark:bg-slate-800 shadow-button hover:shadow-xs active:translate-y-1 text-xs font-black text-slate-800 dark:text-white flex items-center justify-center gap-2.5 transition-all shrink-0 cursor-pointer"
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
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Overview Statistics Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
          Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Streak */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#FF9600]">
              <Flame className="w-4 h-4 fill-[#FF9600]" />
              <span>STREAK</span>
            </div>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
              {stats.streakDays} Days
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Best: {stats.longestStreak} days
            </span>
          </div>

          {/* Total XP */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#CE82FF]">
              <Sparkles className="w-4 h-4" />
              <span>TOTAL XP</span>
            </div>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
              {stats.xp}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Rank #4 Emerald
            </span>
          </div>

          {/* Lessons Done */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#58CC02]">
              <BookOpen className="w-4 h-4" />
              <span>LESSONS</span>
            </div>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
              {completedLessonIds.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Across 7 Units
            </span>
          </div>

          {/* Words Mastered */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#1CB0F6]">
              <Award className="w-4 h-4" />
              <span>ACCURACY</span>
            </div>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
              {overallAccuracy}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {totalWordsLearned}/{totalWordsCount} words
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Row */}
      <div className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF9600]" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Learning Streak Calendar
            </h3>
          </div>
          <span className="text-xs font-black font-mono text-[#FF9600]">
            {stats.streakDays} Day Streak Active
          </span>
        </div>

        <div className="flex items-center justify-around pt-2">
          {pastWeek.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-black text-slate-400">{day.dayLetter}</span>
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all ${
                  day.isPracticed
                    ? 'bg-[#FF9600] border-[#E58500] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                {day.isPracticed ? <Flame className="w-5 h-5 fill-white text-white" /> : '•'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
            Achievements ({achievements.filter((a) => a.unlockedAt).length} / {achievements.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {achievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            const pct = Math.round((ach.progress / ach.maxProgress) * 100);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-3xl border-2 transition-all flex items-start gap-4 ${
                  isUnlocked
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-75'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-[#FFC800] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Trophy className="w-6 h-6 fill-current" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {ach.title}
                    </h4>
                    <span className="text-[11px] font-black font-mono text-[#CE82FF]">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight font-semibold">
                    {ach.description}
                  </p>

                  <div className="pt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          isUnlocked ? 'bg-[#FFC800]' : 'bg-[#58CC02]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1 font-mono">
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                      <span>{isUnlocked ? 'Completed' : `${pct}%`}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
