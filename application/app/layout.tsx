import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.tw.css";
import QueryProvider from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Musyncc",
  description: "🎵Sync your music experience.🎶",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mb-0 pb-0`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
