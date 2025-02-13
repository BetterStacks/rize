import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }

    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [{ hostname: "*" }],
  },
};

export default nextConfig;
