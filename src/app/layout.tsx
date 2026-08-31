import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "DarGlobal & Wasalt AI Assistant | Luxury Real Estate Chatbot",
  description:
    "AI-powered chatbot for Dar Global and Wasalt. Get instant answers about luxury real estate projects, branded residences, investment opportunities across Dubai, Saudi Arabia, Oman, Spain, Qatar, Maldives and London.",
  keywords:
    "Dar Global, Wasalt, luxury real estate, Dubai properties, branded residences, AI chatbot, property investment",
  openGraph: {
    title: "DarGlobal & Wasalt AI Assistant",
    description:
      "Your AI-powered luxury real estate concierge. Ask about properties, projects, and investment opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
