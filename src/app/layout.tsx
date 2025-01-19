import localFont from "next/font/local";

import Providers from "./providers";

import type { Metadata } from "next";

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
  title: "Quick翻訳/単語帳",
  description: "A simple web text translator Japanese-English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*iOS用*/}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/*Android用*/}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
