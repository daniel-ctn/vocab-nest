import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vocab-nest/contracts"],
  serverExternalPackages: ["pg"],
};

export default nextConfig;
