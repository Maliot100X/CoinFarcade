/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/manifest",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/manifest",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
  images: {
    domains: ["cdn-production-opera-website.operacdn.com"],
  },
};

module.exports = nextConfig;
