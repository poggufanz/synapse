import type { Metadata } from "next";
import { Nunito, Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  title: "Synapse",
  description: "AI-Powered Energy Management",
  icons: {
    icon: "/images/LOGO.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} ${playfair.variable} ${merriweather.variable}`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
