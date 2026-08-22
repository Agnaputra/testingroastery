/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'nircoffee.id',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Use memory cache during development on Windows to prevent PackFileCacheStrategy ENOENT lock errors
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
