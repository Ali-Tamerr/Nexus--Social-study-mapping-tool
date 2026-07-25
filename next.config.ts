import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PRIVATE_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ""
    ).replace(/\/$/, "");

    if (!backendUrl) return [];

    return {
      beforeFiles: [],
      afterFiles: [
        // Proxy backend API calls, but EXCLUDE Next.js-hosted routes:
        // /api/auth/*, /api/debug-*, /api/profiles/*
        {
          source: "/api/:path((?!auth|debug-|profiles).*)",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
