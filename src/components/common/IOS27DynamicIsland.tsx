import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Users,
  Flame,
  CheckCircle2,
  X,
  Volume2,
  Cloud,
  ChevronDown,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { subscribeToBroadcasts, BroadcastMessage } from '../../utils/firebase';
import { soundManager } from '../../utils/sound';

export const IOS27DynamicIsland: React.FC = () => {
  const { user, stats, cloudSyncStatus } = useApp();
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [activeAlert, setActiveAlert] = useState<BroadcastMessage | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Subscribe to real-time broadcasts
  useEffect(() => {
    const unsub = subscribeToBroadcasts((incoming) => {
      setBroadcasts(incoming);

      if (incoming.length > 0) {
        // If it's initial load, mark existing ones as seen, but if there's a recent login within 2 mins from another user, show it
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          incoming.forEach((b) => seenIdsRef.current.add(b.id));

          const recentOther = incoming.find(
            (b) =>
              b.userId !== user?.uid &&
              Date.now() - b.timestamp < 1000 * 60 * 3
          );
          if (recentOther) {
            triggerAlert(recentOther);
          }
          return;
        }

        // New incoming broadcasts
        const fresh = incoming.find(
          (b) => !seenIdsRef.current.has(b.id) && b.userId !== user?.uid
        );

        if (fresh) {
          seenIdsRef.current.add(fresh.id);
          triggerAlert(fresh);
        }
      }
    });

    return () => unsub();
  }, [user?.uid]);

  const triggerAlert = (msg: BroadcastMessage) => {
    setActiveAlert(msg);
    setIsExpanded(true);
    try {
      soundManager.playCorrect();
    } catch {
      // ignore
    }

    // Auto-collapse after 7 seconds
    setTimeout(() => {
      setIsExpanded(false);
    }, 7000);
  };

  const handleSendGreeting = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.15 },
        colors: ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF'],
      });
      soundManager.playFanfare();
    } catch {
      // ignore
    }
    setIsExpanded(false);
  };

  const timeAgo = (ms: number) => {
    const diff = Math.floor((Date.now() - ms) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      {/* Floating iOS 27 Dynamic Island Capsule at Top Center */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out select-none">
        <div
          className={`relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isExpanded
              ? 'w-[92vw] max-w-md p-3.5 rounded-[28px] bg-black/85 dark:bg-black/90 text-white shadow-2xl backdrop-blur-2xl border border-white/20'
              : 'px-4 py-1.5 rounded-full bg-black/80 dark:bg-black/85 text-white/90 shadow-lg backdrop-blur-xl border border-white/15 cursor-pointer hover:bg-black/90 hover:scale-105'
          }`}
          onClick={() => {
            if (!isExpanded) {
              setShowHistoryModal(true);
            }
          }}
        >
          {/* Specular sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -translate-x-full animate-[liquid-sheen_8s_infinite]" />

          {isExpanded && activeAlert ? (
            /* Expanded Dynamic Island Notification */
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                {activeAlert.userPhoto ? (
                  <img
                    src={activeAlert.userPhoto}
                    alt={activeAlert.userName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400/80"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center text-white font-bold text-base shadow-inner">
                    {activeAlert.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-black animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Learner Joined</span>
                </div>
                <p className="text-sm font-black text-white truncate">
                  {activeAlert.userName}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {activeAlert.message}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendGreeting();
                  }}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>👋 ¡Hola!</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-1 rounded-full hover:bg-white/15 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Compact Capsule pill */
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-300 text-[11px]">
                <Users className="w-3 h-3" />
                <span>{broadcasts.length > 0 ? `${broadcasts.length} Active` : 'Community'}</span>
              </span>
              {cloudSyncStatus === 'synced' && (
                <span className="text-emerald-400 text-[10px] hidden sm:inline-flex items-center gap-0.5">
                  <Cloud className="w-3 h-3" />
                  <span>Synced</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Community Activity Feed Modal (iOS 27 Liquid Glass modal) */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="w-full max-w-md ios27-glass-card p-6 shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center text-white shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    Live Learner Community
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time logins & study milestones from all users
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="mt-4 max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {broadcasts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold">No recent logins yet</p>
                  <p className="text-xs mt-1">Sign in with Google to broadcast your progress to fellow learners!</p>
                </div>
              ) : (
                broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-white/10 shadow-sm hover:scale-[1.01] transition-transform"
                  >
                    {b.userPhoto ? (
                      <img
                        src={b.userPhoto}
                        alt={b.userName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/50"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {b.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                          {b.userName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {timeAgo(b.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {b.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="mt-5 pt-3 border-t border-white/20 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected via Firebase Firestore</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  confetti({ particleCount: 30, spread: 50 });
                  setShowHistoryModal(false);
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
