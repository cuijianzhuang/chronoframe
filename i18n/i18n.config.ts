export default defineI18nConfig(() => {
  return {
    fallbackLocale: {
      'zh-Hant': ['zh-Hant-TW', 'zh-Hant-HK'],
      'zh-TW': ['zh-Hant-TW'],
      'zh-HK': ['zh-Hant-HK'],
      'zh': ['zh-Hans'],
      'default': ['en'],
    },
  }
})
