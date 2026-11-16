/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "duna al atardecer": noche del desierto + arena + dos acentos
        // de pista (ámbar para dromedarios, verde pino para los enanos mineros).
        dune: {
          950: "#171310", // fondo noche
          900: "#231C16",
          800: "#332920",
          700: "#4A3B2C",
        },
        sand: {
          100: "#F6EFE2",
          200: "#EDE1CB",
          300: "#DCC9A3",
        },
        amber: {
          400: "#E3B04B",
          500: "#CC9633",
          600: "#A87524",
        },
        pine: {
          500: "#3F6858",
          600: "#2E4E42",
        },
        clay: {
          500: "#B33A3A",
          600: "#8F2C2C",
        },
      },
      fontFamily: {
        display: ["\"Fraunces\"", "serif"],
        body: ["\"Inter\"", "sans-serif"],
      },
    },
  },
  plugins: [],
};
