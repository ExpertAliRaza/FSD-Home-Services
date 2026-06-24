/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b'
        },
        ink: '#102a43'
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 118, 110, 0.12)'
      }
    }
  },
  plugins: []
};
