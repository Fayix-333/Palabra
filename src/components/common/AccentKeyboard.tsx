import React from 'react';

interface AccentKeyboardProps {
  onInsertChar: (char: string) => void;
  className?: string;
}

export const ACCENT_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

export const AccentKeyboard: React.FC<AccentKeyboardProps> = ({
  onInsertChar,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1">
        Accents:
      </span>
      {ACCENT_CHARS.map((char) => (
        <button
          key={char}
          type="button"
          onClick={() => onInsertChar(char)}
          className="h-8 w-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 dark:hover:border-amber-600 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500 active:scale-95"
          aria-label={`Insert Spanish character ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
};
