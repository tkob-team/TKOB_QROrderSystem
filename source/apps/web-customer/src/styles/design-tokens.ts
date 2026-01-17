/**
 * Design System Tokens
 * Based on UI/UX Pro Max recommendations for restaurant QR ordering
 * 
 * Design System:
 * - Pattern: Minimal Single Column
 * - Style: Vibrant & Block-based
 * - Typography: Playfair Display SC / Karla
 * - Colors: Warm (Orange Red Brown) + appetizing imagery
 */

// ============================================================================
// COLORS
// ============================================================================

/**
 * Color Palette
 * Based on UI/UX Pro Max recommendation for restaurant/food service
 */
export const colors = {
  // Primary - Red tones for appetite appeal
  primary: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main primary
    600: '#DC2626',  // Recommended CTA
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',  // Dark text
  },
  
  // Secondary - Lighter red tones
  secondary: {
    50: '#FFF5F5',
    100: '#FFEAEA',
    200: '#FFD5D5',
    300: '#FFBFBF',
    400: '#F87171',  // Recommended secondary
    500: '#F25656',
    600: '#E03A3A',
    700: '#C62828',
    800: '#A52020',
    900: '#7F1919',
  },
  
  // Accent - Gold/Amber for CTAs
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#CA8A04',  // Recommended CTA
  },
  
  // Neutral grays
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#0F172A',  // Darkest text
  },
  
  // Semantic colors
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#065F46',
  },
  
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#92400E',
  },
  
  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#991B1B',
  },
  
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#1E40AF',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FEF2F2',  // Recommended warm background
    tertiary: '#FFF5F5',
    dark: '#0F172A',
  },
  
  // Text colors
  text: {
    primary: '#450A0A',  // Recommended dark text
    secondary: '#7F1D1D',
    tertiary: '#991B1B',
    muted: '#6B7280',
    light: '#9CA3AF',
    white: '#FFFFFF',
  },
  
  // Border colors
  border: {
    light: '#F3F4F6',
    DEFAULT: '#E5E7EB',
    dark: '#D1D5DB',
  },
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Typography System
 * Playfair Display SC (Headers) / Karla (Body)
 * 
 * Google Fonts Import:
 * @import url('https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&family=Playfair+Display+SC:wght@400;700&display=swap');
 */
export const typography = {
  // Font families
  fontFamily: {
    display: "'Playfair Display SC', serif",  // For headings, elegant
    body: "'Karla', sans-serif",  // For body text, readable
    mono: "'Fira Code', 'Courier New', monospace",  // For code
  },
  
  // Font sizes - Mobile first, then desktop
  fontSize: {
    // Utility sizes
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    
    // Heading sizes (large type 32px+ for impact)
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1.2' }],       // 48px - Large sections
    '6xl': ['3.75rem', { lineHeight: '1.1' }],    // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing System
 * Based on 8px grid with 48px+ gaps for large sections
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px - Large section gaps
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const

// ============================================================================
// SHADOWS
// ============================================================================

/**
 * Shadow System
 * For elevation and depth
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Colored shadows for CTAs
  primary: '0 10px 15px -3px rgba(220, 38, 38, 0.3)',
  accent: '0 10px 15px -3px rgba(202, 138, 4, 0.3)',
  
  // Component-specific shadows (shorthand for Phase 3)
  card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',  // Same as md
  cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',  // Same as lg
  cardSelected: '0 0 0 3px rgba(220, 38, 38, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1)',  // Red ring + md
  button: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',  // Same as md
  buttonHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',  // Same as lg
  header: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',  // Same as DEFAULT
  navBar: '0 -1px 4px rgb(0 0 0 / 0.1)',  // Upward shadow for bottom nav
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

/**
 * Border Radius System
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// ============================================================================
// TRANSITIONS
// ============================================================================

/**
 * Transition System
 * Duration: 150-300ms recommended
 */
export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    medium: '300ms',
    slow: '500ms',
  },
  
  // Timing functions
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
    
    // Custom cubic beziers
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Common transitions
  common: {
    colors: 'color 200ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out',
    transform: 'transform 200ms ease-in-out',
    opacity: 'opacity 200ms ease-in-out',
    shadow: 'box-shadow 200ms ease-in-out',
    all: 'all 200ms ease-in-out',
  },
  
  // Shorthand transitions (for Phase 3)
  fast: 'all 150ms ease-out',
  default: 'all 250ms ease-out',
  slow: 'all 500ms ease-out',
} as const

