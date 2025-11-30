import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from Imgix and other common sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.imgix.net",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co", // Spotify album covers
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org", // Wikipedia icons
      },
      {
        protocol: "https",
        hostname: "substackcdn.com", // Substack icons
      },
    ],
  },
};

export default nextConfig;
