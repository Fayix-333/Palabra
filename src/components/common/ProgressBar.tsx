import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  colorClassName?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  size = 'md',
  colorClassName = 'bg-rose-600 dark:bg-rose-500',
  showPercentage = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-baseline mb-1.5 text-xs">
          {label && (
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {label}
              {sublabel && (
                <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-normal">
                  {sublabel}
                </span>
              )}
            </span>
          )}
          {showPercentage && (
            <span className="font-mono text-slate-500 dark:text-slate-400 font-medium">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heightClasses[size]} ${colorClassName} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
