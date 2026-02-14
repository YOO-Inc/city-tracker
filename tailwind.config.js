/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'elderly-sm': '1.125rem',    // 18px
        'elderly-base': '1.25rem',   // 20px
        'elderly-lg': '1.5rem',      // 24px
        'elderly-xl': '1.75rem',     // 28px
        'elderly-2xl': '2.25rem',    // 36px
      },
      spacing: {
        'touch': '3.5rem',           // 56px - touch target
        'touch-lg': '4rem',          // 64px - large touch target
      },
      colors: {
        primary: {
          DEFAULT: '#1976D2',
          dark: '#0D47A1',
        },
        success: '#2E7D32',
        error: '#C62828',
      }
    }
  },
  plugins: [],
}
