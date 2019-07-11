const { resolve } = require('path')

module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'vue-async-manager',
      description: 'Manage asynchronous calls more easily in Vue apps'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'vue-async-manager',
      description: '在 Vue 应用中更轻松的管理异步调用'
    }
  },
  themeConfig: {
    displayAllHeaders: true,
    sidebarDepth: 2,
    locales: {
      '/': {
        label: 'English',
        sidebar: [
          '/'
        ],
        nav: [
          { text: 'Guide', link: '/guide' },
          { text: 'API', link: '/api' },
          { text: 'Live demo', link: '/demo' }
        ]
      },
      '/zh/': {
        label: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        sidebar: [
          ['/zh/guide', '指南']
        ],
        nav: [
          { text: '指南', link: '/zh/guide' },
          { text: 'API', link: '/zh/api' },
          { text: '在线演示', link: '/zh/demo' }
        ]
      }
    },
    repo: 'shuidi-fed/vue-async-manager',
    docsDir: 'docs',
    editLinks: true,
    sidebar: 'auto'
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@imgs': resolve(__dirname, './assets/imgs')
      }
    }
  }
}
