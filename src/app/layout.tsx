import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
