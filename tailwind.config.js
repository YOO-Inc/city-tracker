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
        'elderly-3xl': '2.75rem',    // 44px
      },
      spacing: {
        'touch': '3.5rem',           // 56px - touch target
        'touch-lg': '4rem',          // 64px - large touch target
      },
      colors: {
        primary: {
          50: '#EEF6FF',
          100: '#D9EBFF',
          200: '#BCDCFF',
          300: '#8EC6FF',
          400: '#59A6FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#10B981',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          DEFAULT: '#EF4444',
        },
        surface: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-surface': 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F5 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    }
  },
  plugins: [],
}
