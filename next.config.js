/** @type {import('next').NextConfig} */
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
        serverActions: {
            // Accepte localhost en dev ET le domaine Vercel en production
            allowedOrigins: [
                'localhost:3000',
                process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || '',
            ].filter(Boolean),
        },
    },

    // Silence l'erreur webpack vs Turbopack liée à next-pwa
    turbopack: {},
}

module.exports = withPWA(nextConfig)