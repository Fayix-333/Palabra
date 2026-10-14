import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Check,
  Play,
  Trophy,
  BookOpen,
  Sparkles,
  Lock,
  ChevronRight,
  Flame,
  RotateCcw,
  Timer,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEARNING_UNITS, LessonNode } from '../data/units';
import { PacoMascot } from '../components/common/PacoMascot';
import { Modal } from '../components/common/Modal';

export const LearningHome: React.FC = () => {
  const navigate = useNavigate();
  const { completedLessonIds, stats } = useApp();

  const [selectedLesson, setSelectedLesson] = useState<LessonNode | null>(null);

  // Find the first uncompleted lesson to mark as "current"
  const allLessons = LEARNING_UNITS.flatMap((u) => u.lessons);
  const currentLessonId =
    allLessons.find((l) => !completedLessonIds.includes(l.id))?.id || allLessons[0].id;

  const handleOpenLesson = (lesson: LessonNode) => {
    setSelectedLesson(lesson);
  };

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(null);
    navigate(`/lesson/${lessonId}`);
  };

  // Node position offset classes along winding path
  const getOffsetClass = (pos: 'left' | 'center' | 'right') => {
    switch (pos) {
      case 'left':
        return '-translate-x-10 sm:-translate-x-14';
      case 'right':
        return 'translate-x-10 sm:translate-x-14';
      default:
        return 'translate-x-0';
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20 select-none">
      {/* Top Course Card */}
      <div className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-slate-400">
          <span className="uppercase tracking-wider text-[#58CC02]">
            DHIU Sibaq • Competition Code TN.31
          </span>
          <span className="flex items-center gap-1 text-[#FF9600]">
            <Flame className="w-3.5 h-3.5 fill-[#FF9600]" />
            {stats.streakDays} Day Streak
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          ¡Hola! Let's learn Spanish!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
          Small lessons. Strong vocabulary. Sibaq-ready confidence.
        </p>

        {/* Course Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-[#E5F6FF] dark:bg-sky-950/40 border-2 border-[#1CB0F6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🇪🇸</span>
            <div>
              <span className="text-xs font-black text-[#1CB0F6] block">
                Spanish Foundations — PALABRA Edition
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {completedLessonIds.length} of {allLessons.length} Lessons Completed
              </span>
            </div>
          </div>
          <Link
            to="/plan"
            className="text-[11px] font-black text-[#1CB0F6] hover:underline flex items-center gap-0.5"
          >
            15-Day Plan <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 7 UNITS WINDING LEARNING PATH */}
      <div className="space-y-12">
        {LEARNING_UNITS.map((unit) => {
          return (
            <div key={unit.id} className="space-y-6">
              {/* Unit Header Banner */}
              <div
                className={`p-5 rounded-3xl bg-gradient-to-r ${unit.bannerColor} text-white shadow-md relative overflow-hidden`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider opacity-90">
                      {unit.title}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {unit.subtitle}
                    </h2>
                    <p className="text-xs opacity-90 max-w-sm leading-relaxed">
                      {unit.description}
                    </p>
                  </div>

                  <Link
                    to={`/vocabulary?category=${unit.id === 1 ? 'alphabets' : unit.id === 2 ? 'numbers' : unit.id === 3 ? 'days' : unit.id === 4 ? 'colours' : unit.id === 5 ? 'fruits' : unit.id === 6 ? 'vegetables' : 'all'}`}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black backdrop-blur-xs transition-colors shrink-0"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>GUIDEBOOK</span>
                  </Link>
                </div>
              </div>

              {/* Winding Lesson Path Nodes */}
              <div className="flex flex-col items-center gap-6 py-4 relative">
                {unit.lessons.map((lesson, idx) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;

                  // Button styling based on unit color
                  return (
                    <div
                      key={lesson.id}
                      className={`relative flex flex-col items-center ${getOffsetClass(
                        lesson.position
                      )}`}
                    >
                      {/* Current lesson mascot pointer */}
                      {isCurrent && (
                        <div className="absolute -top-12 z-20 animate-bounce flex flex-col items-center pointer-events-none">
                          <span className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-black text-[11px] px-2.5 py-1 rounded-xl text-[#58CC02] shadow-sm uppercase tracking-wider">
                            START
                          </span>
                          <div className="w-2.5 h-2.5 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-slate-200 dark:border-slate-700 transform rotate-45 -mt-1.5" />
                        </div>
                      )}

                      {/* Circular 3D Lesson Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenLesson(lesson)}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md relative group ${
                          isCompleted
                            ? 'bg-[#FFC800] border-b-6 border-[#E5A500] text-white'
                            : isCurrent
                            ? 'bg-[#58CC02] border-b-6 border-[#46A302] text-white ring-4 ring-[#D7FFB8] dark:ring-emerald-950 animate-pulse'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-6 border-b-slate-300 dark:border-b-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                        aria-label={`Open ${lesson.title}`}
                      >
                        {isCompleted ? (
                          <Check className="w-9 h-9 stroke-[3.5] text-white" />
                        ) : lesson.type === 'checkpoint' || lesson.type === 'test' ? (
                          <Trophy
                            className={`w-8 h-8 stroke-[2.5] ${
                              isCurrent ? 'fill-white text-white' : 'text-[#FFC800]'
                            }`}
                          />
                        ) : lesson.type === 'speed' ? (
                          <Zap
                            className={`w-8 h-8 stroke-[2.5] ${
                              isCurrent ? 'fill-white text-white' : 'text-[#FF9600]'
                            }`}
                          />
                        ) : (
                          <Star
                            className={`w-8 h-8 stroke-[2.5] ${
                              isCurrent ? 'fill-white text-white' : 'text-slate-400'
                            }`}
                          />
                        )}

                        {/* XP Badge */}
                        <span className="absolute -bottom-2 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white border border-white">
                          +{lesson.xpReward}
                        </span>
                      </button>

                      {/* Lesson title under button */}
                      <span className="mt-3 text-xs font-black text-slate-700 dark:text-slate-300 max-w-[130px] text-center leading-tight">
                        {lesson.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson Details Popup Modal */}
      {selectedLesson && (
        <Modal
          isOpen={Boolean(selectedLesson)}
          onClose={() => setSelectedLesson(null)}
          title={selectedLesson.title}
        >
          <div className="space-y-4 text-center py-2">
            <PacoMascot
              size="md"
              mood={completedLessonIds.includes(selectedLesson.id) ? 'cheering' : 'happy'}
            />

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#58CC02] block">
                {selectedLesson.subtitle}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed font-semibold">
                {selectedLesson.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs font-bold">
              <div>
                <span className="text-slate-400 block text-[10px]">Vocabulary</span>
                <span className="font-mono text-sm">{selectedLesson.vocabIds.length} words</span>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">XP Reward</span>
                <span className="font-mono text-sm text-[#CE82FF]">+{selectedLesson.xpReward} XP</span>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span
                  className={`text-xs ${
                    completedLessonIds.includes(selectedLesson.id)
                      ? 'text-[#58CC02]'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {completedLessonIds.includes(selectedLesson.id) ? 'Completed' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleStartLesson(selectedLesson.id)}
                className="w-full py-3.5 px-4 rounded-2xl btn-duo-green flex items-center justify-center gap-2 text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {completedLessonIds.includes(selectedLesson.id)
                    ? 'PRACTICE AGAIN (+10 XP)'
                    : `START LESSON (+${selectedLesson.xpReward} XP)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                className="w-full py-2.5 rounded-xl btn-duo-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
