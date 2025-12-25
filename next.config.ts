  import type { NextConfig } from "next";
  import createNextIntlPlugin from 'next-intl/plugin';

  const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

  const nextConfig: NextConfig = {
    images: {
      // Allow Contentful and Cloudinary image domains so `next/image` can load remote images.
      domains: ['images.ctfassets.net', 'images.contentful.com', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'cdnv2.tgdd.vn'],
      remotePatterns: [
        { protocol: 'https', hostname: 'images.ctfassets.net' },
        { protocol: 'https', hostname: 'images.contentful.com' },
        { protocol: 'https', hostname: 'res.cloudinary.com' },
        { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
        { protocol: 'https', hostname: 'graph.facebook.com' },
        { protocol: 'https', hostname: 'cdnv2.tgdd.vn' },
      ],
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
