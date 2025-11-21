/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@packages/ui', '@packages/dto'],
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'TKOB Order',
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['@packages/ui'],
  },
};

export default nextConfig;
