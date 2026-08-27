import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1720",
        paper: "#f7f8fa",
        accent: "#1d4ed8",
        accent2: "#0f766e",
        line: "#e2e5ea",
      },
    },
  },
  plugins: [],
};
export default config;
