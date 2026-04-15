/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rose:        '#E8647A',
        'rose-dark': '#D4566C',
        sage:        '#7BAE9A',
        amber:       '#E8A95C',
        violet:      '#9B7EC8',
        ink:         '#1E1424',
        'ink-soft':  '#6B4F72',
        blush:       '#F9E8EC',
        'blush-dark':'#F0CFDA',
        bg:          '#FAF7F9',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      animation: {
        fadeUp:      'fadeUp 0.3s ease-out',
        'pulse-soft':'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [
    // Scrollbar hide utility
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.safe-area-pb': {
          'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
        },
      })
    }
  ],
}
