/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.themealdb.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Disable source maps in development to avoid mappings.wasm errors
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable source maps in development to prevent mappings.wasm errors
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
