/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/translate",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
