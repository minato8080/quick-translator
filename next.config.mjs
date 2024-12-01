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
};

export default nextConfig;
