/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          dark: '#000000',
          card: '#161617',
          border: '#2d2d2f',
          accent: '#0071e3',
          accentHover: '#0077ed',
          success: '#34c759',
          warning: '#ff9f0a',
          danger: '#ff453a',
          textMuted: '#86868b',
          bgSecondary: '#1d1d1f'
        }
      },
      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(0, 113, 227, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 113, 227, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
