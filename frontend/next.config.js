const { NextConfig } = require("next");

/** @type {NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["picsum.photos", "images.unsplash.com", "lh3.googleusercontent.com", "*.s3.amazonaws.com", "*.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
