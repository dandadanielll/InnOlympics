/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Cache emergency hotlines page
      urlPattern: /^https?.+\/emergency/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'emergency-pages',
        expiration: { maxEntries: 5, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      // Cache static assets
      urlPattern: /^https?.+\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Network-first for API calls (Gemini)
      urlPattern: /^https?.+\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

module.exports = withPWA(nextConfig);
