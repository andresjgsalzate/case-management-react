/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        complexity: {
          low: '#fef3c7',
          lowText: '#92400e',
          medium: '#fed7aa',
          mediumText: '#ea580c',
          high: '#fecaca',
          highText: '#dc2626',
        }
      },
    },
  },
  plugins: [],
}
