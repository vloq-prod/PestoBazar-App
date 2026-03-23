/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: "#3a286c",
          light: "#4e3a8e",
          dark: "#261b4a",
          muted: "#5c4a9e",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e10320",
          light: "#ff1a35",
          dark: "#b8021a",
          muted: "#ff4d61",
          foreground: "#ffffff",
        },
        // Semantic surface tokens (map to CSS vars for dark/light switching)
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "app-text": "var(--color-text)",
        "app-text-secondary": "var(--color-text-secondary)",
        border: "var(--color-border)",
      },
      fontFamily: {
        sans: ["Poppins_400Regular", "System"],
        "poppins-light": ["Poppins_300Light"],
        poppins: ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
        "poppins-extrabold": ["Poppins_800ExtraBold"],
        "poppins-italic": ["Poppins_400Regular_Italic"],
        "poppins-medium-italic": ["Poppins_500Medium_Italic"],
        "poppins-semibold-italic": ["Poppins_600SemiBold_Italic"],
        "poppins-bold-italic": ["Poppins_700Bold_Italic"],
      },
    },
  },
  plugins: [],
};
