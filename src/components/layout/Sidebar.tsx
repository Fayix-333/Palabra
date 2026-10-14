import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  BookOpen,
  Trophy,
  User,
  Timer,
  CalendarCheck,
  Settings,
} from 'lucide-react';
import { PacoMascot } from '../common/PacoMascot';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'LEARN', icon: Home, end: true },
  { to: '/practice', label: 'PRACTICE', icon: Dumbbell },
  { to: '/vocabulary', label: 'VOCABULARY', icon: BookOpen },
  { to: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  { to: '/profile', label: 'PROFILE', icon: User },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="space-y-4">
        {/* Main navigation */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-black tracking-wider transition-all border-2 ${
                    isActive
                      ? 'bg-[#E5F6FF] dark:bg-sky-950/40 text-[#1CB0F6] border-[#1CB0F6] shadow-2xs translate-x-1'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-6 h-6 stroke-[2.5] ${
                        isActive ? 'text-[#1CB0F6]' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Competition Arena Promos */}
        <div className="pt-2 border-t-2 border-slate-100 dark:border-slate-800 space-y-2">
          <NavLink
            to="/mock-test"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-[#FF4B4B] bg-rose-50 text-[#FF4B4B] font-black'
                  : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40'
              }`
            }
          >
            <div className="w-8 h-8 rounded-xl bg-[#FF4B4B] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Timer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black block leading-tight text-slate-900 dark:text-white">
                SIBAQ ARENA
              </span>
              <span className="text-[10px] font-bold text-[#FF4B4B]">60-Min Mock Test</span>
            </div>
          </NavLink>

          <NavLink
            to="/plan"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-[#58CC02] bg-emerald-50 text-[#58CC02] font-black'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40'
              }`
            }
          >
            <div className="w-8 h-8 rounded-xl bg-[#58CC02] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black block leading-tight text-slate-900 dark:text-white">
                15-DAY PLAN
              </span>
              <span className="text-[10px] font-bold text-[#58CC02]">Curriculum</span>
            </div>
          </NavLink>
        </div>
      </div>

      {/* Settings at bottom */}
      <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive
                ? 'text-[#1CB0F6] bg-sky-50 dark:bg-sky-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>SETTINGS</span>
        </NavLink>
      </div>
    </aside>
  );
};
