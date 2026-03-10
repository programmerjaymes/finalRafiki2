import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  
  // Add redirects for business-owner routes
  async redirects() {
    return [
      {
        source: '/business-owner/dashboard',
        destination: '/business-dashboard',
        permanent: true,
      },
      {
        source: '/business-owner/my-businesses',
        destination: '/business-my-businesses',
        permanent: true,
      },
      {
        source: '/business-owner/create-business',
        destination: '/business-create',
        permanent: true,
      },
      {
        source: '/business-owner/instructions',
        destination: '/business-instructions',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
