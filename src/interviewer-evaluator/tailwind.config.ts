import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          blue: "#44546A",
          "blue-hover": "#374759",
        },
        teal: {
          1: "#37B3A2",
          2: "#9FE2D8",
          3: "#EAFDF8",
        },
        orange: {
          1: "#E7792B",
          2: "#EE9F2D",
          3: "#F7C85E",
        },
        "logo-grey": "#7C95A5",
        grey: {
          1: "#808083",
          2: "#D2DDE8",
        },
        surface: "#F8FAFC",
        "sidebar-bg": "#F1F5F9",
        error: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-libre-franklin)", "system-ui", "sans-serif"],
      },
      width: {
        sidebar: "280px",
      },
      maxWidth: {
        chat: "768px",
      },
      height: {
        header: "64px",
      },
      spacing: {
        sidebar: "280px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
