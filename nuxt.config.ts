import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    'motion-v/nuxt',
    '@nuxthub/core',
  ],

  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    STORAGE_PROVIDER: 's3',
    PROVIDER_S3_ENDPOINT: '',
    PROVIDER_S3_BUCKET: '',
    PROVIDER_S3_REGION: '',
    PROVIDER_S3_ACCESS_KEY_ID: '',
    PROVIDER_S3_SECRET_ACCESS_KEY: '',
    PROVIDER_S3_PREFIX: '',
    PROVIDER_S3_CDN_URL: '',
    CLOUDFLARE_API_TOKEN: '',
    CLOUDFLARE_D1_UUID: '',
  },

  hub: {
    database: true,
    blob: true,
  },

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  vite: {
    plugins: [tailwindcss() as any],
  },
})
