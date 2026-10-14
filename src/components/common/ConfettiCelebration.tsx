import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export type ConfettiType = 'lesson' | 'unit' | 'goal' | 'streak';

const PALABRA_COLORS = [
  '#58CC02', // Duolingo Green
  '#FFC800', // Gold Yellow
  '#FF9600', // Flame Orange
  '#1CB0F6', // Sky Blue
  '#FF4B4B', // Fiesta Red
  '#CE82FF', // Gem Purple
];

const FIRE_COLORS = ['#FF9600', '#FF4B4B', '#FFC800', '#FFD280', '#E58500'];

/**
 * Fires dual cannons for standard bite-sized lesson completion.
 */
export function fireLessonCompleteConfetti(): void {
  try {
    // Left cannon
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.75 },
      colors: PALABRA_COLORS,
      ticks: 250,
      gravity: 0.9,
      scalar: 1.1,
    });

    // Right cannon
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.75 },
      colors: PALABRA_COLORS,
      ticks: 250,
      gravity: 0.9,
      scalar: 1.1,
    });

    // Delayed star pop in center
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 90,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFC800', '#58CC02', '#FF9600'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
      });
    }, 250);
  } catch (err) {
    console.warn('Confetti effect error:', err);
  }
}

/**
 * Fires an epic fireworks cascade for Unit Test / Checkpoint / Sibaq Arena completion.
 */
export function fireUnitTestConfetti(): void {
  try {
    const end = Date.now() + 2500;

    const frame = () => {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 75,
        origin: { x: 0, y: 0.7 },
        colors: PALABRA_COLORS,
        scalar: 1.2,
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 75,
        origin: { x: 1, y: 0.7 },
        colors: PALABRA_COLORS,
        scalar: 1.2,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Golden center finale
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFC800', '#FF9600', '#FFFFFF', '#58CC02'],
        shapes: ['star'],
        scalar: 1.4,
      });
    }, 1200);
  } catch (err) {
    console.warn('Unit test confetti effect error:', err);
  }
}

/**
 * Fires a warm flame/star burst when user achieves daily learning goal or extends streak.
 */
export function fireGoalAchievedConfetti(): void {
  try {
    // Multi-angle flame sparklers
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { x: 0.5, y: 0.65 },
      colors: FIRE_COLORS,
      shapes: ['star', 'circle'],
      scalar: 1.3,
      gravity: 0.8,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 0.7 },
        colors: FIRE_COLORS,
        scalar: 1.1,
      });
    }, 200);
  } catch (err) {
    console.warn('Goal confetti error:', err);
  }
}

/**
 * Triggers confetti based on event type.
 */
export function triggerConfetti(type: ConfettiType = 'lesson'): void {
  if (type === 'unit') {
    fireUnitTestConfetti();
  } else if (type === 'goal' || type === 'streak') {
    fireGoalAchievedConfetti();
  } else {
    fireLessonCompleteConfetti();
  }
}

interface ConfettiCelebrationProps {
  active?: boolean;
  type?: ConfettiType;
}

/**
 * Declarative component for triggering confetti celebrations.
 */
export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  active = true,
  type = 'lesson',
}) => {
  useEffect(() => {
    if (!active) return;

    if (type === 'unit') {
      fireUnitTestConfetti();
    } else if (type === 'goal' || type === 'streak') {
      fireGoalAchievedConfetti();
    } else {
      fireLessonCompleteConfetti();
    }
  }, [active, type]);

  return null;
};
