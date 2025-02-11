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
  // サービスワーカーの登録
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service_worker.js")
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      })
      .catch((err) => {
        console.error("ServiceWorker registration failed: ", err);
      });
  }
  return (
    <html lang="en">
      <head>
        <link
          rel="manifest"
          href="/site.webmanifest"
          crossOrigin="use-credentials"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
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
