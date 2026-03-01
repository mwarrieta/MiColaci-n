import type { NextConfig } from "next";

// Mi Colación v1.0 - Rediseño Dribbble completo
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
