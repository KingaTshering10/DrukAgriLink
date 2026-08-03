import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // forest green primary, warm cream surfaces, Bhutan accent hints
        forest: { DEFAULT: "#1f5c3d", dark: "#164430", light: "#e4efe7" },
        cream: "#faf7f0",
        saffron: "#f4a300",
        marigold: "#e8722b",
        crimson: "#b5322e",
      },
    },
  },
  plugins: [],
};
export default config;
