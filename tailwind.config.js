/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D12',
        surface: '#13131a',
        border: '#1e1e2e',
        gold: '#D4A017',
        primary: '#e8e8f0',
        muted: '#666680',
        success: '#4ade80',
      },
    },
  },
  plugins: [],
}