// ============================================================================
// Z-INDEX
// ============================================================================

/**
 * Z-Index System
 * Organized layers for predictable stacking
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  max: 9999,
} as const

// ============================================================================
// BREAKPOINTS
// ============================================================================

/**
 * Responsive Breakpoints
 * Mobile-first approach
 */
export const breakpoints = {
  xs: '375px',    // Small phones
  sm: '640px',    // Phones
  md: '768px',    // Tablets
  lg: '1024px',   // Desktops
  xl: '1280px',   // Large desktops
  '2xl': '1536px', // Extra large desktops
} as const

// ============================================================================
// ANIMATION
// ============================================================================

/**
 * Animation System
 * Includes scroll-snap, animated patterns
 */
export const animation = {
  // Keyframes
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideInUp: {
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideInDown: {
      '0%': { transform: 'translateY(-100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideInRight: {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  
  // Predefined animations
  fadeIn: 'fadeIn 200ms ease-in-out',
  fadeOut: 'fadeOut 200ms ease-in-out',
  slideInUp: 'slideInUp 300ms ease-out',
  slideInDown: 'slideInDown 300ms ease-out',
  slideInLeft: 'slideInLeft 300ms ease-out',
  slideInRight: 'slideInRight 300ms ease-out',
  scaleIn: 'scaleIn 200ms ease-out',
  bounce: 'bounce 1s ease-in-out infinite',
  pulse: 'pulse 2s ease-in-out infinite',
  spin: 'spin 1s linear infinite',
  
  // Animation utility functions
  /**
   * Returns animation CSS that respects prefers-reduced-motion
   * Usage: animation: getReducedMotionAnimation('fadeIn 200ms')
   */
  withReducedMotion: (animation: string) => {
    return `
      @media (prefers-reduced-motion: no-preference) {
        animation: ${animation};
      }
      @media (prefers-reduced-motion: reduce) {
        animation: none;
        transition: none;
      }
    `
  },
} as const

// ============================================================================
// EFFECTS
// ============================================================================

/**
 * Key Visual Effects
 * Bold hover (color shift), animated patterns
 */
export const effects = {
  // Hover effects
  hover: {
    // Bold color shift for CTAs
    primaryShift: {
      background: colors.primary[600],
      transform: 'translateY(-2px)',
      boxShadow: shadows.primary,
    },
    accentShift: {
      background: colors.accent[600],
      transform: 'translateY(-2px)',
      boxShadow: shadows.accent,
    },
    // Card hover
    cardLift: {
      transform: 'translateY(-4px)',
      boxShadow: shadows.lg,
    },
  },
  
  // Glass morphism (if needed)
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
} as const

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

/**
 * Common component variants
 */
export const components = {
  // Button sizes
  button: {
    sizes: {
      sm: {
        padding: '0.5rem 1rem',
        fontSize: typography.fontSize.sm,
        borderRadius: borderRadius.md,
      },
      md: {
        padding: '0.75rem 1.5rem',
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.lg,
      },
      lg: {
        padding: '1rem 2rem',
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.xl,
      },
    },
    variants: {
      primary: {
        background: colors.primary[600],
        color: colors.text.white,
        hover: effects.hover.primaryShift,
      },
      accent: {
        background: colors.accent[600],
        color: colors.text.white,
        hover: effects.hover.accentShift,
      },
      outline: {
        background: 'transparent',
        color: colors.primary[600],
        border: `2px solid ${colors.primary[600]}`,
      },
      ghost: {
        background: 'transparent',
        color: colors.primary[600],
      },
    },
  },
  
  // Card styles
  card: {
    base: {
      background: colors.background.primary,
      borderRadius: borderRadius.xl,
      boxShadow: shadows.md,
      padding: spacing[6],
    },
    hover: effects.hover.cardLift,
  },
  
  // Input styles
  input: {
    base: {
      background: colors.background.primary,
      border: `1px solid ${colors.border.DEFAULT}`,
      borderRadius: borderRadius.lg,
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
    },
    focus: {
      borderColor: colors.primary[600],
      outline: 'none',
      boxShadow: `0 0 0 3px rgba(220, 38, 38, 0.1)`,
    },
  },
} as const

// ============================================================================
// EXPORT ALL
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  breakpoints,
  animation,
  effects,
  components,
} as const

export type DesignTokens = typeof designTokens
export type Colors = typeof colors
export type Typography = typeof typography
export type Spacing = typeof spacing
