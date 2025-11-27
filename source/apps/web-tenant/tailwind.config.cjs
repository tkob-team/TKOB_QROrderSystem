/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    '../../packages/**/src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: 'var(--emerald-50)',
          100: 'var(--emerald-100)',
          200: 'var(--emerald-200)',
          300: 'var(--emerald-300)',
          500: 'var(--emerald-500)',
          600: 'var(--emerald-600)',
          700: 'var(--emerald-700)',
          900: 'var(--emerald-900)',
        },
        orange: {
          50: 'var(--orange-50)',
          100: 'var(--orange-100)',
          500: 'var(--orange-500)',
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
          900: 'var(--orange-900)',
        },
        amber: {
          50: 'var(--amber-50)',
          100: 'var(--amber-100)',
          200: 'var(--amber-200)',
          500: 'var(--amber-500)',
          600: 'var(--amber-600)',
          700: 'var(--amber-700)',
          900: 'var(--amber-900)',
        },
        red: {
          50: 'var(--red-50)',
          100: 'var(--red-100)',
          200: 'var(--red-200)',
          500: 'var(--red-500)',
          600: 'var(--red-600)',
          700: 'var(--red-700)',
        },
        blue: {
          50: 'var(--blue-50)',
          100: 'var(--blue-100)',
          200: 'var(--blue-200)',
          500: 'var(--blue-500)',
          600: 'var(--blue-600)',
          700: 'var(--blue-700)',
          800: 'var(--blue-800)',
          900: 'var(--blue-900)',
        },
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          900: 'var(--gray-900)',
        },
        black: 'var(--color-black)',
        white: 'var(--color-white)',
      },
      spacing: {
        spacing: '0.25rem',
      },
      borderRadius: {
        '2xl': 'var(--radius-2xl)',
      },
      transitionDuration: {
        DEFAULT: 'var(--default-transition-duration)',
      },
    },
  },
  plugins: [],
};