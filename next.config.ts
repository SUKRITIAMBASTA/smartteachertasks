import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevents Next.js from trying to bundle these CJS-only server packages
  serverExternalPackages: ['pdf-parse'],
  // Required to silence the Turbopack/webpack warning in Next.js 16
  turbopack: {},
};

export default nextConfig;
