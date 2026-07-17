/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Core design tokens
        surface: {
          DEFAULT: 'hsl(225, 20%, 6%)',   // deepest bg
          raised: 'hsl(225, 18%, 9%)',    // card bg
          overlay: 'hsl(225, 16%, 12%)',  // panel bg
          muted: 'hsl(225, 14%, 16%)',    // subtle bg
        },
        border: {
          DEFAULT: 'hsl(225, 12%, 18%)',
          strong: 'hsl(225, 10%, 24%)',
        },
        text: {
          primary: 'hsl(210, 20%, 92%)',
          secondary: 'hsl(210, 12%, 65%)',
          muted: 'hsl(210, 8%, 45%)',
        },
        // Semantic node states
        node: {
          idle: 'hsl(225, 14%, 20%)',
          active: 'hsl(261, 82%, 65%)',      // purple — traversal / current
          comparing: 'hsl(38, 92%, 60%)',    // amber — comparison
          mutating: 'hsl(142, 72%, 52%)',    // green — insertion / success
          deleted: 'hsl(0, 72%, 55%)',       // red — deletion
          found: 'hsl(196, 90%, 55%)',       // cyan — search hit
        },
        accent: {
          purple: 'hsl(261, 82%, 65%)',
          cyan: 'hsl(196, 90%, 55%)',
          amber: 'hsl(38, 92%, 60%)',
          green: 'hsl(142, 72%, 52%)',
          red: 'hsl(0, 72%, 55%)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern':
          'linear-gradient(hsl(225,14%,14%) 1px,transparent 1px),linear-gradient(90deg,hsl(225,14%,14%) 1px,transparent 1px)',
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-md': '40px 40px',
      },
      boxShadow: {
        'glow-purple': '0 0 20px hsl(261 82% 65% / 0.3)',
        'glow-cyan': '0 0 20px hsl(196 90% 55% / 0.3)',
        'node-idle': '0 2px 8px hsl(0 0% 0% / 0.4)',
        'node-active': '0 0 0 2px hsl(261 82% 65%), 0 0 24px hsl(261 82% 65% / 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
