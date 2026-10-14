import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Timer,
  Flag,
  AlertTriangle,
  Play,
  Pause,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOCABULARY_DATABASE } from '../data/vocabulary';
import { useApp } from '../context/AppContext';
import { LocalStorageManager } from '../utils/storage';
import { soundManager } from '../utils/sound';
import { evaluateAnswer } from '../utils/answerChecker';
import { AccentKeyboard } from '../components/common/AccentKeyboard';
import { Modal } from '../components/common/Modal';
import { MockTestSession, QuizQuestion, QuizResult } from '../types';

export const MockTest: React.FC = () => {
  const navigate = useNavigate();
  const { settings, recordWordAttempt, recordMockCompletion, awardXp } = useApp();

  // Active session state
  const [session, setSession] = useState<MockTestSession | null>(() =>
    LocalStorageManager.getActiveMockSession()
  );

  // Setup options (if no active session)
  const [testMode, setTestMode] = useState<'strict' | 'practice'>('strict');
  const [testQuestionCount, setTestQuestionCount] = useState<number>(50);
  const [testDurationMinutes, setTestDurationMinutes] = useState<number>(60);

  // In-test runtime state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);
  const [showTimeWarningModal, setShowTimeWarningModal] = useState<boolean>(false);
  const warnedFiveMinRef = useRef<boolean>(false);
  const warnedOneMinRef = useRef<boolean>(false);

  // Result state (when test submitted)
  const [testResult, setTestResult] = useState<QuizResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Autosave session whenever session state updates
  useEffect(() => {
    if (session && !session.isCompleted) {
      LocalStorageManager.saveActiveMockSession(session);
    }
  }, [session]);

  // Main countdown timer
  useEffect(() => {
    if (!session || session.isCompleted || (testMode === 'practice' && isPaused)) {
      return;
    }

    const timer = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.isCompleted) return prev;

        const nextTime = prev.timeRemainingSeconds - 1;

        // Warnings
        if (nextTime === 300 && !warnedFiveMinRef.current) {
          warnedFiveMinRef.current = true;
          setShowTimeWarningModal(true);
          if (settings.soundEffects) soundManager.playTick();
        } else if (nextTime === 60 && !warnedOneMinRef.current) {
          warnedOneMinRef.current = true;
          setShowTimeWarningModal(true);
          if (settings.soundEffects) soundManager.playTick();
        }

        // Automatic submission at 00:00
        if (nextTime <= 0) {
          clearInterval(timer);
          handleFinishTest(prev);
          return {
            ...prev,
            timeRemainingSeconds: 0,
            isCompleted: true,
          };
        }

        return {
          ...prev,
          timeRemainingSeconds: nextTime,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.isCompleted, isPaused, testMode, settings.soundEffects]);

  const handleStartTest = () => {
    // Generate pool of questions sampled from all 7 categories
    const pool = [...VOCABULARY_DATABASE].sort(() => 0.5 - Math.random());
    const selected = pool.slice(0, Math.min(testQuestionCount, pool.length));

    const questions: QuizQuestion[] = selected.map((vocab, index) => ({
      id: `mock-q-${index}-${vocab.id}`,
      vocab,
      direction: 'en_to_es',
      questionType: 'text_input',
      correctAnswer: vocab.spanish,
    }));

    const newSession: MockTestSession = {
      id: `mock-${Date.now()}`,
      mode: testMode,
      totalDurationSeconds: testDurationMinutes * 60,
      timeRemainingSeconds: testDurationMinutes * 60,
      isCompleted: false,
      startedAt: Date.now(),
      questions,
      currentIndex: 0,
      flaggedQuestionIds: [],
      answers: {},
    };

    warnedFiveMinRef.current = false;
    warnedOneMinRef.current = false;
    setTestResult(null);
    setSession(newSession);
    LocalStorageManager.saveActiveMockSession(newSession);
  };

  const handleFinishTest = useCallback(
    (currentSession: MockTestSession) => {
      const timeTakenSec =
        currentSession.totalDurationSeconds - currentSession.timeRemainingSeconds;

      let correctCount = 0;
      const evaluatedQuestions: QuizQuestion[] = currentSession.questions.map((q) => {
        const studentAns = currentSession.answers[q.id] || '';
        const evalRes = evaluateAnswer(studentAns, q.vocab, true); // Strict accents in mock competition
        if (evalRes.isCorrect) correctCount++;

        // Record attempt in progress
        recordWordAttempt(q.vocab.id, evalRes.isCorrect, evalRes.isStrictCorrect);

        return {
          ...q,
          userAnswer: studentAns,
          isCorrect: evalRes.isCorrect,
          answeredAt: Date.now(),
        };
      });

      const incorrectCount = currentSession.questions.length - correctCount;
      const accuracy =
        currentSession.questions.length > 0
          ? Math.round((correctCount / currentSession.questions.length) * 100)
          : 0;

      const xpEarned = correctCount * 10 + 50; // 50 XP completion bonus for mock

      const result: QuizResult = {
        id: `mock-res-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'category_quiz',
        category: 'All Syllabus (Sibaq Simulation)',
        totalQuestions: currentSession.questions.length,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        accuracy,
        timeTakenSeconds: timeTakenSec,
        averageResponseTimeMs:
          currentSession.questions.length > 0
            ? Math.round((timeTakenSec * 1000) / currentSession.questions.length)
            : 0,
        xpEarned,
        questions: evaluatedQuestions,
      };

      setTestResult(result);
      recordMockCompletion(result);
      LocalStorageManager.saveActiveMockSession(null);

      if (settings.soundEffects) {
        soundManager.playFanfare();
      }
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
    },
    [recordMockCompletion, recordWordAttempt, settings.soundEffects]
  );

  const handleUpdateCurrentAnswer = (text: string) => {
    if (!session || session.isCompleted) return;
    const currentQ = session.questions[session.currentIndex];
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: text,
        },
      };
    });
  };

  const handleToggleFlag = () => {
    if (!session) return;
    const currentQ = session.questions[session.currentIndex];
    setSession((prev) => {
      if (!prev) return null;
      const isFlagged = prev.flaggedQuestionIds.includes(currentQ.id);
      const nextFlags = isFlagged
        ? prev.flaggedQuestionIds.filter((id) => id !== currentQ.id)
        : [...prev.flaggedQuestionIds, currentQ.id];

      return {
        ...prev,
        flaggedQuestionIds: nextFlags,
      };
    });
  };

  const handleJumpToQuestion = (index: number) => {
    if (!session) return;
    setSession((prev) => (prev ? { ...prev, currentIndex: index } : null));
    inputRef.current?.focus();
  };

  const handleNext = () => {
    if (!session) return;
    if (session.currentIndex < session.questions.length - 1) {
      handleJumpToQuestion(session.currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!session) return;
    if (session.currentIndex > 0) {
      handleJumpToQuestion(session.currentIndex - 1);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. SETUP SCREEN (When no active session and no completed result)
  if (!session && !testResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Sibaq Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Sibaq Arena — Official-Style Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Official 60-minute examination simulation for TN.31 PALABRA. Test your accuracy, correct
            spelling, speed, and correction under realistic festival timing.
          </p>
        </div>

        {/* Disclaimer Card */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Preparation Platform Notice</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This mock test is designed to train student speed and vocabulary recall based on the
              official PALABRA handbook syllabus. It simulates the 60-minute duration and translation
              task, but is an independent training tool and not the official festival examination server.
            </p>
          </div>
        </div>

        {/* Test Configuration Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
            Configure Your Mock Competition
          </h2>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Simulation Strictness
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setTestMode('strict')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  testMode === 'strict'
                    ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Strict Competition Mode
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Timer cannot be paused. No feedback during the test. Auto-submits at 00:00.
                </p>
              </div>

              <div
                onClick={() => setTestMode('practice')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  testMode === 'practice'
                    ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Practice Mode
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    Flexible
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allows pause and resume. Review your progress anytime at your own pace.
                </p>
              </div>
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Question Count
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[30, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTestQuestionCount(num)}
                  className={`py-2 px-3 text-xs font-mono font-bold rounded-lg border transition-all ${
                    testQuestionCount === num
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Test Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTestDurationMinutes(mins)}
                  className={`py-2 px-3 text-xs font-mono font-bold rounded-lg border transition-all ${
                    testDurationMinutes === mins
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mins} Minutes {mins === 60 ? '(Official)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleStartTest}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Official 60-Minute Simulation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. RESULTS SCREEN
  if (testResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Simulation Completed!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              TN.31 PALABRA Full Mock Examination Results
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto py-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Final Score</span>
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {testResult.correctAnswers} / {testResult.totalQuestions}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Accuracy</span>
              <span
                className={`text-2xl font-bold font-display ${
                  testResult.accuracy >= 80 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {testResult.accuracy}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Time Used</span>
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white font-mono">
                {Math.floor(testResult.timeTakenSeconds / 60)}:
                {(testResult.timeTakenSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">XP Awarded</span>
              <span className="text-2xl font-bold font-display text-purple-600 font-mono">
                +{testResult.xpEarned}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setTestResult(null);
                setSession(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Take Another Simulation
            </button>
            <Link
              to="/progress"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              View Analytics & Trends
            </Link>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Full Answer Breakdown
            </h2>
            <span className="text-xs text-slate-500">
              {testResult.correctAnswers} correct · {testResult.incorrectAnswers} incorrect
            </span>
          </div>

          <div className="space-y-2.5">
            {testResult.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  q.isCorrect
                    ? 'border-emerald-200/70 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10'
                    : 'border-rose-200/70 bg-rose-50/20 dark:border-rose-900/30 dark:bg-rose-950/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">0{idx + 1}.</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {q.vocab.english}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        ({q.vocab.category})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-slate-600 dark:text-slate-300">
                      <span>
                        Your input:{' '}
                        <strong
                          className={q.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-400'}
                        >
                          {q.userAnswer || '(blank)'}
                        </strong>
                      </span>
                      {!q.isCorrect && (
                        <span>
                          Expected:{' '}
                          <strong className="text-slate-900 dark:text-white font-mono">
                            {q.vocab.spanish}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => soundManager.speakSpanish(q.vocab.spanish, settings.speechRate)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 self-end sm:self-center"
                  title="Audio"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE SIMULATION VIEW
  if (!session) return null;

  const currentQ = session.questions[session.currentIndex];
  const currentAnswer = session.answers[currentQ.id] || '';
  const isFlagged = session.flaggedQuestionIds.includes(currentQ.id);

  const answeredCount = Object.values(session.answers).filter((a) => a.trim().length > 0).length;
  const flaggedCount = session.flaggedQuestionIds.length;
  const unansweredCount = session.questions.length - answeredCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Test Header Bar: Timer & Actions */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              Time Remaining
            </span>
            <span
              className={`text-2xl font-extrabold font-mono tracking-tight ${
                session.timeRemainingSeconds <= 300
                  ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatTimer(session.timeRemainingSeconds)}
            </span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            <strong className="text-emerald-600 font-mono">{answeredCount}</strong> answered
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">
            <strong className="text-amber-500 font-mono">{flaggedCount}</strong> flagged
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">
            <strong className="text-slate-400 font-mono">{unansweredCount}</strong> left
          </span>
        </div>

        {/* Pause (practice mode only) & Submit Button */}
        <div className="flex items-center gap-2">
          {session.mode === 'practice' && (
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              title={isPaused ? 'Resume Test' : 'Pause Test'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-slate-700" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSubmitConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      {/* Main Test Grid: Question on Left, Question Navigation Palette on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Question */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Question {session.currentIndex + 1} of {session.questions.length}
                </span>
                <span>·</span>
                <span className="capitalize">{currentQ.vocab.category}</span>
              </div>

              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Word Prompt */}
            <div className="text-center py-6 space-y-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                English Translation Prompt
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                {currentQ.vocab.english}
              </h2>
              {currentQ.vocab.gender && (
                <span className="text-xs text-slate-400 font-mono">
                  Grammatical Hint: {currentQ.vocab.gender}
                </span>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Spanish Translation:
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleUpdateCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleNext();
                    }
                  }}
                  placeholder="Type exact Spanish spelling with accents..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full text-lg sm:text-xl font-medium px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Virtual Accents Helper */}
              <AccentKeyboard
                onInsertChar={(char) => {
                  handleUpdateCurrentAnswer(currentAnswer + char);
                  inputRef.current?.focus();
                }}
              />
            </div>

            {/* Next / Prev Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={session.currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Word
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={session.currentIndex === session.questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1"
              >
                Next Word
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Question Navigation Palette */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Question Palette (1..{session.questions.length})
            </h3>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
              {session.questions.map((q, idx) => {
                const isCurrent = session.currentIndex === idx;
                const hasAnswer = (session.answers[q.id] || '').trim().length > 0;
                const flagged = session.flaggedQuestionIds.includes(q.id);

                let btnStyle =
                  'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                if (hasAnswer) {
                  btnStyle =
                    'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold';
                }
                if (flagged) {
                  btnStyle =
                    'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold';
                }
                if (isCurrent) {
                  btnStyle += ' ring-2 ring-rose-500 ring-offset-1';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-8 rounded text-xs font-mono transition-all flex items-center justify-center relative ${btnStyle}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                    {flagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Flagged for review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      <Modal
        isOpen={showSubmitConfirmModal}
        onClose={() => setShowSubmitConfirmModal(false)}
        title="Submit Competition Test?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Are you sure you want to finalize your submission?
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-mono font-bold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Unanswered:</span>
              <span className="font-mono font-bold text-rose-600">{unansweredCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Left:</span>
              <span className="font-mono">{formatTimer(session.timeRemainingSeconds)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSubmitConfirmModal(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Resume Test
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSubmitConfirmModal(false);
                handleFinishTest(session);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      </Modal>

      {/* Time Warning Modal */}
      <Modal
        isOpen={showTimeWarningModal}
        onClose={() => setShowTimeWarningModal(false)}
        title="Time Alert!"
      >
        <div className="space-y-3 text-center py-2">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Time is almost up!
          </h4>
          <p className="text-xs text-slate-500">
            You have{' '}
            <strong className="text-rose-600 font-mono">
              {formatTimer(session.timeRemainingSeconds)}
            </strong>{' '}
            remaining. When the clock hits 00:00, your current answers will be automatically submitted.
          </p>
          <button
            type="button"
            onClick={() => setShowTimeWarningModal(false)}
            className="w-full mt-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Got it, continue test
          </button>
        </div>
      </Modal>
    </div>
  );
};
