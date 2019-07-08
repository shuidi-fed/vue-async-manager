const { resolve } = require('path')

module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'vue-suspense',
      description: 'Manage asynchronous calls more easily in Vue apps'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'vue-suspense',
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
        ]
      },
      '/zh/': {
        label: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        sidebar: [
          ['/zh/guide', '指南']
        ]
      }
    },
    repo: 'shuidi-fed/vue-suspense',
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
