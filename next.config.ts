import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "export",
    images: { unoptimized: true },
    experimental: {
        agentFeedback: true,
    },
    cacheComponents: false,
    partialPrefetching: false,
    allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
};

export default nextConfig;
