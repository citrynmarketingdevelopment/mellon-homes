import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [{ source: "/home2", destination: "/", permanent: true }, { source: "/home3", destination: "/", permanent: true }];
  },
};

export default nextConfig;
