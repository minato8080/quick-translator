import localFont from "next/font/local";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import { AlertProvider } from "@/provider/AlertProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Quick Translator",
  description: "A simple web text translator Japanese-English",
};
// Start of Selection

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
          <AlertProvider>
            {children}
            <Toaster />
          </AlertProvider>
        </main>
      </body>
    </html>
  );
}
