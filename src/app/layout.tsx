import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatbotWidgetWrapper from "@/components/chatbot/ChatbotWidgetWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SB Project | Special Needs Support",
  description: "A comprehensive educational and therapeutic ecosystem connecting beneficiaries with verified specialists. Built on trust, quality, and measurable progress.",
  keywords: "special needs, therapy, autism, ADHD, speech therapy, IEP, education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} data-theme="parent" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans relative">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ChatbotWidgetWrapper />
        <AccessibilityToolbar />
      </body>
    </html>
  );
}
