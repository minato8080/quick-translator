/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
