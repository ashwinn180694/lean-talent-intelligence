import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#c47e3a',
          light: '#d4924e',
          dark: '#a86828'
        },
        navy: {
          DEFAULT: '#1a1a2e',
          light: '#232340',
          muted: '#a09cb8'
        },
        warm: {
          bg: '#f8f7f4',
          card: '#ffffff',
          border: '#e8e6e0',
          muted: '#9a9080',
          cream: '#f0ede8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
