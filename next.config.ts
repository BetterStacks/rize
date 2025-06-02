import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias["yjs"] = path.resolve(__dirname, "node_modules/yjs");
      config.resolve.alias["react-joyride"] =
        "react-joyride/dist/react-joyride.js";
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [{ hostname: "*" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;

// import type { NextConfig } from "next";
// import path from "node:path";

// const nextConfig: NextConfig = {
//   /* config options here */
//   webpack: (config, { isServer }) => {
//     // Fixes npm packages that depend on `fs` module
//     if (!isServer) {
//       config.resolve.alias["yjs"] = path.resolve(__dirname, "node_modules/yjs");
//       config.node = {
//         fs: "empty",
//       };
//     }

//     return config;
//   },
//   images: {
//     dangerouslyAllowSVG: true,
//     remotePatterns: [{ hostname: "*" }],
//   },
//   experimental: {
//     serverActions: {
//       bodySizeLimit: "3mb",
//     },
//   },
// };

// export default nextConfig;
