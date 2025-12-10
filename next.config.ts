  import type { NextConfig } from "next";
  import createNextIntlPlugin from 'next-intl/plugin';

  const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

  const nextConfig: NextConfig = {
    images: {
      // Allow Contentful and Cloudinary image domains so `next/image` can load remote images.
      domains: ['images.ctfassets.net', 'images.contentful.com', 'res.cloudinary.com'],
      // Set `unoptimized` to false so Next can optimize images locally in dev/prod.
      unoptimized: false,
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
