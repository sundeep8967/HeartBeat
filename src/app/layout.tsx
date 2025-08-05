import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeartBeat - Where Corporate Hearts Meet",
  description: "A premium dating platform designed exclusively for corporate professionals. Find your perfect match who understands your ambition and lifestyle.",
  keywords: ["HeartBeat", "corporate dating", "professional dating", "executive dating", "career-minded singles", "marriage", "relationships"],
  authors: [{ name: "HeartBeat Team" }],
  openGraph: {
    title: "HeartBeat - Where Corporate Hearts Meet",
    description: "A premium dating platform designed exclusively for corporate professionals. Find your perfect match who understands your ambition and lifestyle.",
    url: "https://heartbeat.com",
    siteName: "HeartBeat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeartBeat - Where Corporate Hearts Meet",
    description: "A premium dating platform designed exclusively for corporate professionals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
