import type { NextConfig } from "next";
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Fix for 'self is not defined' error
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Define global variables for server-side
       config.plugins.push(
         new webpack.DefinePlugin({
           'typeof window': JSON.stringify('undefined'),
           'typeof self': JSON.stringify('undefined'),
           'typeof global': JSON.stringify('object'),
         })
       );

      // Copy Prisma query engine for Vercel deployment
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@prisma\/client$/,
          require.resolve('@prisma/client')
        )
      );
      
      // Copy Prisma binaries for Vercel
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: 'node_modules/.prisma/client/libquery_engine-*',
              to: '.next/server/',
              noErrorOnMissing: true,
            },
            {
              from: 'node_modules/@prisma/engines/libquery_engine-*',
              to: '.next/server/',
              noErrorOnMissing: true,
            },
            {
              from: 'node_modules/.prisma/client/schema.prisma',
              to: '.next/server/',
              noErrorOnMissing: true,
            },
          ],
        })
      );
      
      // Ensure Prisma client is externalized for serverless
      if (!dev) {
        config.externals = config.externals || [];
        config.externals.push('@prisma/client');
      }
    }
    
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react',
      '@prisma/client'
    ],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
             key: 'Permissions-Policy',
             value: 'camera=(), microphone=(), geolocation=()',
           },
           {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
           },
           {
             key: 'Strict-Transport-Security',
             value: 'max-age=31536000; includeSubDomains',
           },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
