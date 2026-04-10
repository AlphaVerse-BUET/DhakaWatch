import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NodiWatch — AI-Powered River Surveillance for Bangladesh",
  description:
    "Satellite-powered river monitoring for Bangladesh — detecting pollution, encroachment, and erosion using spectral indices, SAR, and AI analysis",
  keywords: [
    "NodiWatch",
    "Bangladesh",
    "River",
    "Pollution",
    "Satellite",
    "Encroachment",
    "Erosion",
    "AI",
    "GEE",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-navy-900 text-slate-100 antialiased">
        <Navbar />
        <main className="min-h-screen-nav pt-16">{children}</main>
        <Footer />
        <AIChatbot />
      </body>
    </html>
  );
}
