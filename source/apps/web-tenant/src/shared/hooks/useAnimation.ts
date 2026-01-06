import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import type { JSAnimation } from 'animejs';

/**
 * Animation Presets Configuration
 * 
 * fadeUp: Fades in while moving up (opacity 0→1, translateY 20px→0)
 * scaleIn: Scales in while fading (opacity 0→1, scale 0.95→1)
 * staggerList: Animates list items with stagger delay (fadeUp effect per item)
 */

interface AnimationConfig {
  targets: string | HTMLElement | HTMLElement[];
  duration?: number;
  delay?: number;
  easing?: string;
}

interface StaggerConfig extends AnimationConfig {
  stagger?: number;
}

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * useAnimation Hook
 * 
 * Minimal animation wrapper for anime.js with presets.
 * Respects prefers-reduced-motion and auto-cleanup on unmount.
 */
export function useAnimation() {
  const animationsRef = useRef<JSAnimation[]>([]);

  // Cleanup all animations on unmount
  useEffect(() => {
    return () => {
      animationsRef.current.forEach((anim) => {
        if (anim && typeof anim.pause === 'function') {
          anim.pause();
        }
      });
      animationsRef.current = [];
    };
  }, []);

  /**
   * Preset 1: fadeUp
   * Fades in while moving up from 20px below
   * Use for: Hero sections, forms, cards entering viewport
   */
  const fadeUp = (config: AnimationConfig) => {
    if (prefersReducedMotion()) return null;

    const anim = animate(config.targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: config.duration || 800,
      delay: config.delay || 0,
      easing: config.easing || 'easeOutCubic',
    });

    animationsRef.current.push(anim);
    return anim;
  };

  /**
   * Preset 2: scaleIn
   * Scales in from 0.95 while fading in
   * Use for: Modals, drawers, popovers, tooltips
   */
  const scaleIn = (config: AnimationConfig) => {
    if (prefersReducedMotion()) return null;

    const anim = animate(config.targets, {
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: config.duration || 300,
      delay: config.delay || 0,
      easing: config.easing || 'easeOutCubic',
    });

    animationsRef.current.push(anim);
    return anim;
  };

  /**
   * Preset 3: staggerList
   * Animates list items with stagger delay (fadeUp effect per item)
   * Use for: KPI cards, menu items, table rows, any list/grid
   */
  const staggerList = (config: StaggerConfig) => {
    if (prefersReducedMotion()) return null;

    const anim = animate(config.targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: config.duration || 600,
      delay: (el: any, i: number) => (config.delay || 0) + i * (config.stagger || 100),
      easing: config.easing || 'easeOutCubic',
    });

    animationsRef.current.push(anim);
    return anim;
  };

  /**
   * Custom: floatingIcons
   * Gentle floating animation for background elements
   * Use for: Login page background icons
   */
  const floatingIcons = (config: AnimationConfig) => {
    if (prefersReducedMotion()) return null;

    const anim = animate(config.targets, {
      translateY: ['-10px', '10px'],
      duration: config.duration || 3000,
      delay: config.delay || 0,
      easing: 'inOutSine',
      loop: true,
      direction: 'alternate',
    });

    animationsRef.current.push(anim);
    return anim;
  };

  return {
    fadeUp,
    scaleIn,
    staggerList,
    floatingIcons,
  };
}
