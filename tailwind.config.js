/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx,vue}",
    "./vue-project/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Noto Serif SC", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        amber: {
          50: "var(--amber-50)",
          100: "var(--amber-100)",
          200: "var(--amber-200)",
          300: "var(--amber-300)",
          400: "var(--amber-400)",
          500: "var(--amber-500)",
          600: "var(--amber-600)",
          700: "var(--amber-700)",
        },
        teal: {
          50: "var(--teal-50)",
          100: "var(--teal-100)",
          200: "var(--teal-200)",
          300: "var(--teal-300)",
          400: "var(--teal-400)",
          500: "var(--teal-500)",
          600: "var(--teal-600)",
          700: "var(--teal-700)",
        },
        emerald: {
          50: "var(--emerald-50)",
          100: "var(--emerald-100)",
          500: "var(--emerald-500)",
          600: "var(--emerald-600)",
          700: "var(--emerald-700)",
        },
        orange: {
          100: "var(--orange-100)",
          700: "var(--orange-700)",
        },
        yellow: {
          100: "var(--yellow-100)",
          700: "var(--yellow-700)",
        },
        blue: {
          50: "var(--blue-50)",
          500: "var(--blue-500)",
        },
        purple: {
          50: "var(--purple-50)",
          500: "var(--purple-500)",
        },
        red: {
          100: "var(--red-100)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}


