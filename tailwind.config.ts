import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "focus-blue": "#3B82F6",
                "focus-orange": "#F97316",
                "focus-white": "#FFFFFF",
                "rest-cream": "#FDFBF7",
                "rest-sage": "#8DA399",
                "rest-sage-dark": "#4A5D53",
            },
            fontFamily: {
                sans: ["Nunito", "sans-serif"],
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(0)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.5s ease-out",
                slideDown: "slideDown 0.5s ease-out",
            },
        },
    },
    plugins: [typography],
};
export default config;
