/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Vercel serverless functions
  images: {
    domains: [
      'images.unsplash.com',
      'image.tmdb.org',
      'ik.imagekit.io',
      'res.cloudinary.com',
    ],
    unoptimized: true,
  },
  experimental: {
    // Prevent Prisma from being tree-shaken in server components
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', '/prisma/generated/client'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma engine files are copied
      config.resolve.alias['@prisma/client'] = require.resolve('@prisma/client');
      config.resolve.alias['./prisma/generated/client'] = require.resolve('./prisma/generated/client');
      config.module.rules.push({
        test: /\.node$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '.prisma/client', // Copy to .next/.prisma/client
              publicPath: '/_next/.prisma/client',
            },
          },
        ],
      });
    }
    return config;
  },
};

module.exports = nextConfig;