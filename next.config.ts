import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "localhost",
        port: "7083",
        pathname: "/uploads/**"
      },
      {protocol: "http",
        hostname: "171.244.143.241",
        port: "8888",
        pathname: "/uploads/**"
      }
    ],
  },
};

export default withNextIntl(nextConfig);