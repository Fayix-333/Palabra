import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LEARNING_UNITS } from '../data/units';
import { VOCABULARY_DATABASE } from '../data/vocabulary';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/sound';
import { evaluateAnswer } from '../utils/answerChecker';
import { PacoMascot, MascotMood } from '../components/common/PacoMascot';
import { AccentKeyboard } from '../components/common/AccentKeyboard';
import { VocabularyItem } from '../types';

type QuestionType =
  | 'translate_choice'
  | 'listen_type'
  | 'write_translation'
  | 'match_pairs'
  | 'word_bank'
  | 'missing_letters';

interface LessonQuestion {
  id: string;
  type: QuestionType;
  vocab: VocabularyItem;
  options?: string[];
  wordTiles?: string[];
  maskedWord?: string;
  missingLetters?: string[];
}

export const LessonRunner: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const {
    settings,
    hearts,
    maxHearts,
    consumeHeart,
    refillHearts,
    completeLesson,
    recordWordAttempt,
    awardXp,
  } = useApp();

  // Find lesson from data
  const lessonData = useMemo(() => {
    for (const unit of LEARNING_UNITS) {
      const found = unit.lessons.find((l) => l.id === lessonId);
      if (found) return found;
    }
    return LEARNING_UNITS[0].lessons[0];
  }, [lessonId]);

  // Generate 6 to 8 questions for this bite-sized lesson
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User input states
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);

  // Matching pairs state
  const [matchingPairs, setMatchingPairs] = useState<{
    items: { id: string; text: string; lang: 'en' | 'es'; pairId: string; matched: boolean }[];
    selectedId: string | null;
  }>({ items: [], selectedId: null });

  // Answer submission feedback
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [mistakesMade, setMistakesMade] = useState(0);

  const textInputRef = useRef<HTMLInputElement>(null);

  // Initialize questions
  useEffect(() => {
    const vocabList: VocabularyItem[] = lessonData.vocabIds
      .map((id) => VOCABULARY_DATABASE.find((v) => v.id === id))
      .filter((v): v is VocabularyItem => Boolean(v));

    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const count = Math.min(7, shuffled.length);
    const selectedVocab = shuffled.slice(0, count);

    // Question types cycle through: translate_choice, write_translation, listen_type, word_bank, missing_letters
    const generated: LessonQuestion[] = selectedVocab.map((item, idx) => {
      const qTypes: QuestionType[] = [
        'translate_choice',
        'write_translation',
        'listen_type',
        'word_bank',
        'missing_letters',
      ];
      const type = qTypes[idx % qTypes.length];

      // Options for choice
      const otherVocabs = VOCABULARY_DATABASE.filter((v) => v.id !== item.id);
      const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random());
      const distractors = shuffledOthers.slice(0, 3).map((v) => v.spanish);
      const options = [item.spanish, ...distractors].sort(() => 0.5 - Math.random());

      // Tiles for word bank (break Spanish words into chunks/words)
      const targetWords = item.spanish.split(' ');
      const dummyWords = ['el', 'la', 'un', 'una', 'es', 'de', 'no'];
      const extraTiles = dummyWords.filter((w) => !targetWords.includes(w)).slice(0, 2);
      const tiles = [...targetWords, ...extraTiles].sort(() => 0.5 - Math.random());

      // Masked letters
      let masked = item.spanish;
      if (item.spanish.length > 3) {
        masked = item.spanish
          .split('')
          .map((ch, i) => (i % 3 === 1 && ch !== ' ' ? '_' : ch))
          .join('');
      }

      return {
        id: `lq-${idx}-${item.id}`,
        type,
        vocab: item,
        options,
        wordTiles: tiles,
        maskedWord: masked,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    resetQuestionState();
    setIsLessonFinished(false);
    setMistakesMade(0);
  }, [lessonData]);

  const currentQ = questions[currentIndex];

  const resetQuestionState = () => {
    setSelectedChoice(null);
    setTypedText('');
    setSelectedTiles([]);
    setFeedbackStatus('idle');
    setFeedbackMessage('');
  };

  // Setup state for new question
  useEffect(() => {
    if (!currentQ) return;
    resetQuestionState();

    if (currentQ.type === 'word_bank' && currentQ.wordTiles) {
      setAvailableTiles([...currentQ.wordTiles]);
    }

    if (currentQ.type === 'listen_type') {
      soundManager.speakSpanish(currentQ.vocab.spanish, settings.speechRate);
    }

    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  }, [currentIndex, currentQ, settings.speechRate]);

  // Audio trigger
  const playAudio = () => {
    if (currentQ) {
      soundManager.speakSpanish(currentQ.vocab.spanish, settings.speechRate);
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
    if (!currentQ || feedbackStatus !== 'idle') return;

    let answer = '';
    if (currentQ.type === 'translate_choice') {
      answer = selectedChoice || '';
    } else if (currentQ.type === 'word_bank') {
      answer = selectedTiles.join(' ');
    } else {
      answer = typedText;
    }

    const evalResult = evaluateAnswer(answer, currentQ.vocab, settings.strictAccents);

    recordWordAttempt(currentQ.vocab.id, evalResult.isCorrect, evalResult.isStrictCorrect);

    if (evalResult.isCorrect) {
      setFeedbackStatus('correct');
      const messages = ['¡Excelente!', '¡Muy bien!', 'Perfect spelling!', '¡Buen trabajo!'];
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

  // Continue to next question or complete lesson
  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Lesson complete!
      const isPerfect = mistakesMade === 0;
      const totalXp = lessonData.xpReward + (isPerfect ? 15 : 0);
      completeLesson(lessonData.id, totalXp);
      setIsLessonFinished(true);

      if (settings.soundEffects) {
        soundManager.playFanfare();
      }
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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

  if (!currentQ && !isLessonFinished) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <PacoMascot size="lg" mood="thinking" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
          Loading lesson questions...
        </h3>
      </div>
    );
  }

  // VICTORY SUMMARY SCREEN
  if (isLessonFinished) {
    const isPerfect = mistakesMade === 0;
    const earnedXp = lessonData.xpReward + (isPerfect ? 15 : 0);

    return (
      <div className="max-w-md mx-auto text-center py-12 px-4 space-y-6 animate-in zoom-in-95 duration-200">
        <PacoMascot size="xl" mood="champion" />

        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#FFC800] tracking-tight">
            Lesson Complete!
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {lessonData.title} • {lessonData.subtitle}
          </p>
        </div>

        {/* Big Reward Badges */}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="p-4 rounded-3xl bg-[#F6EEFF] dark:bg-purple-950/40 border-2 border-[#E1C2FF] dark:border-purple-800 space-y-1">
            <span className="text-[10px] font-black uppercase text-[#CE82FF] block">
              XP EARNED
            </span>
            <span className="text-2xl font-black font-mono text-[#CE82FF]">+{earnedXp}</span>
          </div>

          <div className="p-4 rounded-3xl bg-[#E5F6FF] dark:bg-sky-950/40 border-2 border-[#1CB0F6] space-y-1">
            <span className="text-[10px] font-black uppercase text-[#1CB0F6] block">
              ACCURACY
            </span>
            <span className="text-2xl font-black font-mono text-[#1CB0F6]">
              {Math.round(((questions.length - mistakesMade) / questions.length) * 100)}%
            </span>
          </div>
        </div>

        {isPerfect && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-xs font-black text-amber-800 dark:text-amber-300">
            🌟 Perfect Lesson! +15 Bonus XP Awarded
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl btn-duo-green text-sm font-black flex items-center justify-center gap-2"
        >
          <span>CONTINUE LEARNING</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    );
  }

  // OUT OF HEARTS SCREEN
  if (hearts <= 0 && !settings.unlimitedHearts && feedbackStatus === 'idle') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-5 animate-in zoom-in-95 duration-200">
        <PacoMascot size="lg" mood="sad" />
        <h2 className="text-2xl font-black text-[#FF4B4B]">You're out of hearts!</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Don't worry! You can practice your previous mistakes to earn back hearts or switch to
          unlimited mode.
        </p>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={refillHearts}
            className="w-full py-3.5 rounded-2xl btn-duo-green text-xs font-black"
          >
            RESTORE 5 HEARTS NOW
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl btn-duo-white text-xs font-black"
          >
            RETURN TO PATH
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE LESSON RUNNER INTERFACE
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto flex flex-col justify-between min-h-[calc(100vh-6rem)] pb-32 select-none">
      {/* Top Bar: Exit, Progress, Hearts */}
      <div className="flex items-center gap-4 py-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-600 p-1"
          title="Exit lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden">
          <div
            className="bg-[#58CC02] h-3.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1 font-black text-sm text-[#FF4B4B]">
          <Heart className="w-5 h-5 fill-[#FF4B4B]" />
          {settings.unlimitedHearts ? (
            <InfinityIcon className="w-4 h-4" />
          ) : (
            <span>{hearts}</span>
          )}
        </div>
      </div>

      {/* QUESTION CONTENT AREA */}
      <div className="my-auto py-6 space-y-6">
        {/* Header prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
            <span>
              {currentQ.type === 'listen_type'
                ? 'Type what you hear'
                : currentQ.type === 'word_bank'
                ? 'Assemble the Spanish translation'
                : currentQ.type === 'missing_letters'
                ? 'Fill in the missing letters'
                : 'Translate this word'}
            </span>
            <span>Question {currentIndex + 1} of {questions.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {currentQ.vocab.english}
            </h2>
            <button
              type="button"
              onClick={playAudio}
              className="p-2.5 rounded-2xl bg-[#E5F6FF] dark:bg-sky-950/60 border-2 border-[#1CB0F6] text-[#1CB0F6] hover:scale-105 transition-transform"
              title="Listen in Spanish"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {currentQ.vocab.gender && (
            <span className="text-xs font-mono font-bold text-slate-400">
              Gender: {currentQ.vocab.gender}
            </span>
          )}
        </div>

        {/* QUESTION TYPE SPECIFIC INPUTS */}
        {/* 1. Multiple Choice */}
        {currentQ.type === 'translate_choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {currentQ.options?.map((opt) => {
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
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Write Translation & Listen Type */}
        {(currentQ.type === 'write_translation' || currentQ.type === 'listen_type') && (
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
              className="w-full text-xl sm:text-2xl font-bold px-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1CB0F6]"
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
        {currentQ.type === 'word_bank' && (
          <div className="space-y-6 pt-2">
            {/* Answer assembled area */}
            <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap items-center gap-2">
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

        {/* 4. Missing Letters */}
        {currentQ.type === 'missing_letters' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-center">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#1CB0F6]">
                {currentQ.maskedWord}
              </span>
            </div>

            <input
              ref={textInputRef}
              type="text"
              disabled={feedbackStatus !== 'idle'}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type the complete word with accents..."
              className="w-full text-xl font-bold px-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1CB0F6]"
            />

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
      </div>

      {/* BOTTOM ACTION & FEEDBACK DRAWER */}
      <div
        className={`fixed bottom-0 left-0 right-0 border-t-2 transition-all p-4 sm:p-6 z-40 ${
          feedbackStatus === 'correct'
            ? 'bg-[#D7FFB8] dark:bg-[#19381F] border-[#58CC02]'
            : feedbackStatus === 'incorrect'
            ? 'bg-[#FFDFE0] dark:bg-[#3D1B1F] border-[#FF4B4B]'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {feedbackStatus === 'correct' ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#58CC02] flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xl font-black text-[#46A302] dark:text-green-400">
                  {feedbackMessage}
                </h4>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  +{lessonData.xpReward / 5} XP
                </p>
              </div>
            </div>
          ) : feedbackStatus === 'incorrect' ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FF4B4B] flex items-center justify-center text-white shrink-0">
                <XCircle className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-lg font-black text-[#EA2B2B] dark:text-rose-400">
                  Correct solution:
                </h4>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {currentQ.vocab.spanish}
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
                currentQ.type === 'translate_choice'
                  ? !selectedChoice
                  : currentQ.type === 'word_bank'
                  ? selectedTiles.length === 0
                  : !typedText.trim()
              }
              className="w-full sm:w-44 py-3.5 rounded-2xl btn-duo-green text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              CHECK
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              autoFocus
              className={`w-full sm:w-44 py-3.5 rounded-2xl text-sm font-black ${
                feedbackStatus === 'correct' ? 'btn-duo-green' : 'btn-duo-red'
              }`}
            >
              CONTINUE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
