/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores Pastéis Saturadas (Semáforo Logic)
        success: {
          DEFAULT: '#86EFAC', // Green-300
          dark: '#22C55E',    // Green-500 (para texto/ícones)
          light: '#DCFCE7',   // Green-100 (para fundos muito claros)
        },
        error: {
          DEFAULT: '#FCA5A5', // Red-300
          dark: '#EF4444',    // Red-500
          light: '#FEE2E2',   // Red-100
        },
        background: '#F9FAFB', // Gray-50 (Off-white)
        surface: '#FFFFFF',
        text: {
          primary: '#111827', // Gray-900
          secondary: '#4B5563', // Gray-600
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Base size 18px for accessibility
        base: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        lg: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        xl: ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      }
    },
  },
  plugins: [],
}
