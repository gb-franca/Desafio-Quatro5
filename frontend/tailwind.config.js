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
        brand: {
          yellow: '#f59e0b', // Amarelo de destaque
          darkBg: '#090a0f', // Fundo principal super escuro
          columnBg: '#10121a', // Fundo das colunas do Kanban
          cardBg: '#171923', // Fundo dos cards
          cardHover: '#202330', // Hover dos cards
          border: '#252936', // Bordas sutis
        }
      }
    },
  },
  plugins: [],
}
