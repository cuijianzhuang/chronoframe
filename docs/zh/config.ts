import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'ChronoFrame',
  description: '自部署、在线管理的个人画廊',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/zh/guide/getting-started' },
      { text: '演示', link: 'https://lens.bh8.ga' },
    ],

    sidebar: [
      {
        text: '指南',
        items: [{ text: '快速开始', link: '/zh/guide/getting-started' }],
      },
    ],

    editLink: {
      text: '在 GitHub 上编辑此页面',
    },
  },
})
