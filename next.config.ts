import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/researchai', 
        destination: '/ai.html',
      },
    ];
  },
};

export default nextConfig;
