/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow analysis of external domains
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
  // Vercel serverless timeout
  serverRuntimeConfig: {
    maxDuration: 30,
  },
  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: ['cheerio'],
  },
  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },
  // Redirects: canonical path
  async redirects() {
    return []
  },
}

module.exports = nextConfig
