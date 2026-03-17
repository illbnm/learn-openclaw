import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig } from 'vitepress'

const siteTitle = '从零构建 OpenClaw'
const siteDescription = '个人 AI 助手网关源码剖析与实战'
const bookRepository = 'https://github.com/qqzhangyanhua/learn-openclaw'
const sourceRepository = 'https://github.com/openclaw/openclaw/tree/main'

export default withMermaid(defineConfig({
  srcDir: 'docs',
  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',
  lastUpdated: true,
  
  transformPageData(pageData) {
    const pageTitle = pageData.frontmatter.layout === 'home'
      ? siteTitle
      : pageData.title
        ? `${pageData.title} | ${siteTitle}`
        : siteTitle
    const pageDescription = typeof pageData.description === 'string' && pageData.description
      ? pageData.description
      : siteDescription

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }]
    )
  },

  vite: {
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler'
        }
      }
    },
    optimizeDeps: {
      include: ['mermaid', 'dayjs'],
      esbuildOptions: {
        tsconfigRaw: {
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler'
          }
        }
      }
    },
    ssr: {
      noExternal: ['mermaid']
    }
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '阅读地图', link: '/reading-map' },
      { text: '版本说明', link: '/version-notes' },
      { text: '术语表', link: '/glossary' },
      { text: '本书仓库', link: bookRepository },
      { text: '源码仓库', link: sourceRepository }
    ],

    sidebar: [
      { text: '阅读地图', link: '/reading-map' },
      { text: '版本说明', link: '/version-notes' },
      { text: '术语表', link: '/glossary' },
      {
        text: '第一部分：基础认知',
        collapsed: false,
        items: [
          { text: '第1章：OpenClaw 是什么', link: '/00-intro/' },
          { text: '第2章：项目结构', link: '/01-structure/' },
          { text: '第3章：核心概念', link: '/02-concepts/' },
        ]
      },
      {
        text: '第二部分：核心运行时',
        collapsed: false,
        items: [
          { text: '第4章：Gateway 网关', link: '/03-gateway/' },
          { text: '第5章：Agent 代理', link: '/04-agent/' },
          { text: '第6章：消息路由', link: '/05-routing/' },
        ]
      },
      {
        text: '第三部分：消息通道',
        collapsed: false,
        items: [
          { text: '第7章：通道系统', link: '/06-channels/' },
          { text: '第8章：内置通道', link: '/07-builtins/' },
          { text: '第9章：扩展开发', link: '/08-extensions/' },
        ]
      },
      {
        text: '第四部分：模型与工具',
        collapsed: false,
        items: [
          { text: '第10章：Provider 提供者', link: '/09-providers/' },
          { text: '第11章：Plugin SDK', link: '/10-plugin-sdk/' },
          { text: '第12章：工具系统', link: '/11-tools/' },
        ]
      },
      {
        text: '第五部分：跨平台客户端',
        collapsed: false,
        items: [
          { text: '第13章：客户端架构', link: '/12-clients/' },
          { text: '第14章：macOS 应用', link: '/13-macos/' },
          { text: '第15章：iOS 与 Android', link: '/14-mobile/' },
        ]
      },
      { text: '发布清单', link: '/release-checklist' }
    ],

    socialLinks: [
      { icon: 'github', link: bookRepository }
    ],

    editLink: {
      pattern: `${bookRepository}/edit/main/docs/:path`,
      text: '在本书仓库中编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    outline: {
      level: [2, 4],
      label: '目录'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    search: {
      provider: 'local'
    }
  }
}))
