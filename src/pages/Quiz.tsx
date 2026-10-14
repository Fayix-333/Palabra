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

  // 1. Generate questions
  useEffect(() => {
    let pool = [...VOCABULARY_DATABASE];

    if (mode === 'mistake_revision') {
      // Pick words with needsRevision or high incorrect count
      pool = pool.filter((v) => wordProgress[v.id]?.needsRevision || (wordProgress[v.id]?.timesIncorrect || 0) > 0);
      if (pool.length === 0) {
        // Fallback to least practiced words if no mistakes recorded yet
        pool = [...VOCABULARY_DATABASE];
      }
    } else {
      if (categoryParam !== 'all') {
        pool = pool.filter((v) => v.category === categoryParam);
      }
      if (difficultyParam !== 'all') {
        pool = pool.filter((v) => v.difficulty === difficultyParam);
      }
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selectedPool = pool.slice(0, Math.min(countParam, pool.length));

    // Construct questions
    const generated: QuizQuestion[] = selectedPool.map((vocab, index) => {
      const isMultipleChoice = mode === 'multiple_choice';

      let options: string[] = [];
      if (isMultipleChoice) {
        // Collect 3 distractors
        const otherWords = VOCABULARY_DATABASE.filter((v) => v.id !== vocab.id);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map((v) => v.spanish);
        options = [vocab.spanish, ...distractors].sort(() => 0.5 - Math.random());
      }

      return {
        id: `q-${index}-${vocab.id}`,
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
    setIsAnswerSubmitted(false);
    setFeedbackResult(null);
    setFinalResult(null);
    questionStartTimeRef.current = Date.now();
    quizStartTimeRef.current = Date.now();
    setTimeLeft(speedLimitSeconds);
  }, [mode, categoryParam, countParam, difficultyParam, speedLimitSeconds, wordProgress]);

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

  // ACTIVE QUIZ INTERFACE
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top progress and timer header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <Link to="/practice" className="hover:underline">
            Exit Quiz
          </Link>
          <span>/</span>
          <span className="capitalize">{mode.replace('_', ' ')}</span>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'speed_round' && (
            <div
              className={`flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${
                timeLeft <= 3
                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}

          <span className="font-mono font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={((currentIndex + 1) / questions.length) * 100}
        size="sm"
        showPercentage={false}
        colorClassName="bg-rose-600 dark:bg-rose-500"
      />

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
        {/* Category & hints */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {currentQ.vocab.category}
            </span>
            <span>·</span>
            <span className="capitalize">{currentQ.vocab.difficulty}</span>
            {strictAccents && (
              <>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400">Strict accents</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => soundManager.speakSpanish(currentQ.vocab.spanish, settings.speechRate)}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
            title="Audio hint"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* English Prompt */}
        <div className="text-center py-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Translate English word to Spanish
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            {currentQ.vocab.english}
          </h2>
          {currentQ.vocab.gender && (
            <span className="text-xs text-slate-400 font-mono">
              Gender hint: {currentQ.vocab.gender}
            </span>
          )}
        </div>

        {/* INPUT AREA */}
        {currentQ.questionType === 'multiple_choice' ? (
          /* Multiple Choice Options */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options?.map((opt) => {
              const isSelected = selectedMcOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedMcOption(opt)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                </button>
              );
            })}
          </div>
        ) : (
          /* Typed Translation Input */
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <input
                ref={inputRef}
                type="text"
                disabled={isAnswerSubmitted}
                value={userTypedInput}
                onChange={(e) => setUserTypedInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type Spanish translation..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="w-full text-lg sm:text-xl font-medium px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-80"
              />
            </div>

            {/* Virtual Spanish Accents Bar */}
            {!isAnswerSubmitted && (
              <AccentKeyboard onInsertChar={handleInsertChar} />
            )}
          </div>
        )}

        {/* FEEDBACK BANNER (POST-SUBMIT) */}
        {isAnswerSubmitted && feedbackResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-1 animate-in fade-in duration-150 ${
              feedbackResult.isCorrect
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-1.5">
                {feedbackResult.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                {feedbackResult.message}
              </span>
              <button
                type="button"
                onClick={() =>
                  soundManager.speakSpanish(currentQ.vocab.spanish, settings.speechRate)
                }
                className="p-1 rounded hover:bg-black/5 flex items-center gap-1"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </button>
            </div>

            {!feedbackResult.isCorrect && (
              <p className="pt-1">
                Accepted: <strong className="font-mono">{currentQ.vocab.spanish}</strong>
                {currentQ.vocab.alternatives.length > 0 && (
                  <span className="opacity-80 ml-1">
                    (or {currentQ.vocab.alternatives.join(', ')})
                  </span>
                )}
              </p>
            )}

            {currentQ.vocab.examplePhrase && (
              <p className="opacity-80 italic pt-0.5">
                "{currentQ.vocab.examplePhrase}"
              </p>
            )}
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="pt-2">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              onClick={() => handleSubmitAnswer()}
              disabled={
                currentQ.questionType === 'multiple_choice'
                  ? !selectedMcOption
                  : !userTypedInput.trim()
              }
              className="w-full py-3.5 rounded-2xl btn-duo-green disabled:opacity-40 disabled:cursor-not-allowed text-sm font-black flex items-center justify-center gap-2"
            >
              <span>CHECK ANSWER (ENTER)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              autoFocus
              className="w-full py-3.5 rounded-2xl btn-duo-green text-sm font-black flex items-center justify-center gap-2"
            >
              <span>
                {currentIndex < questions.length - 1 ? 'CONTINUE (ENTER)' : 'VIEW QUIZ RESULTS'}
              </span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
