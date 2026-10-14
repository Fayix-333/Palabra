import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  BookOpen,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { DayPlanItem } from '../types';

export const StudyPlan: React.FC = () => {
  const navigate = useNavigate();
  const { studyPlan, togglePlanDay, awardXp } = useApp();

  const completedCount = studyPlan.filter((d) => d.completed).length;
  const planPct = Math.round((completedCount / studyPlan.length) * 100);

  const handleLaunchDayActivity = (dayItem: DayPlanItem) => {
    if (dayItem.category === 'mock') {
      navigate('/mock-test');
      return;
    }

    if (dayItem.category === 'mixed') {
      navigate('/quiz?mode=mixed_quiz&count=50&category=all');
      return;
    }

    if (dayItem.category === 'speed') {
      navigate('/quiz?mode=speed_round&count=30&speedLimit=10&category=all');
      return;
    }

    if (dayItem.category === 'spelling') {
      navigate('/quiz?mode=spelling_challenge&count=30&strict=true&category=all');
      return;
    }

    if (dayItem.category === 'revision') {
      navigate('/quiz?mode=mistake_revision&count=30');
      return;
    }

    // Category specific
    navigate(
      `/quiz?mode=${dayItem.recommendedQuizMode}&category=${dayItem.category}&count=${dayItem.targetCount}`
    );
  };

  const handleToggle = (dayNumber: number, wasCompleted: boolean) => {
    togglePlanDay(dayNumber);
    if (!wasCompleted) {
      awardXp(40, `Day ${dayNumber} Study Plan Completed`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span>15-Day Preparation Plan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
          15-Day Sibaq Preparation Curriculum
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Structured syllabus checklist to systematically master all 7 competition areas
        </p>
      </div>

      {/* Overview Progress Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Curriculum Progress
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {completedCount} of {studyPlan.length} Days Completed
            </h2>
          </div>
          <span className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
            {planPct}%
          </span>
        </div>

        <ProgressBar
          value={planPct}
          size="md"
          showPercentage={false}
          colorClassName="bg-rose-600 dark:bg-rose-500"
        />

        <p className="text-xs text-slate-500 leading-relaxed">
          All 15 days are unlocked. You can follow the sequential order or jump directly to areas
          where your recall needs reinforcement.
        </p>
      </div>

      {/* Plan Days List */}
      <div className="space-y-3">
        {studyPlan.map((item) => (
          <div
            key={item.day}
            className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              item.completed
                ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={() => handleToggle(item.day, item.completed)}
                className="mt-1 text-slate-400 hover:text-emerald-600 transition-colors"
                title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    Day {item.day}
                  </span>
                  <span className="text-slate-300">·</span>
                  <h3
                    className={`text-sm font-bold text-slate-900 dark:text-white ${
                      item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.categoryLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  {item.focus}
                </p>

                <span className="text-[11px] text-slate-400 block pt-0.5 font-mono">
                  Target: {item.targetCount} words • Recommended:{' '}
                  {item.recommendedQuizMode.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleLaunchDayActivity(item)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Day {item.day}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
