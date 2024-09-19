/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['via.placeholder.com', 'images.unsplash.com', 'www.pexels.com', 'images.pexels.com', 'challenges.cloudflare.com'],
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
    reactStrictMode: true,
    // Add this line for more detailed error messages during build
    productionBrowserSourceMaps: true,
}

module.exports = nextConfig