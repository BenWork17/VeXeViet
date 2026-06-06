/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vexeviet/types'],
  eslint: {
    dirs: ['src'],
  },
};

module.exports = nextConfig;
