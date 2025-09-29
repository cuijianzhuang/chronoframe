import pkg from './package.json'
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
    'nuxt-og-image',
  ],

  css: ['~/assets/css/tailwind.css'],

  components: [{ path: '~/components/ui', pathPrefix: false }, '~/components'],

  runtimeConfig: {
    public: {
      VERSION: pkg.version,
      mapbox: {
        accessToken: '',
      },
      APP_TITLE: 'ChronoFrame',
      APP_SLOGAN: '',
      APP_AUTHOR: '',
      APP_AVATAR_URL: '/avatar.webp',
    },
    MAPBOX_ACCESS_TOKEN: '',
    STORAGE_PROVIDER: 's3',
    PROVIDER_S3_ENDPOINT: '',
    PROVIDER_S3_BUCKET: '',
    PROVIDER_S3_REGION: '',
    PROVIDER_S3_ACCESS_KEY_ID: '',
    PROVIDER_S3_SECRET_ACCESS_KEY: '',
    PROVIDER_S3_PREFIX: '',
    PROVIDER_S3_CDN_URL: '',
    ALLOW_INSECURE_COOKIE: false,
  },

  nitro: {
    preset: 'node_server',
    experimental: {
      tasks: true,
    },
  },

  vite: {
    plugins: [tailwindcss() as any],
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: false,
    },
  },

  colorMode: {
    preference: 'dark',
  },

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  ogImage: {
    fonts: ['Rubik:400', 'Rubik:700', 'Noto+Sans+SC:400', 'Noto+Sans+SC:700'],
    googleFontMirror: true,
  },

  dayjs: {
    locales: ['zh-cn', 'zh-hk', 'en'],
    plugins: [
      'relativeTime',
      'utc',
      'timezone',
      'duration',
      'localizedFormat',
      'isBetween',
    ],
    defaultTimezone: 'Asia/Shanghai',
  },

  i18n: {
    detectBrowserLanguage: {
      fallbackLocale: 'en',
      useCookie: false,
      cookieKey: 'chronoframe-locale',
    },
    strategy: 'no_prefix',
    locales: [
      {
        code: 'zh-Hans',
        name: '简体中文',
        file: 'zh-Hans.json',
        language: 'zh',
      },
      {
        code: 'zh-Hant-TW',
        name: '繁体中文(台湾)',
        file: 'zh-Hant-TW.json',
        language: 'zh-TW',
      },
      {
        code: 'zh-Hant-HK',
        name: '繁体中文(香港)',
        file: 'zh-Hant-HK.json',
        language: 'zh-HK',
      },
      { code: 'en', name: 'English', file: 'en.json', language: 'en' },
      { code: 'ja', name: '日本語', file: 'ja.json', language: 'ja' },
    ],
  },
})
