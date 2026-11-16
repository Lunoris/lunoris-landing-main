import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  // The Retro Games world was renamed to Retro Levels; keep old links working.
  async redirects() {
    return [
      { source: "/retro-games", destination: "/retro-levels", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: http:; media-src 'self' blob: https: http:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
