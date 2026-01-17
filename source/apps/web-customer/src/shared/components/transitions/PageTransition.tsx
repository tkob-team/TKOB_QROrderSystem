'use client'

/**
 * PageTransition Component
 * 
 * Provides smooth fade-in animation for page content
 * Based on UI/UX Pro Max guidelines:
 * - Duration: 150-300ms (feels responsive)
 * - Easing: ease-out for entering
 * - Respects prefers-reduced-motion
 * - Uses transform and opacity (GPU accelerated)
 */

import { useEffect, useState } from 'react'
import { transitions } from '@/styles/design-tokens'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <div
        className={className}
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transition: transitions.default,
        }}
      >
        {children}
      </div>
      
      {/* Respect prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}
