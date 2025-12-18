/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@packages/ui", "@packages/dto"],

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: "TKOB Admin",
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["@packages/ui"],
  },

  // Redirects: Map old routes to new /admin/* routes
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/menu",
        destination: "/admin/menu",
        permanent: true,
      },
      {
        source: "/menu-modifiers",
        destination: "/admin/menu-modifiers",
        permanent: true,
      },
      {
        source: "/tables",
        destination: "/admin/tables",
        permanent: true,
      },
      {
        source: "/table-qr-detail",
        destination: "/admin/table-qr-detail",
        permanent: true,
      },
      {
        source: "/orders",
        destination: "/admin/orders",
        permanent: true,
      },
      {
        source: "/analytics",
        destination: "/admin/analytics",
        permanent: true,
      },
      {
        source: "/staff",
        destination: "/admin/staff",
        permanent: true,
      },
      {
        source: "/tenant-profile",
        destination: "/admin/tenant-profile",
        permanent: true,
      },
      // Removed /kds and /service-board redirects - these are now standalone routes
    ];
  },
};

export default nextConfig;
