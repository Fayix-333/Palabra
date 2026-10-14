import React from 'react';

interface FireFlameProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isBurning?: boolean;
  isGoalAchieved?: boolean;
  className?: string;
  showSparks?: boolean;
  onClick?: () => void;
}

export const FireFlame: React.FC<FireFlameProps> = ({
  size = 'md',
  isBurning = true,
  isGoalAchieved = false,
  className = '',
  showSparks = true,
  onClick,
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const sparkContainerSize = {
    xs: 'w-6 h-6 -top-1',
    sm: 'w-8 h-8 -top-1',
    md: 'w-12 h-12 -top-2',
    lg: 'w-16 h-16 -top-3',
    xl: 'w-24 h-24 -top-4',
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title={
        isGoalAchieved
          ? 'Daily Goal Achieved! Flame is roaring with bonus energy!'
          : isBurning
          ? 'Daily streak active! Practice today to keep it blazing.'
          : 'Streak inactive. Complete a lesson today to ignite!'
      }
    >
      {/* Outer ambient glow if burning */}
      {isBurning && (
        <div
          className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
            isGoalAchieved
              ? 'bg-gradient-to-t from-orange-600/50 via-amber-400/40 to-yellow-300/30 animate-flame-glow scale-125'
              : 'bg-gradient-to-t from-orange-500/30 to-amber-400/20 animate-pulse'
          }`}
        />
      )}

      {/* Floating Sparkles when goal achieved */}
      {isBurning && isGoalAchieved && showSparks && (
        <div
          className={`absolute pointer-events-none ${sparkContainerSize[size]} flex items-center justify-center`}
        >
          <div className="absolute top-0 left-1 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-spark-rise" />
          <div
            className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-spark-rise"
            style={{ animationDelay: '0.4s' }}
          />
          <div
            className="absolute -top-1 left-3 w-2 h-2 rounded-full bg-orange-400 animate-spark-rise"
            style={{ animationDelay: '0.7s' }}
          />
        </div>
      )}

      {/* SVG Animated Flame */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} relative z-10 transition-transform duration-300 ${
          isBurning
            ? 'animate-flame-flicker hover:scale-115 active:scale-95'
            : 'grayscale opacity-40 hover:opacity-60'
        }`}
      >
        <defs>
          <linearGradient
            id="flameOuter"
            x1="24"
            y1="44"
            x2="24"
            y2="4"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isGoalAchieved ? '#FF1E00' : '#EA2B2B'} />
            <stop offset="45%" stopColor="#FF9600" />
            <stop offset="85%" stopColor={isGoalAchieved ? '#FFDF00' : '#FFC800'} />
            <stop offset="100%" stopColor="#FFF275" />
          </linearGradient>

          <linearGradient
            id="flameInner"
            x1="24"
            y1="40"
            x2="24"
            y2="16"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF9600" />
            <stop offset="60%" stopColor="#FFDE59" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          <filter id="flameBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Outer Flame silhouette with organic curves */}
        <path
          d="M24 4C24 4 29 13 29 18C29 20 28 22 26 23C26 23 35 24 37 32C39 39 33 44 24 44C15 44 9 39 11 32C12.5 26.5 17 25 17 25C15 22 15 19 18 15C21 11 24 4 24 4Z"
          fill="url(#flameOuter)"
          className="transition-all duration-300"
        />

        {/* Mid-core fiery flare */}
        <path
          d="M24 14C24 14 27.5 19 27.5 23C27.5 25 26.5 26.5 25 27.5C25 27.5 31.5 28.5 32.5 34C33.5 38.5 29 42 24 42C19 42 15.5 38.5 16.5 34C17.5 29.5 21 28 21 28C19.5 26 19.5 23.5 21 20C22.5 17 24 14 24 14Z"
          fill="url(#flameInner)"
          opacity="0.85"
        />

        {/* White-hot Inner Core Flame */}
        <path
          d="M24 22C24 22 26 25 26 27C26 28.5 25.5 29.5 24.5 30C24.5 30 28 31 28.5 35C29 38 26.5 40 24 40C21.5 40 19.5 38 20 35C20.5 32.5 22.5 31 22.5 31C21.8 30 21.8 28.5 22.5 26.5C23.2 24.5 24 22 24 22Z"
          fill="#FFFFFF"
          opacity="0.95"
        />

        {/* Rising ember spark particles inside the SVG */}
        {isBurning && showSparks && (
          <>
            <circle
              cx="16"
              cy="19"
              r="1.6"
              fill="#FFC800"
              className={isGoalAchieved ? 'animate-ping' : 'animate-pulse'}
            />
            <circle
              cx="32"
              cy="21"
              r="1.4"
              fill="#FFDE59"
              className="animate-pulse"
            />
            <circle
              cx="24"
              cy="9"
              r="1.2"
              fill="#FFFFFF"
              className="animate-pulse"
            />
          </>
        )}
      </svg>
    </div>
  );
};
