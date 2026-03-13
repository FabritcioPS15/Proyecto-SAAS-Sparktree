export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c2d4ff',
          300: '#a3bfff',
          400: '#85a9ff',
          500: '#3750f0', // Principal
          600: '#2d42d8',
          700: '#2436b8',
          800: '#1a2a90',
          900: '#141e75',
          950: '#0e1550',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#41f0a5', // Principal
          600: '#10b981',
          700: '#059669',
          800: '#047857',
          900: '#065f46',
          950: '#022c22',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#41f0e0', // Secundario
          600: '#14b8a6',
          700: '#0d9488',
          800: '#0f766e',
          900: '#115e59',
          950: '#134e4a',
        },
        blueaccent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4190f0', // Secundario
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        white: {
          DEFAULT: '#ffffff', // Principal
          50: '#ffffff',
          100: '#ffffff',
        },
        black: {
          DEFAULT: '#000000', // Secundario
          50: '#000000',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
};
