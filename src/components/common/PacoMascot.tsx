import React from 'react';

export type MascotMood =
  | 'happy'
  | 'cheering'
  | 'thinking'
  | 'encouraging'
  | 'sad'
  | 'champion';

interface PacoMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  speechText?: string;
}

export const PacoMascot: React.FC<PacoMascotProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
  speechText,
}) => {
  const sizePixels = {
    sm: 48,
    md: 84,
    lg: 128,
    xl: 180,
  }[size];

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Speech bubble if provided */}
      {speechText && (
        <div className="relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm max-w-xs animate-in fade-in duration-200">
          {speechText}
          <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white dark:bg-slate-800 border-b-2 border-r-2 border-slate-200 dark:border-slate-700 transform rotate-45" />
        </div>
      )}

      {/* Vector Paco Mascot SVG */}
      <svg
        width={sizePixels}
        height={sizePixels}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 select-none"
      >
        {/* Shadow */}
        <ellipse cx="70" cy="132" rx="42" ry="7" fill="#000000" opacity="0.12" />

        {/* Tail feathers */}
        <path
          d="M32 94 C20 102 12 118 10 126 C18 124 30 114 38 102 Z"
          fill="#1CB0F6"
        />
        <path
          d="M26 88 C14 94 6 108 4 116 C12 114 24 104 32 94 Z"
          fill="#FF9600"
        />

        {/* Body (Emerald / Quetzal Green) */}
        <ellipse cx="70" cy="78" rx="46" ry="48" fill="#58CC02" />
        {/* Soft belly accent */}
        <ellipse cx="72" cy="88" rx="30" ry="32" fill="#79E01B" />

        {/* Feet */}
        <path
          d="M54 122 C54 128 50 131 46 131 M54 122 C56 128 58 131 62 131"
          stroke="#FF9600"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M86 122 C86 128 82 131 78 131 M86 122 C88 128 90 131 94 131"
          stroke="#FF9600"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Left Wing */}
        {mood === 'cheering' || mood === 'champion' ? (
          <path
            d="M30 68 C14 46 22 28 34 38 C42 46 44 64 30 68 Z"
            fill="#46A302"
          />
        ) : (
          <path
            d="M28 72 C18 80 18 100 32 104 C40 102 44 90 38 76 Z"
            fill="#46A302"
          />
        )}

        {/* Right Wing */}
        {mood === 'cheering' || mood === 'champion' ? (
          <path
            d="M110 68 C126 46 118 28 106 38 C98 46 96 64 110 68 Z"
            fill="#46A302"
          />
        ) : mood === 'encouraging' ? (
          /* Thumbs up wing */
          <path
            d="M112 72 C124 74 130 62 124 54 C118 48 110 60 104 68 Z"
            fill="#46A302"
          />
        ) : (
          <path
            d="M112 72 C122 80 122 100 108 104 C100 102 96 90 102 76 Z"
            fill="#46A302"
          />
        )}

        {/* Spanish Festive Beret / Cap */}
        <path
          d="M48 38 C48 24 92 24 92 38 C96 40 44 40 48 38 Z"
          fill="#FF4B4B"
        />
        <ellipse cx="70" cy="36" rx="26" ry="7" fill="#FF4B4B" />
        <ellipse cx="70" cy="34" rx="22" ry="5" fill="#FF6B6B" />
        <circle cx="70" cy="24" r="4" fill="#FFC800" />

        {/* EYES */}
        {mood === 'sad' ? (
          /* Downcast eyes */
          <>
            <circle cx="56" cy="62" r="8" fill="#3C3C3C" />
            <circle cx="84" cy="62" r="8" fill="#3C3C3C" />
            <circle cx="58" cy="64" r="2.5" fill="#FFFFFF" />
            <circle cx="86" cy="64" r="2.5" fill="#FFFFFF" />
            {/* Soft sad brows */}
            <path d="M48 54 Q56 58 64 54" stroke="#3C3C3C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M76 54 Q84 58 92 54" stroke="#3C3C3C" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : mood === 'cheering' || mood === 'champion' ? (
          /* Joyful happy curved eyes */
          <>
            <path
              d="M48 64 Q56 54 64 64"
              stroke="#3C3C3C"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M76 64 Q84 54 92 64"
              stroke="#3C3C3C"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          /* Large friendly open eyes */
          <>
            <circle cx="56" cy="62" r="10" fill="#FFFFFF" />
            <circle cx="84" cy="62" r="10" fill="#FFFFFF" />
            <circle cx="57" cy="62" r="6" fill="#3C3C3C" />
            <circle cx="83" cy="62" r="6" fill="#3C3C3C" />
            {/* Eye glints */}
            <circle cx="55" cy="59" r="2.5" fill="#FFFFFF" />
            <circle cx="81" cy="59" r="2.5" fill="#FFFFFF" />
            <circle cx="59" cy="64" r="1" fill="#FFFFFF" />
            <circle cx="85" cy="64" r="1" fill="#FFFFFF" />
          </>
        )}

        {/* Cute blush cheeks */}
        <ellipse cx="44" cy="74" rx="6" ry="4" fill="#FF4B4B" opacity="0.3" />
        <ellipse cx="96" cy="74" rx="6" ry="4" fill="#FF4B4B" opacity="0.3" />

        {/* BEAK */}
        <path
          d="M62 70 Q70 66 78 70 Q70 86 62 70 Z"
          fill="#FF9600"
        />
        <path
          d="M64 71 Q70 73 76 71"
          stroke="#E58500"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Champion Trophy or Medal */}
        {mood === 'champion' && (
          <g transform="translate(56, 88)">
            <circle cx="14" cy="14" r="12" fill="#FFC800" stroke="#E5A500" strokeWidth="2" />
            <path d="M10 10 L18 10 L16 16 L14 19 L12 16 Z" fill="#FFFFFF" opacity="0.8" />
            <path d="M7 6 L14 14 L21 6" stroke="#FF4B4B" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
