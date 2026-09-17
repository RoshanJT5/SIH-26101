import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok-free.dev",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  async rewrites() {
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://sih-26101-bb667c1b.fastapicloud.dev/api/v1";
    const cleanUrl = rawBackendUrl.trim().replace(/\/+$/, "");
    const dest = cleanUrl.endsWith("/api/v1")
      ? `${cleanUrl}/:path*`
      : `${cleanUrl}/api/v1/:path*`;

    return [
      {
        source: "/api/v1/:path*",
        destination: dest,
      },
    ];
  },
};

export default nextConfig;
