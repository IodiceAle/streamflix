/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#E50914',
                    dark: '#B20710',
                    light: '#FF1A1A',
                },
                surface: {
                    DEFAULT: '#0a0a0a',
                    elevated: '#141414',
                    card: '#1a1a1a',
                    hover: '#252525',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#B3B3B3',
                    muted: '#6B6B6B',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '112': '28rem',
                '128': '32rem',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-in-up': 'fadeInUp 0.4s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            aspectRatio: {
                'poster': '2 / 3',
                'backdrop': '16 / 9',
                'square': '1 / 1',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(229, 9, 20, 0.3)',
                'glow-lg': '0 0 40px rgba(229, 9, 20, 0.4)',
                'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
                'card-hover': '0 16px 48px rgba(0, 0, 0, 0.6)',
            },
            transitionDuration: {
                '400': '400ms',
            },
            screens: {
                'xs': '475px',
                '3xl': '1920px',
            },
        },
    },
    plugins: [],
}
