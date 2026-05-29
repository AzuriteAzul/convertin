import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow serving the pdfjs-dist worker from node_modules
  // better-sqlite3 is a native module that must be externalized
  serverExternalPackages: ["pdfjs-dist", "better-sqlite3"],
};

export default nextConfig;