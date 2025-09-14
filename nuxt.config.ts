import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: [
    'reka-ui/nuxt',
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    'motion-v/nuxt',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/i18n',
    'nuxt-mapbox',
  ],

  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    public: {
      APP_TITLE: 'ChronoFrame',
      APP_SLOGAN: '',
      APP_AVATAR_URL: '/avatar.webp',
    },
    STORAGE_PROVIDER: 's3',
    PROVIDER_S3_ENDPOINT: '',
    PROVIDER_S3_BUCKET: '',
    PROVIDER_S3_REGION: '',
    PROVIDER_S3_ACCESS_KEY_ID: '',
    PROVIDER_S3_SECRET_ACCESS_KEY: '',
    PROVIDER_S3_PREFIX: '',
    PROVIDER_S3_CDN_URL: '',
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
    preference: 'dark',
  },

  dayjs: {
    locales: ['zh-cn', 'zh-hk', 'en'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'localizedFormat'],
    defaultTimezone: 'Asia/Shanghai',
  },

  i18n: {
    detectBrowserLanguage: {
      fallbackLocale: 'en',
      useCookie: false,
    },
    strategy: 'no_prefix',
    locales: [
      { code: 'zh-Hans', name: '简体中文', file: 'zh-Hans.json' },
      { code: 'zh-Hant', name: '繁体中文', file: 'zh-Hant.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
  },

  mapbox: {
    accessToken: process.env.MAPBOX_TOKEN || '',
  },
})
