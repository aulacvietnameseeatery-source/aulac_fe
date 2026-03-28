import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {

  async redirects() {
    return [
      {
        source: "/:locale(en|fr|vi)/dashboard/ingredients/:path*",
        destination: "/:locale/dashboard/inventory/items",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|vi)/dashboard/stock/:path*",
        destination: "/:locale/dashboard/inventory/items",
        permanent: true,
      },
      {
        source: "/dashboard/ingredients/:path*",
        destination: "/dashboard/inventory/items",
        permanent: true,
      },
      {
        source: "/dashboard/stock/:path*",
        destination: "/dashboard/inventory/items",
        permanent: true,
      },
    ];
  },

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
      },
      {
        protocol: "https",
        hostname: "api.anlacviet.ch",
        port: "8443",
        pathname: "/uploads/**",
      }
    ],
  },
};

export default withNextIntl(nextConfig);