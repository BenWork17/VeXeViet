/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vexeviet/ui'],
  eslint: {
    dirs: ['src'],
  },
}

module.exports = nextConfig
