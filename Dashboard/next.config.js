/**
 * @type {import('next').NextConfig}
 */

const isProd = process.env.NODE_ENV === 'production'

const REQUIRED_CONFIG = {
  reactStrictMode: true, // true | false
  env: {
    SITE_NAME: 'HUSL',
    BASE_URL: process.env.BASE_URL || (isProd ? 'https://app.husl.xyz' : 'http://localhost:3000'),
    V2_URL: process.env.V2_URL,
    API_URL: process.env.API_URL || 'http://localhost:1337',
    WASABI_ACCESS_KEY_ID: process.env.WASABI_ACCESS_KEY_ID || 'LRX5ETQDPY5SD9STE7XE',
    WASABI_SECRET_ACCESS_KEY: process.env.WASABI_SECRET_ACCESS_KEY || 'CSln8krcaleRqzMZJ2PaFyvMeoH3AkWLzosHJfdW', // this shouldn't be in here
    WASABI_BUCKET: process.env.WASABI_BUCKET || 'husl-admin',
    WASABI_REGION: process.env.WASABI_REGION || 'us-central-1',
    TINYMCE_API_KEY: process.env.TINYMCE_API_KEY || 'drvfa50tba3nth0y4hsmghxkxgghnx4wj4hdo39kyvip6iyh',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    WEBHUSL_API_MASTER_KEY: process.env.WEBHUSL_API_MASTER_KEY,
    WEBHUSL_API_URL: process.env.WEBHUSL_API_URL || 'http://localhost:8000/api/v1',
    WEBHUSL_URL: process.env.WEBHUSL_URL || 'https://web.husl.app',
    WEBHUSL_PUBLIC_URL: process.env.WEBHUSL_PUBLIC_URL || 'https://web.husl.app/public',
    IMGLY_API_KEY: process.env.IMGLY_API_KEY,
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID || '203773490656-rqtktrlr2bp0lu49ntkgvrtj6rc1p4s0.apps.googleusercontent.com'
  },
  images: {
    domains: ['ui-avatars.com', 'cloudflare-ipfs.com', 's3.us-central-1.wasabisys.com', 'localhost', 'web.husl.app']
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: process.env.V2_URL,
  //       permanent: false,
  //       basePath: false
  //     }
  //   ]
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }

    return config
  }
}

// console.log('env', REQUIRED_CONFIG.env)

module.exports = REQUIRED_CONFIG
