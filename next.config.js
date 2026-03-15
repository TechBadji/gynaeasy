/** @type {import('next').NextConfig} */
// Force rebuild: 2026-03-09T17:15:00Z
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    buildExcludes: [/middleware-manifest\.json$/]
})

const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: true,
    },
}

module.exports = withPWA(nextConfig)
