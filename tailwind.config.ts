import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./mdx-components.tsx"],
  theme: {
    container: {
      center: true,
      // screens: {
      //   lg: "976px",
      //   xl: "1440px",
      // },
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["dim", "dark", "black", "light", "valentine", "cupcake", "retro"],
    darkTheme: "dim",
  },
};
export default config;
// DEFAULT: theme("colors.accent / 20%"),
