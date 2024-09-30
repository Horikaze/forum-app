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
    themes: ["dim", "black", "light", "cupcake", "retro"],
  },
  darkMode: [
    "variant",
    [
      '&:is([data-theme="dark"] *)',
      '&:is([data-theme="dim"] *)',
      '&:is([data-theme="black"] *)',
    ],
  ],
};
export default config;
// DEFAULT: theme("colors.accent / 20%"),
