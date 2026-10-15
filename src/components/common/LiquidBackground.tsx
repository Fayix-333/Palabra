import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="liquid-mesh-container" aria-hidden="true">
      {/* Emerald / Mint liquid glow orb */}
      <div
        className="liquid-orb animate-liquid-1 w-[460px] h-[460px] bg-emerald-400/40 dark:bg-emerald-500/20 top-[-80px] left-[-80px]"
      />
      {/* Sky / Cyan liquid glow orb */}
      <div
        className="liquid-orb animate-liquid-2 w-[520px] h-[520px] bg-sky-400/35 dark:bg-sky-500/15 top-[30%] right-[-100px]"
      />
      {/* Violet / Fuchsia liquid glow orb */}
      <div
        className="liquid-orb animate-liquid-3 w-[480px] h-[480px] bg-indigo-400/30 dark:bg-purple-600/15 bottom-[-100px] left-[20%]"
      />
      {/* Amber warm highlight orb */}
      <div
        className="liquid-orb animate-liquid-1 w-[380px] h-[380px] bg-amber-300/25 dark:bg-amber-500/10 top-[60%] right-[30%]"
        style={{ animationDuration: '22s' }}
      />
    </div>
  );
};
