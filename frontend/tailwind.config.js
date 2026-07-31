/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d4d8e0',
          300: '#aeb5c2',
          400: '#818b9d',
          500: '#626d82',
          600: '#4d566a',
          700: '#3f4658',
          800: '#373c4b',
          900: '#1f2230',
          950: '#13151f',
        },
        brand: {
          50: '#fbf7f0',
          100: '#f5ecd9',
          200: '#ead4ad',
          300: '#ddb478',
          400: '#d0994e',
          500: '#c08033',
          600: '#a36528',
          700: '#834e23',
          800: '#6c3f23',
          900: '#5b3522',
          950: '#331b10',
        },
        teal: {
          50: '#f0fbfa',
          100: '#d6f5f2',
          200: '#b0eae6',
          300: '#7adad4',
          400: '#41c1bc',
          500: '#26a6a1',
          600: '#1c8480',
          700: '#1b6a67',
          800: '#1b5453',
          900: '#1b4645',
          950: '#0c2929',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(19,21,31,0.04), 0 4px 16px rgba(19,21,31,0.06)',
        card: '0 1px 3px rgba(19,21,31,0.06), 0 12px 32px rgba(19,21,31,0.08)',
        glow: '0 0 0 1px rgba(192,128,51,0.25), 0 8px 30px rgba(192,128,51,0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'dot-bounce': 'dot-bounce 1.2s infinite ease-in-out',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
