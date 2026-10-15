import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  Heart,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Infinity as InfinityIcon,
  BookOpen,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LEARNING_UNITS } from '../data/units';
import { VOCABULARY_DATABASE } from '../data/vocabulary';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';
import { evaluateAnswer } from '../utils/answerChecker';
import { PacoMascot } from '../components/common/PacoMascot';
import { AccentKeyboard } from '../components/common/AccentKeyboard';
import {
  ConfettiCelebration,
  fireLessonCompleteConfetti,
  fireUnitTestConfetti,
} from '../components/common/ConfettiCelebration';
import { VocabularyItem } from '../types';

type LessonStepType =
  | 'translate_choice'
  | 'listen_type'
  | 'write_translation'
  | 'word_bank'
  | 'missing_letters';

interface LessonStep {
  id: string;
  type: LessonStepType;
  vocab: VocabularyItem;
  options?: string[];
  wordTiles?: string[];
  maskedWord?: string;
  explanation: string;
  grammarTip?: string;
}

export const LessonRunner: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const {
    settings,
    hearts,
    consumeHeart,
    refillHearts,
    completeLesson,
    recordWordAttempt,
  } = useApp();

  // Find lesson from data
  const lessonData = useMemo(() => {
    for (const unit of LEARNING_UNITS) {
      const found = unit.lessons.find((l) => l.id === lessonId);
      if (found) return found;
    }
    return LEARNING_UNITS[0].lessons[0];
  }, [lessonId]);

  // Generate Duolingo Study System steps:
  // For each concept: FIRST teach/explain ("this is for this"), NEXT ask questions with it!
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User input states
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);
  const [showTipModal, setShowTipModal] = useState(false);

  // Answer submission feedback
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [mistakesMade, setMistakesMade] = useState(0);

  const textInputRef = useRef<HTMLInputElement>(null);

  // Generate steps following Duolingo's authentic study pattern
  useEffect(() => {
    const vocabList: VocabularyItem[] = lessonData.vocabIds
      .map((id) => VOCABULARY_DATABASE.find((v) => v.id === id))
      .filter((v): v is VocabularyItem => Boolean(v));

    const selectedVocab = vocabList.slice(0, 4); // 4 key concepts per bite-sized lesson

    const generatedSteps: LessonStep[] = [];

    selectedVocab.forEach((item, vIdx) => {
      // Duolingo explanation helper
      const grammarTip = item.gender
        ? `In Spanish, '${item.gender === 'masculine' ? 'el' : 'la'}' is used for ${item.gender} nouns. Notice the ending pattern.`
        : item.memoryHint || item.regionalNotes || `Pay attention to the spelling and accents: '${item.spanish}'.`;

      const explanation = `"${item.spanish}" translates to "${item.english}". Practice using it naturally in Spanish conversation.`;

      // Immediate practice questions testing this concept
      // Distractors for choice
      const otherVocabs = VOCABULARY_DATABASE.filter((v) => v.id !== item.id);
      const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random());
      const distractors = shuffledOthers.slice(0, 3).map((v) => v.spanish);
      const options = [item.spanish, ...distractors].sort(() => 0.5 - Math.random());

      // Question 2A: Multiple-choice or Word Bank
      if (vIdx % 2 === 0) {
        generatedSteps.push({
          id: `q-choice-${vIdx}-${item.id}`,
          type: 'translate_choice',
          vocab: item,
          options,
          explanation,
          grammarTip,
        });
      } else {
        const targetWords = item.spanish.split(' ');
        const dummyWords = ['el', 'la', 'un', 'una', 'es', 'de', 'no', 'muy'];
        const extraTiles = dummyWords.filter((w) => !targetWords.includes(w)).slice(0, 3);
        const tiles = [...targetWords, ...extraTiles].sort(() => 0.5 - Math.random());

        generatedSteps.push({
          id: `q-bank-${vIdx}-${item.id}`,
          type: 'word_bank',
          vocab: item,
          wordTiles: tiles,
          explanation,
          grammarTip,
        });
      }

      // Question 2B: Active Production / Writing or Listening
      if (vIdx % 2 === 0) {
        generatedSteps.push({
          id: `q-write-${vIdx}-${item.id}`,
          type: 'write_translation',
          vocab: item,
          explanation,
          grammarTip,
        });
      } else {
        generatedSteps.push({
          id: `q-listen-${vIdx}-${item.id}`,
          type: 'listen_type',
          vocab: item,
          explanation,
          grammarTip,
        });
      }
    });

    setSteps(generatedSteps);
    setCurrentIndex(0);
    resetStepState();
    setIsLessonFinished(false);
    setMistakesMade(0);
  }, [lessonData]);

  const currentStep = steps[currentIndex];

  const resetStepState = () => {
    setSelectedChoice(null);
    setTypedText('');
    setSelectedTiles([]);
    setFeedbackStatus('idle');
    setFeedbackMessage('');
  };

  // Setup state for new step
  useEffect(() => {
    if (!currentStep) return;
    resetStepState();

    if (currentStep.type === 'word_bank' && currentStep.wordTiles) {
      setAvailableTiles([...currentStep.wordTiles]);
    }

    // Auto-play audio during listening challenges
    if (currentStep.type === 'listen_type') {
      try {
        soundManager.speakSpanish(currentStep.vocab.spanish, settings.speechRate);
      } catch {
        // audio context handling
      }
    }

    if (currentStep.type === 'write_translation' || currentStep.type === 'listen_type') {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 150);
    }
  }, [currentIndex, currentStep, settings.speechRate]);

  // Audio trigger
  const playAudio = () => {
    if (currentStep) {
      soundManager.speakSpanish(currentStep.vocab.spanish, settings.speechRate);
    }
  };

  // Word bank tile click
  const handleTileClick = (word: string, index: number) => {
    if (feedbackStatus !== 'idle') return;
    const nextAvailable = [...availableTiles];
    nextAvailable.splice(index, 1);
    setAvailableTiles(nextAvailable);
    setSelectedTiles([...selectedTiles, word]);
  };

  const handleSelectedTileRemove = (word: string, index: number) => {
    if (feedbackStatus !== 'idle') return;
    const nextSelected = [...selectedTiles];
    nextSelected.splice(index, 1);
    setSelectedTiles(nextSelected);
    setAvailableTiles([...availableTiles, word]);
  };

  // Check Answer
  const handleCheckAnswer = () => {
    if (!currentStep || feedbackStatus !== 'idle') return;

    let answer = '';
    if (currentStep.type === 'translate_choice') {
      answer = selectedChoice || '';
    } else if (currentStep.type === 'word_bank') {
      answer = selectedTiles.join(' ');
    } else {
      answer = typedText;
    }

    const evalResult = evaluateAnswer(answer, currentStep.vocab, settings.strictAccents);

    recordWordAttempt(currentStep.vocab.id, evalResult.isCorrect, evalResult.isStrictCorrect);

    if (evalResult.isCorrect) {
      setFeedbackStatus('correct');
      const messages = ['¡Excelente!', '¡Muy bien!', 'Perfect! You mastered it!', '¡Increíble!'];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setFeedbackMessage(randomMsg);
      if (settings.soundEffects) soundManager.playCorrect();
    } else {
      setFeedbackStatus('incorrect');
      setMistakesMade((prev) => prev + 1);
      consumeHeart();
      if (settings.soundEffects) soundManager.playIncorrect();
    }
  };

  // Continue to next step or complete lesson
  const handleContinue = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Lesson complete!
      const isUnitTest = lessonData.type === 'checkpoint' || lessonData.type === 'test';
      const isPerfect = mistakesMade === 0;
      const totalXp = lessonData.xpReward + (isPerfect ? 20 : 0);
      completeLesson(lessonData.id, totalXp);
      setIsLessonFinished(true);

      if (settings.soundEffects) {
        soundManager.playFanfare();
      }

      try {
        if (isUnitTest) {
          fireUnitTestConfetti();
        } else {
          fireLessonCompleteConfetti();
        }
      } catch {
        // ignore
      }
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (feedbackStatus === 'idle') {
        handleCheckAnswer();
      } else {
        handleContinue();
      }
    }
  };

  if (!currentStep && !isLessonFinished) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <PacoMascot size="lg" mood="thinking" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
          Preparing your Duolingo study lesson...
        </h3>
      </div>
    );
  }

  // VICTORY SUMMARY SCREEN (iOS 27 Liquid Glass style)
  if (isLessonFinished) {
    const isUnitTest = lessonData.type === 'checkpoint' || lessonData.type === 'test';
    const isPerfect = mistakesMade === 0;
    const earnedXp = lessonData.xpReward + (isPerfect ? 20 : 0);

    return (
      <div className="max-w-lg mx-auto text-center py-12 px-4 space-y-6 animate-fade-in relative z-10">
        <ConfettiCelebration active={true} type={isUnitTest ? 'unit' : 'lesson'} />
        
        {/* iOS 27 Liquid Glass Card */}
        <div className="ios27-glass-card p-8 text-center space-y-6 shadow-2xl">
          <PacoMascot size="xl" mood="champion" />

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {isUnitTest ? 'Checkpoint Mastered' : 'Lesson Completed!'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isPerfect ? '¡Lección Perfecta!' : '¡Buen Trabajo!'}
            </h2>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              You studied the new concepts and nailed the questions!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">XP EARNED</span>
              <p className="text-2xl font-black text-[#58CC02]">+{earnedXp}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">ACCURACY</span>
              <p className="text-2xl font-black text-[#1CB0F6]">
                {Math.max(70, Math.round(((steps.length - mistakesMade) / steps.length) * 100))}%
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-2xl btn-ios27-primary text-base font-black shadow-lg"
            >
              CONTINUE ON LEARNING PATH
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setIsLessonFinished(false);
                setMistakesMade(0);
              }}
              className="w-full py-3 rounded-2xl btn-ios27-glass text-xs font-black text-slate-700 dark:text-slate-200"
            >
              PRACTICE AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ZERO HEARTS SCREEN
  if (hearts <= 0 && !settings.unlimitedHearts) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6 relative z-10">
        <div className="ios27-glass-card p-8 space-y-5">
          <PacoMascot size="lg" mood="sad" />
          <h2 className="text-2xl font-black text-[#FF4B4B]">Out of hearts!</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Take a breather or restore your hearts to keep studying Spanish concepts.
          </p>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={refillHearts}
              className="w-full py-3.5 rounded-2xl btn-ios27-primary text-xs font-black"
            >
              RESTORE 5 HEARTS NOW
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-2xl btn-ios27-glass text-xs font-black text-slate-700 dark:text-slate-200"
            >
              RETURN TO PATH
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE LESSON RUNNER INTERFACE (iOS 27 Liquid Glass Style)
  const progressPercent = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <div className="max-w-2xl mx-auto flex flex-col justify-between min-h-[calc(100vh-6rem)] pb-36 select-none relative z-10 px-4">
      {/* Top Bar: iOS 27 Liquid Glass bar */}
      <div className="flex items-center gap-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
          title="Exit lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Liquid Glass Progress Bar */}
        <div className="flex-1 bg-slate-200/70 dark:bg-slate-700/60 h-4 rounded-full overflow-hidden p-0.5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#58CC02] to-[#6df00d] h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(88,204,2,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Tip / Explanation helper */}
        <button
          type="button"
          onClick={() => setShowTipModal(true)}
          className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors"
          title="View concept explanation"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Hearts */}
        <div className="flex items-center gap-1.5 font-black text-sm text-[#FF4B4B] px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
          <Heart className="w-4 h-4 fill-[#FF4B4B]" />
          {settings.unlimitedHearts ? (
            <InfinityIcon className="w-4 h-4" />
          ) : (
            <span>{hearts}</span>
          )}
        </div>
      </div>

      {/* ========================================================
          QUESTIONS TESTING VOCABULARY
          ======================================================== */}
      <div className="my-auto py-6 space-y-6">
          <div className="ios27-glass-card p-6 sm:p-8 space-y-6">
            {/* Header prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {currentStep.type === 'listen_type'
                      ? 'Type what you hear'
                      : currentStep.type === 'word_bank'
                      ? 'Assemble the Spanish translation'
                      : currentStep.type === 'missing_letters'
                      ? 'Fill in the missing letters'
                      : 'Translate this word'}
                  </span>
                </span>
                <span>
                  Question {currentIndex + 1} of {steps.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {currentStep.vocab.english}
                </h2>
                <button
                  type="button"
                  onClick={playAudio}
                  className="p-3 rounded-2xl bg-[#E5F6FF] dark:bg-sky-950/60 border-2 border-[#1CB0F6] text-[#1CB0F6] hover:scale-105 transition-transform"
                  title="Listen in Spanish"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              {currentStep.vocab.gender && (
                <span className="text-xs font-mono font-bold text-slate-400">
                  Gender: {currentStep.vocab.gender}
                </span>
              )}
            </div>

            {/* 1. Multiple Choice */}
            {currentStep.type === 'translate_choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentStep.options?.map((opt) => {
                  const isSelected = selectedChoice === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={feedbackStatus !== 'idle'}
                      onClick={() => setSelectedChoice(opt)}
                      className={`p-4 rounded-2xl border-2 text-left font-black text-base transition-all ${
                        isSelected
                          ? 'border-[#1CB0F6] bg-[#E5F6FF] dark:bg-sky-950/50 text-[#1CB0F6] shadow-sm translate-y-0.5'
                          : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Write Translation & Listen Type */}
            {(currentStep.type === 'write_translation' || currentStep.type === 'listen_type') && (
              <div className="space-y-4 pt-2">
                <input
                  ref={textInputRef}
                  type="text"
                  disabled={feedbackStatus !== 'idle'}
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type Spanish translation..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full text-xl sm:text-2xl font-bold px-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1CB0F6]"
                />

                {/* Virtual Accents */}
                {feedbackStatus === 'idle' && (
                  <AccentKeyboard
                    onInsertChar={(ch) => {
                      setTypedText((prev) => prev + ch);
                      textInputRef.current?.focus();
                    }}
                  />
                )}
              </div>
            )}

            {/* 3. Word Bank */}
            {currentStep.type === 'word_bank' && (
              <div className="space-y-6 pt-2">
                {/* Answer assembled area */}
                <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center gap-2">
                  {selectedTiles.map((word, i) => (
                    <button
                      key={`${word}-${i}`}
                      type="button"
                      onClick={() => handleSelectedTileRemove(word, i)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-black text-sm text-slate-900 dark:text-slate-100 shadow-xs hover:border-rose-400"
                    >
                      {word}
                    </button>
                  ))}
                  {selectedTiles.length === 0 && (
                    <span className="text-xs font-bold text-slate-400">
                      Tap tiles below to assemble translation
                    </span>
                  )}
                </div>

                {/* Available tile bank */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {availableTiles.map((word, i) => (
                    <button
                      key={`${word}-${i}`}
                      type="button"
                      onClick={() => handleTileClick(word, i)}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-4 border-b-slate-300 dark:border-b-slate-600 font-black text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* BOTTOM ACTION & FEEDBACK DRAWER (iOS 27 Liquid Glass style) */}
      <div
          className={`fixed bottom-0 left-0 right-0 border-t transition-all p-4 sm:p-6 z-40 backdrop-blur-3xl ${
            feedbackStatus === 'correct'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-500/50'
              : feedbackStatus === 'incorrect'
              ? 'bg-rose-50/90 dark:bg-rose-950/90 border-rose-500/50'
              : 'ios27-glass'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {feedbackStatus === 'correct' ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#58CC02] flex items-center justify-center text-white shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#46A302] dark:text-green-400">
                    {feedbackMessage}
                  </h4>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Concept mastered! +10 XP
                  </p>
                </div>
              </div>
            ) : feedbackStatus === 'incorrect' ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF4B4B] flex items-center justify-center text-white shrink-0 shadow-md">
                  <XCircle className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#EA2B2B] dark:text-rose-400">
                    Correct solution:
                  </h4>
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {currentStep.vocab.spanish}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-bold hidden sm:block">
                Press Enter or click check to submit
              </div>
            )}

            {feedbackStatus === 'idle' ? (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={
                  currentStep.type === 'translate_choice'
                    ? !selectedChoice
                    : currentStep.type === 'word_bank'
                    ? selectedTiles.length === 0
                    : !typedText.trim()
                }
                className="w-full sm:w-44 py-4 rounded-2xl btn-ios27-primary text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                CHECK
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                autoFocus
                className={`w-full sm:w-44 py-4 rounded-2xl text-sm font-black shadow-md ${
                  feedbackStatus === 'correct' ? 'btn-ios27-primary' : 'btn-duo-red'
                }`}
              >
                CONTINUE
              </button>
            )}
          </div>
        </div>

      {/* Tip / Explanation Modal */}
      {showTipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setShowTipModal(false)}
        >
          <div
            className="w-full max-w-md ios27-glass-card p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                  Concept Hint
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTipModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-lg font-black text-slate-900 dark:text-white">
                "{currentStep.vocab.spanish}" = "{currentStep.vocab.english}"
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.explanation}
              </p>
              {currentStep.grammarTip && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  {currentStep.grammarTip}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTipModal(false)}
              className="w-full py-3 rounded-xl btn-ios27-primary text-xs font-black"
            >
              GOT IT, RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
