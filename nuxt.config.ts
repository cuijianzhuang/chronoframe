// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils'
  ],

  runtimeConfig: {
    S3_ENDPOINT: '',
    S3_BUCKET: '',
    S3_REGION: '',
    S3_ACCESS_KEY_ID: '',
    S3_SECRET_ACCESS_KEY: '',
    S3_PREFIX: '',
    S3_CDN_URL: '',
  },

  nitro: {},


  vite: {},
})