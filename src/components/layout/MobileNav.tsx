import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, BookOpen, Trophy, User } from 'lucide-react';

const MOBILE_ITEMS = [
  { to: '/', label: 'Learn', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/vocabulary', label: 'Vocab', icon: BookOpen },
  { to: '/leaderboard', label: 'League', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 px-2 py-1 select-none">
      <div className="flex items-center justify-around h-14">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-black tracking-wider transition-all ${
                  isActive
                    ? 'text-[#1CB0F6] scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2.5] mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
