/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'its-fine'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    // Handle the its-fine module resolution
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    return config;
  },
}

module.exports = nextConfig
