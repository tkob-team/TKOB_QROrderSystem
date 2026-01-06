/**
 * Custom hooks for anime.js animations
 * Supports reduced motion preferences
 */

'use client';

import { useEffect, useRef, RefObject } from 'react';
import { animate, stagger } from 'animejs';

type AnimationPreset = 'fadeUpStagger' | 'fadeUp' | 'countUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Run animation on mount
 */
export function useAnimeOnMount(
  ref: RefObject<HTMLElement | null>,
  preset: AnimationPreset
) {
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) {
      // If reduced motion, just show elements immediately
      if (ref.current) {
        const elements = ref.current.querySelectorAll('[class*="opacity-0"]');
        elements.forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        ref.current.style.opacity = '1';
      }
      return;
    }

    runAnimation(preset, ref.current);
  }, [ref, preset]);
}

/**
 * Run animation when element enters viewport
 */
export function useAnimeOnInView(
  ref: RefObject<HTMLElement | null>,
  preset: AnimationPreset,
  options: IntersectionObserverInit = { threshold: 0.2 }
) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            if (prefersReducedMotion()) {
              // Show immediately without animation
              const elements = ref.current?.querySelectorAll('.feature-card, .stat-item');
              elements?.forEach((el) => {
                (el as HTMLElement).style.opacity = '1';
                (el as HTMLElement).style.transform = 'none';
              });
              return;
            }

            runAnimation(preset, ref.current!);
          }
        });
      },
      options
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, preset, options]);
}

/**
 * Run animation based on preset
 * Using 'as any' for anime.js type compatibility
 */
function runAnimation(preset: AnimationPreset, container: HTMLElement): void {
  switch (preset) {
    case 'fadeUpStagger': {
      const targets = container.querySelectorAll('.hero-content > *, .feature-card');
      if (targets.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate(targets as any, {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 500,
          delay: stagger(50),
          ease: 'outCubic',
        });
      }
      break;
    }

    case 'fadeUp':
      animate(container, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        ease: 'outCubic',
      });
      break;

    case 'countUp': {
      const statItems = container.querySelectorAll('.stat-item');
      statItems.forEach((item, index) => {
        const valueEl = item.querySelector('div:first-child');
        if (valueEl) {
          animate(valueEl as HTMLElement, {
            scale: [0.5, 1],
            opacity: [0, 1],
            duration: 600,
            delay: index * 100,
            ease: 'outBack',
          });
        }
      });
      break;
    }

    case 'scaleIn':
      animate(container, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 500,
        ease: 'outCubic',
      });
      break;

    case 'slideInLeft':
      animate(container, {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        ease: 'outCubic',
      });
      break;

    case 'slideInRight':
      animate(container, {
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 600,
        ease: 'outCubic',
      });
      break;
  }
}
