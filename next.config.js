/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.scdn.co', 'platform-lookaside.fbsbx.com', 'mosaic.scdn.co'],
  },
  typescript: {
    ignoreBuildErrors: false, // Set to true only for development
  },
}

module.exports = nextConfig 