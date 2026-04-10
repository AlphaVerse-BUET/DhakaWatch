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
  title: "DhakaWatch — Urban Digital Twin for Dhaka",
  description:
    "Satellite-powered urban intelligence for Dhaka — monitoring heat, waterlogging, canal health, and citizen reports from space",
  keywords: [
    "DhakaWatch",
    "Bangladesh",
    "Dhaka",
    "Satellite",
    "Waterlogging",
    "Encroachment",
    "Canal",
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
