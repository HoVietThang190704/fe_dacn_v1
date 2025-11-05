  import type { NextConfig } from "next";
  import createNextIntlPlugin from 'next-intl/plugin';

  const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

  const nextConfig: NextConfig = {
    images: {
      unoptimized: true, // Tắt image optimization để fix lỗi
    },
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
        {
          source: "/socket.io/:path*",
          destination: "http://localhost:5000/socket.io/:path*",
        },
      ];
    },
  };

  export default withNextIntl(nextConfig);
