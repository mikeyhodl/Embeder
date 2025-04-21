/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;

module.exports = {
  experimental: {
    optimizePackageImports: [
      '@prisma/client',
    ]
  },
  images: {
    domains: [
      "images.unsplash.com",
      "image.tmdb.org",
      "ik.imagekit.io",
      "res.cloudinary.com",
    ],
    unoptimized: true,
  },
};
