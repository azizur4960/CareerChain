/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#ffffff',
      black: '#000000',
      slate: {
        50: '#f6f8f6',
        100: '#edf1ee',
        200: '#dce4df',
        300: '#c6d1ca',
        400: '#91a097',
        500: '#68776e',
        600: '#4f5e55',
        700: '#35443b',
        800: '#26352d',
        900: '#17261e',
        950: '#101b15',
      },
      indigo: {
        50: '#eff7f3',
        100: '#deeee6',
        200: '#bddbca',
        300: '#91c5a8',
        400: '#62a67f',
        500: '#398662',
        600: '#246c4d',
        700: '#1c563e',
        800: '#194532',
        900: '#16392c',
        950: '#0f291f',
      },
      brand: {
        50: '#eff7f3',
        100: '#deeee6',
        200: '#bddbca',
        300: '#91c5a8',
        400: '#62a67f',
        500: '#398662',
        600: '#246c4d',
        700: '#1c563e',
        800: '#194532',
        900: '#16392c',
      },
      amber: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
        500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
      },
      blue: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
        500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
      },
      emerald: {
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
        500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
      },
      purple: {
        50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
        500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87',
      },
      red: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
        500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d',
      },
      rose: {
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
        500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
      },
    },
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Avenir Next', 'sans-serif'],
        display: ['Space Grotesk', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '8px',
        '2xl': '10px',
        '3xl': '12px',
      },
      boxShadow: {
        sm: '0 1px 2px rgb(23 38 30 / 0.05)',
        md: '0 5px 16px rgb(23 38 30 / 0.08)',
        lg: '0 12px 28px rgb(23 38 30 / 0.10)',
        xl: '0 18px 36px rgb(23 38 30 / 0.12)',
      },
    },
  },
  plugins: [],
}
