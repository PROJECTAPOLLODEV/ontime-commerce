import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds (warnings won't block deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds (for faster deployments)
    // Type errors will still show in development
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.cloverimaging.com",
        pathname: "/imagebp/**",
      },
      {
        protocol: "https",
        hostname: "cloverimaging.com",
        pathname: "/imagebp/**",
      },
    ],
  },
};

export default nextConfig;
