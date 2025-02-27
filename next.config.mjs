/** @type {import('next').NextConfig} */
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = withPWA({
  reactStrictMode: true,
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/translate",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [{ source: "/pwa/(.*)", destination: "/pwa/" }];
  },
});

export default nextConfig;
