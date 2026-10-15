import React, { useState } from 'react';
import { BookOpen, Volume2, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { PacoMascot } from './PacoMascot';
import { soundManager } from '../../utils/sound';

interface GrammarRule {
  id: number;
  title: string;
  category: string;
  explanation: string;
  example: string;
  translation: string;
  tip: string;
}

const GRAMMAR_SNIPPETS: GrammarRule[] = [
  {
    id: 1,
    title: 'Definite Articles: El vs. La',
    category: 'Gender Agreement',
    explanation: 'In Spanish, all nouns have a gender. Masculine nouns generally use "el", while feminine nouns generally use "la".',
    example: 'El libro (the book) vs. La mesa (the table)',
    translation: 'Most words ending in -o are masculine, and -a are feminine.',
    tip: 'Sibaq Tip: Watch out for exceptions like "el agua" (feminine with el for phonetics).',
  },
  {
    id: 2,
    title: 'Ser vs. Estar (To Be)',
    category: 'Verbs & States',
    explanation: '"Ser" is used for permanent characteristics, identity, and origin. "Estar" is used for temporary states, moods, and locations.',
    example: 'Soy estudiante (I am a student) vs. Estoy feliz (I am happy)',
    translation: 'Doctor: Description, Occupation, Characteristic, Time, Origin, Relation. Place: Position, Location, Action, Condition, Emotion.',
    tip: 'Sibaq Tip: How you are and where you are, always use estar!',
  },
  {
    id: 3,
    title: 'Written Accents (Tildes)',
    category: 'Pronunciation & Spelling',
    explanation: 'Written accents (á, é, í, ó, ú) indicate which syllable is stressed or distinguish words with identical spelling.',
    example: 'sí (yes) vs. si (if)',
    translation: 'Accents are strict in Sibaq spelling challenges. Never skip them!',
    tip: 'Sibaq Tip: Use the on-screen accent keyboard in spelling mode to get 100% precision.',
  },
  {
    id: 4,
    title: 'Por vs. Para',
    category: 'Prepositions',
    explanation: '"Por" expresses cause, motive, exchange, or duration. "Para" expresses destination, recipient, goal, or deadline.',
    example: 'Gracias por todo (Thanks for everything) vs. Es para ti (It is for you)',
    translation: 'Por = Reason/Exchange. Para = Destination/Deadline.',
    tip: 'Sibaq Tip: "Perro por para" mnemonic helps remember their distinct functions.',
  },
  {
    id: 5,
    title: 'Plural Formation (-s / -es)',
    category: 'Nouns & Plurals',
    explanation: 'To make nouns plural, add -s if the word ends in a vowel, and -es if it ends in a consonant.',
    example: 'la casa -> las casas | el profesor -> los profesores',
    translation: 'Words ending in -z change to -ces in plural (lápiz -> lápices).',
    tip: 'Sibaq Tip: Remember to change the article (el -> los, la -> las) as well!',
  },
  {
    id: 6,
    title: 'Stem-Changing Verbs (e -> ie)',
    category: 'Verb Conjugation',
    explanation: 'Many common Spanish verbs change their root vowel (e to ie) in present tense for all persons except nosotros/vosotros.',
    example: 'querer -> quiero, quieres, quiere, queremos, quieren',
    translation: 'Common stem-changers: pensar, cerrar, entender, preferir.',
    tip: 'Sibaq Tip: They form a boot shape in conjugation tables—nosotros stays outside the boot.',
  },
  {
    id: 7,
    title: 'Direct Object Pronouns',
    category: 'Pronouns',
    explanation: 'Direct object pronouns (lo, la, los, las) replace the direct object to avoid repetition and go before conjugated verbs.',
    example: '¿Tienes el libro? Sí, lo tengo.',
    translation: 'Lo = him/it (masc.), La = her/it (fem.).',
    tip: 'Sibaq Tip: In negative sentences, the pronoun sits between "no" and the verb.',
  },
];

export const GrammarSnippetBox: React.FC = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Pick snippet based on day of month
  const dayIndex = (new Date().getDate() - 1) % GRAMMAR_SNIPPETS.length;
  const snippet = GRAMMAR_SNIPPETS[dayIndex];

  const handleSpeak = () => {
    try {
      soundManager.playCorrect();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(snippet.example);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="p-6 rounded-[28px] ios27-glass-card shadow-xl space-y-4 relative overflow-hidden border border-emerald-400/30">
      {/* Specular sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-sky-500/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#58CC02] flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Grammar Snippet</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {snippet.title}
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          {snippet.category}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed relative z-10">
        {snippet.explanation}
      </p>

      {/* Example Box */}
      <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 relative z-10">
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate">
            {snippet.example}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {snippet.translation}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          className={`p-2 rounded-xl bg-emerald-500 text-white shadow-md hover:bg-emerald-600 active:scale-95 transition-all shrink-0 ${
            isPlayingAudio ? 'animate-pulse ring-4 ring-emerald-400/40' : ''
          }`}
          title="Listen to example pronunciation"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 relative z-10">
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{snippet.tip}</span>
        </span>
        <span className="text-slate-400">Rule #{snippet.id} of 7</span>
      </div>
    </div>
  );
};
