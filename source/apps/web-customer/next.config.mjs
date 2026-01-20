/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Allow build to succeed with ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
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
