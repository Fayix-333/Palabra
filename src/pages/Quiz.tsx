import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Volume2,
  ChevronRight,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOCABULARY_DATABASE } from '../data/vocabulary';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';
import { evaluateAnswer } from '../utils/answerChecker';
import { AccentKeyboard } from '../components/common/AccentKeyboard';
import { ProgressBar } from '../components/common/ProgressBar';
import { ConfettiCelebration } from '../components/common/ConfettiCelebration';
import { PacoMascot } from '../components/common/PacoMascot';
import {
  CategoryId,
  DifficultyLevel,
  QuizMode,
  QuizQuestion,
  QuizResult,
  VocabularyItem,
} from '../types';

export const Quiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings, recordWordAttempt, recordQuizCompletion, awardXp, wordProgress } = useApp();

  const mode = (searchParams.get('mode') as QuizMode) || 'type_translation';
  const categoryParam = searchParams.get('category') || 'all';
  const countParam = parseInt(searchParams.get('count') || '20', 10);
  const difficultyParam = (searchParams.get('difficulty') as DifficultyLevel | 'all') || 'all';
  const strictAccents = searchParams.get('strict') !== 'false';
  const speedLimitSeconds = parseInt(searchParams.get('speedLimit') || '10', 10);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTypedInput, setUserTypedInput] = useState('');
  const [selectedMcOption, setSelectedMcOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{
    isCorrect: boolean;
    missingAccent: boolean;
    message: string;
  } | null>(null);

  // Speed round countdown
  const [timeLeft, setTimeLeft] = useState<number>(speedLimitSeconds);

  // Timing
  const questionStartTimeRef = useRef<number>(Date.now());
  const quizStartTimeRef = useRef<number>(Date.now());
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Store wordProgress in a ref to avoid re-generating questions mid-quiz when answers are recorded
  const wordProgressRef = useRef(wordProgress);
  useEffect(() => {
    wordProgressRef.current = wordProgress;
  }, [wordProgress]);

  const [hadNoMistakesInitially, setHadNoMistakesInitially] = useState(false);

  // 1. Generate questions
  useEffect(() => {
    let pool = [...VOCABULARY_DATABASE];
    const currentWp = wordProgressRef.current;
    const includeIdsParam = searchParams.get('includeIds');

    if (includeIdsParam) {
      const ids = includeIdsParam.split(',').filter(Boolean);
      if (ids.length > 0) {
        pool = VOCABULARY_DATABASE.filter((v) => ids.includes(v.id));
      }
    } else if (mode === 'mistake_revision') {
      // Pick words with needsRevision or high incorrect count
      const mistakeWords = pool.filter(
        (v) => currentWp[v.id]?.needsRevision || (currentWp[v.id]?.timesIncorrect || 0) > 0
      );
      if (mistakeWords.length === 0) {
        setHadNoMistakesInitially(true);
        pool = [...VOCABULARY_DATABASE];
      } else {
        setHadNoMistakesInitially(false);
        if (categoryParam !== 'all') {
          const catMistakes = mistakeWords.filter((v) =>
            categoryParam.startsWith('numbers') ? v.category === 'numbers' : v.category === categoryParam
          );
          pool = catMistakes.length > 0 ? catMistakes : mistakeWords;
        } else {
          pool = mistakeWords;
        }
      }
    } else {
      const categoriesParam = searchParams.get('categories');
      if (categoriesParam) {
        const catList = categoriesParam.split(',').filter(Boolean);
        if (catList.length > 0 && !catList.includes('all')) {
          pool = pool.filter((v) => {
            return catList.some((cat) => {
              if (cat === 'numbers_0_20') {
                return (
                  v.category === 'numbers' &&
                  ['num-0', 'num-1', 'num-2', 'num-3', 'num-4', 'num-5', 'num-6', 'num-7', 'num-8', 'num-9',
                   'num-10', 'num-11', 'num-12', 'num-13', 'num-14', 'num-15', 'num-16', 'num-17', 'num-18', 'num-19', 'num-20'].includes(v.id)
                );
              }
              if (cat === 'numbers_21_100') {
                return (
                  v.category === 'numbers' &&
                  /^num-(2[1-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|100)$/.test(v.id)
                );
              }
              if (cat === 'numbers_hundreds') {
                return (
                  v.category === 'numbers' &&
                  ['num-101', 'num-200', 'num-300', 'num-400', 'num-500', 'num-600', 'num-700', 'num-800',
                   'num-900', 'num-1000', 'num-2000', 'num-10000', 'num-100000', 'num-1000000', 'num-2000000'].includes(v.id)
                );
              }
              if (cat === 'numbers_accents') {
                return v.category === 'numbers' && (v.hasAccents || /[áéíóúñÁÉÍÓÚÑ]/.test(v.spanish));
              }
              return v.category === cat;
            });
          });
        }
      } else if (categoryParam === 'numbers_0_20') {
        pool = pool.filter(
          (v) =>
            v.category === 'numbers' &&
            ['num-0', 'num-1', 'num-2', 'num-3', 'num-4', 'num-5', 'num-6', 'num-7', 'num-8', 'num-9',
             'num-10', 'num-11', 'num-12', 'num-13', 'num-14', 'num-15', 'num-16', 'num-17', 'num-18', 'num-19', 'num-20'].includes(v.id)
        );
      } else if (categoryParam === 'numbers_21_100') {
        pool = pool.filter(
          (v) =>
            v.category === 'numbers' &&
            /^num-(2[1-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|100)$/.test(v.id)
        );
      } else if (categoryParam === 'numbers_hundreds') {
        pool = pool.filter(
          (v) =>
            v.category === 'numbers' &&
            ['num-101', 'num-200', 'num-300', 'num-400', 'num-500', 'num-600', 'num-700', 'num-800',
             'num-900', 'num-1000', 'num-2000', 'num-10000', 'num-100000', 'num-1000000', 'num-2000000'].includes(v.id)
        );
      } else if (categoryParam === 'numbers_accents') {
        pool = pool.filter(
          (v) => v.category === 'numbers' && (v.hasAccents || /[áéíóúñÁÉÍÓÚÑ]/.test(v.spanish))
        );
      } else if (categoryParam !== 'all') {
        const targetCategory = categoryParam.startsWith('numbers') ? 'numbers' : categoryParam;
        pool = pool.filter((v) => v.category === targetCategory);
      }

      // Difficulty filtering
      if (difficultyParam !== 'all') {
        const diffFiltered = pool.filter((v) => v.difficulty === difficultyParam);
        if (diffFiltered.length > 0) {
          pool = diffFiltered;
        }
      }

      // Mode accent filtering for spelling/accent master
      if (mode === 'spelling_challenge') {
        const accentFiltered = pool.filter((v) => /[áéíóúñÁÉÍÓÚÑ]/.test(v.spanish));
        if (accentFiltered.length > 0) {
          pool = accentFiltered;
        }
      }
    }

    // Fallback if pool is empty
    if (pool.length === 0) {
      pool = [...VOCABULARY_DATABASE];
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Guarantee that we ALWAYS deliver exactly the question count requested (e.g. 50 questions)
    let selectedPool: VocabularyItem[] = [];
    if (pool.length >= countParam) {
      selectedPool = pool.slice(0, countParam);
    } else {
      // When pool has fewer items than requested (e.g. 4 items, but user asked for 50 questions):
      selectedPool = [...pool];

      // 1. If NOT in wanted words mode, backfill from the broader selected categories
      if (!includeIdsParam) {
        const categoriesParam = searchParams.get('categories');
        const allowedCats = categoriesParam
          ? categoriesParam.split(',').filter(Boolean)
          : categoryParam !== 'all'
          ? [categoryParam.startsWith('numbers') ? 'numbers' : categoryParam]
          : [];

        if (allowedCats.length > 0 && !allowedCats.includes('all')) {
          const remainingInCats = VOCABULARY_DATABASE.filter(
            (v) => allowedCats.includes(v.category) && !selectedPool.some((p) => p.id === v.id)
          ).sort(() => 0.5 - Math.random());
          const needed = countParam - selectedPool.length;
          selectedPool.push(...remainingInCats.slice(0, needed));
        }
      }

      // 2. If still fewer than countParam, cycle through the pool (repeating wanted words or pool words)
      while (selectedPool.length < countParam && pool.length > 0) {
        const shuffledCopy = [...pool].sort(() => 0.5 - Math.random());
        const needed = countParam - selectedPool.length;
        selectedPool.push(...shuffledCopy.slice(0, needed));
      }
    }

    // Construct questions based on mode
    const qTypeParam = searchParams.get('qType');
    const generated: QuizQuestion[] = selectedPool.map((vocab, index) => {
      let isMultipleChoice = mode === 'multiple_choice';

      if (qTypeParam === 'mc') {
        isMultipleChoice = true;
      } else if (qTypeParam === 'typed') {
        isMultipleChoice = false;
      } else if (mode === 'mixed_quiz') {
        // Alternate between multiple choice and typed
        isMultipleChoice = index % 2 === 0;
      } else if (mode === 'speed_round') {
        // Rapid fire: 70% multiple choice for speed, 30% typed
        isMultipleChoice = index % 3 !== 2;
      } else if (mode === 'category_quiz' && !qTypeParam) {
        // Default category quiz to mixed for fun engagement
        isMultipleChoice = index % 2 === 0;
      }

      let options: string[] = [];
      if (isMultipleChoice) {
        // Collect 3 distractors from same category or pool
        const otherWords = pool.filter((v) => v.id !== vocab.id);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        let distractors = shuffledOthers.slice(0, 3).map((v) => v.spanish);

        // If not enough distractors in pool, grab from full database
        if (distractors.length < 3) {
          const fallbackOthers = VOCABULARY_DATABASE.filter(
            (v) => v.id !== vocab.id && !distractors.includes(v.spanish)
          ).sort(() => 0.5 - Math.random());
          const extra = fallbackOthers.slice(0, 3 - distractors.length).map((v) => v.spanish);
          distractors = [...distractors, ...extra];
        }

        options = [vocab.spanish, ...distractors].sort(() => 0.5 - Math.random());
      }

      return {
        id: `q-${index}-${vocab.id}-${Math.random().toString(36).slice(2, 7)}`,
        vocab,
        direction: 'en_to_es',
        questionType: isMultipleChoice ? 'multiple_choice' : 'text_input',
        options,
        correctAnswer: vocab.spanish,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setUserTypedInput('');
    setSelectedMcOption(null);
    setIsAnswerSubmitted(false);
    setFeedbackResult(null);
    setFinalResult(null);
    questionStartTimeRef.current = Date.now();
    quizStartTimeRef.current = Date.now();
    setTimeLeft(speedLimitSeconds);
  }, [mode, categoryParam, countParam, difficultyParam, speedLimitSeconds, searchParams]);

  const currentQ = questions[currentIndex];

  // Auto-focus input on new question
  useEffect(() => {
    if (!isAnswerSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswerSubmitted]);

  // Speed round timer effect
  useEffect(() => {
    if (mode !== 'speed_round' || isAnswerSubmitted || finalResult) return;

    setTimeLeft(speedLimitSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit on zero
          handleSubmitAnswer(userTypedInput || '');
          return 0;
        }
        if (settings.soundEffects && prev <= 4) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isAnswerSubmitted, finalResult, mode, speedLimitSeconds, settings.soundEffects]);

  const handleInsertChar = (char: string) => {
    setUserTypedInput((prev) => prev + char);
    inputRef.current?.focus();
  };

  const handleSubmitAnswer = (answerOverride?: string) => {
    if (!currentQ || isAnswerSubmitted) return;

    const answer =
      typeof answerOverride === 'string'
        ? answerOverride
        : currentQ.questionType === 'multiple_choice'
        ? selectedMcOption || ''
        : userTypedInput;

    const timeSpent = Date.now() - questionStartTimeRef.current;
    const evalRes = evaluateAnswer(answer, currentQ.vocab, strictAccents);

    // Play feedback sound
    if (settings.soundEffects) {
      if (evalRes.isCorrect) soundManager.playCorrect();
      else soundManager.playIncorrect();
    }

    // Record word attempt in context
    recordWordAttempt(currentQ.vocab.id, evalRes.isCorrect, evalRes.isStrictCorrect);

    // Save question answer
    setQuestions((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        userAnswer: answer,
        isCorrect: evalRes.isCorrect,
        timeSpentMs: timeSpent,
        answeredAt: Date.now(),
      };
      return copy;
    });

    setIsAnswerSubmitted(true);
    setFeedbackResult({
      isCorrect: evalRes.isCorrect,
      missingAccent: evalRes.missingAccent,
      message: evalRes.feedback || (evalRes.isCorrect ? 'Correct!' : 'Incorrect.'),
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserTypedInput('');
      setSelectedMcOption(null);
      setIsAnswerSubmitted(false);
      setFeedbackResult(null);
      questionStartTimeRef.current = Date.now();
      setTimeLeft(speedLimitSeconds);
    } else {
      // Quiz finished - compile final results
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const totalTimeSec = Math.round((Date.now() - quizStartTimeRef.current) / 1000);
    const correctCount = questions.filter((q) => q.isCorrect).length;
    const incorrectCount = questions.length - correctCount;
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const totalTimeMs = questions.reduce((acc, q) => acc + (q.timeSpentMs || 0), 0);
    const avgResponseTimeMs =
      questions.length > 0 ? Math.round(totalTimeMs / questions.length) : 0;

    // XP calculation: 10 XP per correct + 30 XP completion bonus
    const xpEarned = correctCount * 10 + 30;

    const result: QuizResult = {
      id: `quiz-${Date.now()}`,
      timestamp: Date.now(),
      mode,
      category: categoryParam,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      accuracy,
      timeTakenSeconds: totalTimeSec,
      averageResponseTimeMs: avgResponseTimeMs,
      xpEarned,
      questions,
    };

    setFinalResult(result);
    recordQuizCompletion(result);

    if (accuracy >= 80) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  };

  const handleRetryMistakes = () => {
    if (!finalResult) return;
    const wrongVocabIds = finalResult.questions
      .filter((q) => !q.isCorrect)
      .map((q) => q.vocab.id);

    if (wrongVocabIds.length === 0) return;

    // Filter questions by mistakes
    const retryQuestions: QuizQuestion[] = wrongVocabIds.map((id, index) => {
      const vocab = VOCABULARY_DATABASE.find((v) => v.id === id)!;
      return {
        id: `retry-${index}-${vocab.id}`,
        vocab,
        direction: 'en_to_es',
        questionType: 'text_input',
        correctAnswer: vocab.spanish,
      };
    });

    setQuestions(retryQuestions);
    setCurrentIndex(0);
    setUserTypedInput('');
    setIsAnswerSubmitted(false);
    setFeedbackResult(null);
    setFinalResult(null);
    questionStartTimeRef.current = Date.now();
    quizStartTimeRef.current = Date.now();
  };

  // Keyboard shortcut for enter to submit/next
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isAnswerSubmitted) {
        handleSubmitAnswer();
      } else {
        handleNextQuestion();
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No vocabulary available for this selection
        </h3>
        <p className="text-xs text-slate-500">
          Please adjust your category or difficulty filters.
        </p>
        <Link
          to="/practice"
          className="inline-flex px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
        >
          Return to Practice Hub
        </Link>
      </div>
    );
  }

  // RESULTS VIEW
  if (finalResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
        <ConfettiCelebration
          active={true}
          type={finalResult.accuracy >= 85 ? 'unit' : 'lesson'}
        />
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Quiz Completed!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {finalResult.mode.replace('_', ' ')} • {finalResult.category} category
            </p>
          </div>

          {/* Big Score Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto py-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Score</span>
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {finalResult.correctAnswers} / {finalResult.totalQuestions}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Accuracy</span>
              <span
                className={`text-2xl font-bold font-display ${
                  finalResult.accuracy >= 80 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {finalResult.accuracy}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Time Taken</span>
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white font-mono">
                {Math.floor(finalResult.timeTakenSeconds / 60)}:
                {(finalResult.timeTakenSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">XP Earned</span>
              <span className="text-2xl font-bold font-display text-purple-600 font-mono">
                +{finalResult.xpEarned}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {finalResult.incorrectAnswers > 0 && (
              <button
                type="button"
                onClick={handleRetryMistakes}
                className="px-5 py-3 rounded-2xl btn-duo-red text-xs font-black flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Retry {finalResult.incorrectAnswers} Mistakes
              </button>
            )}

            <Link
              to="/practice"
              className="px-5 py-3 rounded-2xl btn-duo-green text-xs font-black flex items-center gap-1.5"
            >
              Take Another Quiz
            </Link>

            <Link
              to="/"
              className="px-5 py-3 rounded-2xl btn-duo-white text-xs font-black flex items-center gap-1.5"
            >
              Continue Learning
            </Link>
          </div>
        </div>

        {/* Question Review Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Question-by-Question Review
            </h2>
            <span className="text-xs text-slate-500">
              {finalResult.correctAnswers} correct, {finalResult.incorrectAnswers} incorrect
            </span>
          </div>

          <div className="space-y-3">
            {finalResult.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  q.isCorrect
                    ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">0{idx + 1}.</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {q.vocab.english}
                      </span>
                      <span className="text-[10px] text-slate-400">({q.vocab.category})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-300">
                      <span>
                        Your answer:{' '}
                        <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-400'}`}>
                          {q.userAnswer || '(blank)'}
                        </span>
                      </span>
                      {!q.isCorrect && (
                        <span>
                          Expected:{' '}
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {q.vocab.spanish}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {q.timeSpentMs && (
                    <span className="font-mono text-[11px] text-slate-400">
                      {(q.timeSpentMs / 1000).toFixed(1)}s
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => soundManager.speakSpanish(q.vocab.spanish, settings.speechRate)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Pronounce"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ INTERFACE (DUOLINGO STYLE)
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28 pt-2 select-none">
      {/* Top progress and timer header */}
      <div className="flex items-center gap-4">
        {/* Exit Button */}
        <Link
          to="/practice"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl transition-colors"
          title="Exit Quiz"
        >
          <XCircle className="w-6 h-6 stroke-[2.2]" />
        </Link>

        {/* Duolingo Progress Bar */}
        <div className="flex-1">
          <ProgressBar
            value={((currentIndex + 1) / questions.length) * 100}
            size="md"
            showPercentage={false}
            colorClassName="bg-[#58CC02]"
          />
        </div>

        {/* Speed Round Timer or Counter */}
        {mode === 'speed_round' ? (
          <div
            className={`flex items-center gap-1.5 font-mono font-black px-3 py-1 rounded-2xl border-2 transition-all ${
              timeLeft <= 3
                ? 'bg-[#FFEBEB] text-[#FF4B4B] border-[#FF4B4B] animate-pulse ring-2 ring-red-400/30'
                : 'bg-[#FFF5E5] text-[#FF9600] border-[#FFD280]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">{timeLeft}s</span>
          </div>
        ) : (
          <span className="font-mono font-black text-xs text-slate-400">
            {currentIndex + 1}/{questions.length}
          </span>
        )}
      </div>

      {/* Main Question Card */}
      <div className="space-y-6 pt-2">
        {/* Category & Pronounce Audio Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {currentQ.vocab.category}
            </span>
            {searchParams.get('includeIds') && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#CE82FF] flex items-center gap-1">
                🎯 Wanted Words Drill
              </span>
            )}
            {searchParams.get('categories') && !searchParams.get('categories')?.includes('all') && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-[#1CB0F6]">
                Multi-Category
              </span>
            )}
            {mode === 'mistake_revision' && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#FF4B4B] flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Mistakes Drill
              </span>
            )}
            {strictAccents && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-[#FF9600]">
                Strict Accents
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => soundManager.speakSpanish(currentQ.vocab.spanish, settings.speechRate)}
            className="w-10 h-10 rounded-2xl bg-[#1CB0F6] hover:bg-[#1899D6] text-white flex items-center justify-center shadow-button active:translate-y-0.5 transition-all"
            title="Hear Spanish pronunciation"
          >
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mascot & Speech Prompt */}
        <div className="flex items-end gap-3 pt-2">
          <PacoMascot size="md" mood={feedbackResult ? (feedbackResult.isCorrect ? 'happy' : 'thinking') : 'encouraging'} />
          
          <div className="p-4 rounded-3xl rounded-bl-sm border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs relative max-w-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {currentQ.questionType === 'multiple_choice' ? 'Select the correct translation' : 'Type in Spanish'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentQ.vocab.english}
            </h2>
          </div>
        </div>

        {/* INPUT AREA */}
        {currentQ.questionType === 'multiple_choice' ? (
          /* Multiple Choice Options */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {currentQ.options?.map((opt, optIndex) => {
              const isSelected = selectedMcOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedMcOption(opt)}
                  className={`p-4 rounded-2xl border-2 border-b-4 text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/60 text-[#1CB0F6] shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border ${
                        isSelected
                          ? 'border-[#1CB0F6] bg-[#1CB0F6] text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {optIndex + 1}
                    </span>
                    <span className="text-base font-black">{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1CB0F6] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        ) : (
          /* Typed Translation Input */
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <input
                ref={inputRef}
                type="text"
                disabled={isAnswerSubmitted}
                value={userTypedInput}
                onChange={(e) => setUserTypedInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe en español..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="w-full text-lg sm:text-2xl font-black px-5 py-4 rounded-2xl border-2 border-b-4 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#58CC02] disabled:opacity-90 transition-colors"
              />
            </div>

            {/* Virtual Spanish Accents Bar */}
            {!isAnswerSubmitted && (
              <AccentKeyboard onInsertChar={handleInsertChar} />
            )}
          </div>
        )}
      </div>

      {/* DUOLINGO STYLE BOTTOM SHEET / ACTION BAR */}
      <div
        className={`fixed bottom-0 left-0 right-0 border-t-2 z-50 p-4 sm:p-5 transition-colors ${
          !isAnswerSubmitted
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : feedbackResult?.isCorrect
            ? 'bg-[#D7FFB8] dark:bg-emerald-950 border-[#A5ED6E] dark:border-emerald-800'
            : 'bg-[#FFEBEB] dark:bg-rose-950 border-[#FFB8B8] dark:border-rose-900'
        }`}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Feedback details */}
          {isAnswerSubmitted && feedbackResult && (
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  feedbackResult.isCorrect
                    ? 'bg-[#58CC02] text-white shadow-xs'
                    : 'bg-[#FF4B4B] text-white shadow-xs'
                }`}
              >
                {feedbackResult.isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                ) : (
                  <XCircle className="w-7 h-7 stroke-[2.5]" />
                )}
              </div>

              <div>
                <h4
                  className={`text-lg sm:text-xl font-black leading-tight ${
                    feedbackResult.isCorrect
                      ? 'text-[#58CC02] dark:text-emerald-400'
                      : 'text-[#FF4B4B] dark:text-rose-400'
                  }`}
                >
                  {feedbackResult.isCorrect
                    ? feedbackResult.message || '¡Excelente!'
                    : 'Correct solution:'}
                </h4>

                {!feedbackResult.isCorrect && (
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                    {currentQ.vocab.spanish}
                    {currentQ.vocab.alternatives.length > 0 && (
                      <span className="text-xs font-semibold text-slate-500 ml-1.5">
                        (or {currentQ.vocab.alternatives.join(', ')})
                      </span>
                    )}
                  </p>
                )}

                {feedbackResult.missingAccent && (
                  <p className="text-xs font-bold text-[#FF9600] mt-0.5">
                    Watch the accent mark: {currentQ.vocab.spanish}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isAnswerSubmitted && (
            <div className="hidden sm:block text-xs font-bold text-slate-400">
              Press Enter to check
            </div>
          )}

          {/* Action button */}
          <div className="sm:w-48 shrink-0">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={() => handleSubmitAnswer()}
                disabled={
                  currentQ.questionType === 'multiple_choice'
                    ? !selectedMcOption
                    : !userTypedInput.trim()
                }
                className="w-full py-3.5 rounded-2xl btn-duo-green disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-button"
              >
                <span>CHECK</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                autoFocus
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-button ${
                  feedbackResult?.isCorrect ? 'btn-duo-green' : 'btn-duo-red'
                }`}
              >
                <span>{currentIndex < questions.length - 1 ? 'CONTINUE' : 'FINISH'}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
