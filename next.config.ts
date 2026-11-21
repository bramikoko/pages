import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["10.73.112.88"],
};

export default nextConfig;
