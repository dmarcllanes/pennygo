/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['via.placeholder.com', 'images.unsplash.com', 'www.pexels.com', 'images.pexels.com'],
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          crypto: false,
        };
      }
      return config;
    },
  }
  
  module.exports = nextConfig