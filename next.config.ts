import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
