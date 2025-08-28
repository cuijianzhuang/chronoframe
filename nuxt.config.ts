import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    'motion-v/nuxt',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    'dayjs-nuxt',
    'nuxt-mapbox'
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

  nitro: {
    preset: 'node_server',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  vite: {
    plugins: [tailwindcss() as any],
  },

  colorMode: {
    preference: 'dark'
  },

  dayjs: {
    locales: ['zh-cn', 'en'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'zh-cn',
    defaultTimezone: 'Asia/Shanghai'
  },

  mapbox: {
    accessToken: process.env.MAPBOX_TOKEN || ''
  },
})