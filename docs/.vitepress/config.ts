import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'ChronoFrame',
  description: 'A Self-hosted photo gallery',
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Development', link: '/guide/contributing' },
      { text: 'Demo', link: 'https://lens.bh8.ga' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Update Guide', link: '/guide/updates' },
        ],
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Storage Providers', link: '/guide/storage-providers' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Contributing Guide', link: '/guide/contributing' },
          { text: 'API Documentation', link: '/guide/api' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HoshinoSuzumi/chronoframe' },
    ],

    editLink: {
      pattern:
        'https://github.com/HoshinoSuzumi/chronoframe/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Timothy Yin',
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      link: '/zh/',
    },
  },

  ignoreDeadLinks: [/^http?:\/\/localhost/],
})
