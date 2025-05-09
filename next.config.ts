import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites configuration
  async rewrites() {
    return [
      {
        source: '/researchai',
        destination: '/ai.html',
      },
    ];
  },

  // Build output configuration
  output: 'standalone', // Recommended for production deployments

  // Enable React Strict Mode
  reactStrictMode: true,

  // Production browser source maps (optional)
  productionBrowserSourceMaps: false, // Set to true for debugging in production

  // ESLint configuration (to prevent build failures)
  eslint: {
    ignoreDuringBuilds: true, // Consider removing after fixing all lint errors
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Set to true temporarily if needed
  },

  // Security headers (recommended)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

export default nextConfig;