import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tourism/contracts",
    "@tourism/validation",
    "@tourism/config",
    "@tourism/ui",
  ],
};

export default nextConfig;
