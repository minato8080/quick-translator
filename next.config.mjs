/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
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
