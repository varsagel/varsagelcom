/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
  // Ensure Prisma binaries are included in the build
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig