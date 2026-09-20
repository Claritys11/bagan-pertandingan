import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MEC MLBB Championship 2026 — Tournament Operations & Live Bracket",
  description:
    "Official Mobile Legends: Bang Bang Tournament Operations Platform. Real-time bracket progression, match schedules, referee assignments, and tournament transparency.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#07090e] text-slate-100 antialiased flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
