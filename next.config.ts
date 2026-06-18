import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
