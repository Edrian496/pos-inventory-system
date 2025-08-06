import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },

  // Add other config options below if needed
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;
