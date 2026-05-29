import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import NavBar from "@/components/NavBar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PubliGen — Generador de publicaciones",
  description: "Generá publicaciones para Mercado Libre, Amazon, Facebook Marketplace y OLX con IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body>
        <Suspense fallback={<div style={{ height: 56 }} />}>
          <NavBar />
        </Suspense>
        <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px 80px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
