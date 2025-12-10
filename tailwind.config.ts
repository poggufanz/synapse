import type { Config } from "tailwindcss";

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
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px) scale(0.95)" },
                    "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
                    "25%": { transform: "translateY(-10px) translateX(5px)" },
                    "50%": { transform: "translateY(-5px) translateX(-5px)" },
                    "75%": { transform: "translateY(-15px) translateX(3px)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.5s ease-out",
                slideDown: "slideDown 0.5s ease-out",
                slideUp: "slideUp 0.4s ease-out",
                float: "float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
export default config;
