import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  base: '/learn-openclaw/',
  title: 'OpenClaw 源码学习',
  description: '从零开始理解 OpenClaw - 个人 AI 助手网关',
  lang: 'zh-CN',
  
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
  ],
  
  markdown: {
    lineNumbers: true,
  },
  
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'OpenClaw 源码学习',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '阅读地图', link: '/reading-map' },
      { text: '术语表', link: '/glossary' },
    ],
    
    sidebar: {
      '/': [
        {
          text: '📚 开始阅读',
          items: [
            { text: '阅读地图', link: '/reading-map' },
            { text: '术语表', link: '/glossary' },
            { text: '版本说明', link: '/version-notes' },
          ]
        },
        {
          text: '📖 第一部分：基础认知',
          collapsed: false,
          items: [
            { text: '第1章：OpenClaw 是什么', link: '/00-intro/' },
            { text: '第2章：项目结构', link: '/01-structure/' },
            { text: '第3章：核心概念', link: '/02-concepts/' },
          ]
        },
        {
          text: '⚙️ 第二部分：核心运行时',
          collapsed: false,
          items: [
            { text: '第4章：Gateway 网关', link: '/03-gateway/' },
            { text: '第5章：Agent 代理', link: '/04-agent/' },
            { text: '第6章：消息路由', link: '/05-routing/' },
          ]
        },
        {
          text: '🔌 第三部分：消息通道',
          collapsed: false,
          items: [
            { text: '第7章：通道系统', link: '/06-channels/' },
            { text: '第8章：内置通道', link: '/07-builtins/' },
            { text: '第9章：扩展开发', link: '/08-extensions/' },
          ]
        },
        {
          text: '🤖 第四部分：模型与工具',
          collapsed: false,
          items: [
            { text: '第10章：Provider 提供者', link: '/09-providers/' },
            { text: '第11章：Plugin SDK', link: '/10-plugin-sdk/' },
            { text: '第12章：工具系统', link: '/11-tools/' },
          ]
        },
        {
          text: '📱 第五部分：跨平台客户端',
          collapsed: false,
          items: [
            { text: '第13章：客户端架构', link: '/12-clients/' },
            { text: '第14章：macOS 应用', link: '/13-macos/' },
            { text: '第15章：iOS 与 Android', link: '/14-mobile/' },
          ]
        },
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/openclaw/openclaw' }
    ],
    
    footer: {
      message: '基于 OpenClaw 开源项目学习整理',
      copyright: 'Copyright © 2024 学习者社区'
    },
    
    editLink: {
      pattern: 'https://github.com/openclaw/openclaw/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },
    
    outline: {
      level: [2, 3],
      label: '目录'
    },
    
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  },
  
  mermaid: {
    // Mermaid 配置
  }
}))
