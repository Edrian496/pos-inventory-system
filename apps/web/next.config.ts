import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next.config.js
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      stream: false,
      buffer: false,
    };
  }
  return config;
}

  /* config options here */
};

export default nextConfig;
