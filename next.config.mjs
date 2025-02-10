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
      {
        source: "/pwa/:path*",
        has: [{ type: "query", key: "redirect", value: "false", negate: true }],
        destination: "/pwa",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
