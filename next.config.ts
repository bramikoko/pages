import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["10.170.162.225"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  cacheLife: {
    content: {
      stale: 60,
      revalidate: 60,
      expire: 86400,
    },
  },
};

export default nextConfig;
