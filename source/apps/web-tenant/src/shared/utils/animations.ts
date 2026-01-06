/**
 * Animation utilities using anime.js v4
 * @see https://animejs.com/documentation/
 * 
 * Note: anime.js v4 uses a different API than v3
 * Syntax: animate(targets, parameters) - targets is now a separate first parameter
 */

import { animate, stagger } from 'animejs';

/* ===================================
   LOADING ANIMATIONS
   =================================== */

/**
 * Spinner rotation animation
 * Usage: const spinner = animateSpinner('.my-spinner')
 */
export const animateSpinner = (target: string | HTMLElement) => {
  return animate(target, {
    rotate: 360,
    loop: true,
    duration: 1000,
    ease: 'linear',
  });
};

/**
 * Pulse animation for loading states
 */
export const animatePulse = (target: string | HTMLElement) => {
  return animate(target, {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    loop: true,
    duration: 1500,
    ease: 'inOutQuad',
  });
};

/* ===================================
   ENTRANCE ANIMATIONS
   =================================== */

/**
 * Fade in with slide up
 */
export const fadeInUp = (target: string | HTMLElement, delay = 0) => {
  return animate(target, {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 600,
    delay,
    ease: 'outCubic',
  });
};

/**
 * Stagger fade in for multiple elements
 * Usage: staggerFadeIn('.stat-card', 100)
 */
export const staggerFadeIn = (
  target: string | HTMLElement,
  staggerDelay = 100
) => {
  return animate(target, {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 600,
    delay: stagger(staggerDelay),
    ease: 'outCubic',
  });
};

/**
 * Scale in animation
 */
export const scaleIn = (target: string | HTMLElement, delay = 0) => {
  return animate(target, {
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: 400,
    delay,
    ease: 'outBack',
  });
};

/* ===================================
   INTERACTIVE ANIMATIONS
   =================================== */

/**
 * Button press effect
 */
export const buttonPress = (target: HTMLElement) => {
  return animate(target, {
    scale: [1, 0.95, 1],
    duration: 200,
    ease: 'inOutQuad',
  });
};

/**
 * Shake animation for errors
 */
export const shake = (target: string | HTMLElement) => {
  return animate(target, {
    translateX: [
      { to: -10, duration: 100 },
      { to: 10, duration: 100 },
      { to: -10, duration: 100 },
      { to: 10, duration: 100 },
      { to: 0, duration: 100 },
    ],
    ease: 'inOutQuad',
  });
};

/**
 * Success checkmark animation
 */
export const checkmarkSuccess = (target: string | HTMLElement) => {
  return animate(target, {
    scale: [0, 1.2, 1],
    rotate: [0, 10, 0],
    duration: 600,
    ease: 'outElastic(1, 0.6)',
  });
};

/* ===================================
   NUMBER ANIMATIONS
   =================================== */

/**
 * Count-up animation for numbers
 * Usage: countUp('.revenue-value', 0, 437000, 1500)
 */
export const countUp = (
  target: string | HTMLElement,
  from: number,
  to: number,
  duration = 1500,
  format?: (value: number) => string
) => {
  const obj = { value: from };
  const element =
    typeof target === 'string' ? document.querySelector(target) : target;

  return animate(obj, {
    value: to,
    round: 1,
    duration,
    ease: 'outExpo',
    onUpdate: () => {
      if (element) {
        element.textContent = format
          ? format(obj.value)
          : obj.value.toLocaleString();
      }
    },
  });
};

/**
 * Percentage count-up with % suffix
 */
export const countUpPercent = (
  target: string | HTMLElement,
  from: number,
  to: number,
  duration = 1200
) => {
  return countUp(target, from, to, duration, (value) => `${value}%`);
};

/* ===================================
   CHART ANIMATIONS
   =================================== */

/**
 * Path drawing animation for SVG charts
 */
export const drawPath = (target: string | SVGPathElement) => {
  const path =
    typeof target === 'string'
      ? (document.querySelector(target) as SVGPathElement)
      : target;

  if (!path) return null;

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength.toString();
  path.style.strokeDashoffset = pathLength.toString();

  return animate(path, {
    strokeDashoffset: [pathLength, 0],
    duration: 1500,
    ease: 'inOutQuad',
  });
};

/**
 * Stagger animation for bar chart columns
 */
export const animateBars = (target: string | HTMLElement) => {
  return animate(target, {
    scaleY: [0, 1],
    opacity: [0, 1],
    delay: stagger(100, { start: 300 }),
    duration: 800,
    ease: 'outElastic(1, 0.8)',
  });
};

/* ===================================
   CARD ANIMATIONS
   =================================== */

/**
 * Card hover lift effect
 */
export const cardHoverLift = (target: HTMLElement) => {
  return animate(target, {
    translateY: -4,
    duration: 200,
    ease: 'outQuad',
  });
};

/**
 * Card hover lift return
 */
export const cardHoverReturn = (target: HTMLElement) => {
  return animate(target, {
    translateY: 0,
    duration: 200,
    ease: 'outQuad',
  });
};

/* ===================================
   MODAL ANIMATIONS
   =================================== */

/**
 * Modal enter animation
 */
export const modalEnter = (target: string | HTMLElement) => {
  return animate(target, {
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: 300,
    ease: 'outCubic',
  });
};

/**
 * Modal exit animation
 */
export const modalExit = (target: string | HTMLElement) => {
  return animate(target, {
    scale: [1, 0.9],
    opacity: [1, 0],
    duration: 200,
    ease: 'inCubic',
  });
};

/**
 * Backdrop fade animation
 */
export const backdropFade = (target: string | HTMLElement, fadeIn = true) => {
  return animate(target, {
    opacity: fadeIn ? [0, 1] : [1, 0],
    duration: 200,
    ease: 'linear',
  });
};

/* ===================================
   TOAST ANIMATIONS
   =================================== */

/**
 * Toast slide in from right
 */
export const toastSlideIn = (target: string | HTMLElement) => {
  return animate(target, {
    translateX: [400, 0],
    opacity: [0, 1],
    duration: 300,
    ease: 'outCubic',
  });
};

/**
 * Toast slide out to right
 */
export const toastSlideOut = (target: string | HTMLElement) => {
  return animate(target, {
    translateX: [0, 400],
    opacity: [1, 0],
    duration: 200,
    ease: 'inCubic',
  });
};

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

/**
 * Remove element after animation completes
 */
export const animateAndRemove = (
  target: HTMLElement,
  parameters: any
) => {
  return animate(target, {
    ...parameters,
    onComplete: () => {
      target.remove();
    },
  });
};

// Note: The following utility functions from anime.js v3 are not available in v4
// If needed, they should be reimplemented using the new API

/*
 * Chain multiple animations
 */
// export const chainAnimations = (animations: any[]) => {
//   return timeline().add(animations[0]);
// };

/*
 * Pause all animations - not available in v4 API
 */
// export const pauseAllAnimations = () => {
//   // anime.running is not available in v4
// };

/*
 * Resume all animations - not available in v4 API
 */
// export const resumeAllAnimations = () => {
//   // anime.running is not available in v4
// };

