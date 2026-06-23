import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-backend-wasm",
    "@vladmandic/face-api",
  ],
  outputFileTracingIncludes: {
    "/api/admin/face-recognition/*": ["./public/models/face-api/**/*"],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/elenco",
        destination: "/jogadores",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
