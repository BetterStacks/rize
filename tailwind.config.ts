import type { Config } from 'tailwindcss'
import scrollbarHide from 'tailwind-scrollbar-hide'
export default {
	darkMode: ['class'],
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// Rize tokens (src/styles/tokens.css). Prefer these in new work.
				ground: 'rgb(var(--ground) / <alpha-value>)',
				surface: 'rgb(var(--surface) / <alpha-value>)',
				subtle: 'rgb(var(--subtle) / <alpha-value>)',
				ink: {
					DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
					secondary: 'rgb(var(--ink-secondary) / <alpha-value>)',
				},
				'on-ink': 'rgb(var(--on-ink) / <alpha-value>)',
				hairline: 'rgb(var(--hairline) / <alpha-value>)',
				brand: {
					DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
					ink: 'rgb(var(--brand-ink) / <alpha-value>)',
				},
				danger: 'rgb(var(--danger) / <alpha-value>)',
				success: 'rgb(var(--success) / <alpha-value>)',
				paper: {
					DEFAULT: 'rgb(var(--paper) / <alpha-value>)',
					border: 'rgb(var(--paper-border) / <alpha-value>)',
				},
				highlight: 'rgb(var(--highlight) / <alpha-value>)',
				// Dim layer behind dialogs; opacity is part of the token.
				overlay: 'rgb(var(--overlay) / var(--overlay-opacity))',
				// Legacy names, kept so existing classes still work. dark-bg and
				// dark-border match the dark ground and hairline tokens.
				'dark-border': '#2C2C31',
				'dark-bg': '#111113',
				'light-bg': '#ffffff',
				'main-yellow': '#FFF176',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			screens: {
				'4k': '2560px'
			},
			fontFamily: {
				inter: [
					'var(--font-inter)',
					'sans-serif'
				],
				instrument: [
					'var(--font-instrument)',
					'serif'
				]
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			// One radius scale: 8 (rounded-lg) for controls, 12 (rounded-xl) for
			// fields, menus and toasts, 20 (rounded-2xl) for dialogs and cards.
			// rounded-md / rounded-sm stay at 6 / 4 for existing code only.
			borderRadius: {
				lg: 'var(--radius-sm)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'var(--radius-md)',
				'2xl': 'var(--radius-lg)',
			},
			boxShadow: {
				float: 'var(--shadow-float)',
				raised: 'var(--shadow-raised)',
			},
			transitionTimingFunction: {
				calm: 'var(--ease-calm)',
			},
			transitionDuration: {
				fast: 'var(--duration-fast)',
				base: 'var(--duration-base)',
			},
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography'), scrollbarHide],
} satisfies Config
