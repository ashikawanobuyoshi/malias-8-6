// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  ssr: true,
  target: 'server',

  nitro: {
    prerender: {
      ignore: [
        '/', // もしトップもサーバーAPI依存なら除外
        '/product-details/**'
      ],
      crawlLinks: true,
      routes: [
        '/',
        '/favorites',
        '/product-details/1',
        '/product-details/2',
        '/product-details/3',
        '/product-details/4',
        '/product-details/5',
        '/product-details/6',
        '/product-details/7',
        '/product-details/8',
        '/product-details/9',
        '/product-details/10'
      ]
    }
  },

  app: {
    baseURL: '/',
    trailingSlash: true
  },

  experimental: {
    renderJsonPayloads: false
  },

  runtimeConfig: {
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    s3BucketName: process.env.S3_BUCKET_NAME,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,

    public: {}
  },

  future: { compatibilityVersion: 4 },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  pinia: {
    autoImports: ['defineStore', 'storeToRefs', 'acceptHMRUpdate']
  },

  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },

  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, '.'),
        '~': resolve(__dirname, '.'),
        '~~': resolve(__dirname, '.'),
        '@assets': resolve(__dirname, 'assets')
      }
    },
    server: {
      host: 'localhost',
      port: 3000,
      hmr: { host: 'localhost', port: 3000 }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  css: [
    '@assets/css/main.css',
    '@assets/css/variables.css',
    '@assets/css/tailwind.css',
    '@assets/css/print.css'
  ],

  routeRules: {
    '/favorites/**': { prerender: false }
  }
})
