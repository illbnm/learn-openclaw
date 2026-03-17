---
title: 版本说明
description: 本书基于的源码版本和更新边界
---

# 版本说明

## 源码快照

本书基于以下源码版本编写：

<SourceSnapshotCard
  repo="openclaw/openclaw"
  branch="main"
  commit="最新版本"
  verified-at="2026-03-17"
  :entries="[
    { label: '核心网关', path: 'src/gateway/' },
    { label: 'AI 代理', path: 'src/agents/' },
    { label: '消息通道', path: 'src/channels/' },
    { label: '扩展系统', path: 'extensions/' },
    { label: '跨平台客户端', path: 'apps/' }
  ]"
/>

> **注意**：OpenClaw 项目活跃开发中，API 和架构可能发生变化。若文档与代码不一致，请以源码为准。

## 项目状态

| 指标 | 数值 |
|------|------|
| Stars | 317K+ |
| Forks | 60.8K |
| Commits | 19,608+ |
| Contributors | 大型社区 |
| 文档 | docs.openclaw.ai |
| 许可证 | MIT |

## 文档边界

### 已覆盖内容

- ✅ 核心架构设计原理
- ✅ Gateway 网关机制
- ✅ Agent 代理系统
- ✅ 消息通道抽象层
- ✅ Provider 提供商系统
- ✅ Plugin SDK 扩展开发
- ✅ 跨平台客户端架构

### 未覆盖内容

- ❌ 未来版本的功能规划
- ❌ 第三方扩展的具体实现
- ❌ 生产环境部署运维指南
- ❌ 性能调优最佳实践
- ❌ 安全审计详细报告

## 更新日志

### v1.0.0 (2026-03-17)

**初始版本**：
- 完成项目调研和结构分析
- 创建阅读地图和术语表
- 规划 16 章内容结构

## 如何保持同步

由于 OpenClaw 项目快速迭代，本书采用以下策略保持准确性：

1. **概念优先**：重点讲解架构思想和设计模式，这些相对稳定
2. **代码快照**：关键代码片段标注文件路径，便于读者对照最新源码
3. **持续更新**：跟随项目重要版本更新本书内容

## 贡献指南

如果你发现文档与源码不一致，可以通过以下方式贡献：

1. 在 GitHub 提交 Issue 描述问题
2. 提交 PR 更新文档内容
3. 在讨论区分享你的理解

## 参考资源

| 资源 | 链接 |
|------|------|
| 官方文档 | https://docs.openclaw.ai |
| GitHub 仓库 | https://github.com/openclaw/openclaw |
| 社区讨论 | GitHub Discussions |

---

> **阅读建议**：建议在阅读本书时，同时打开源码仓库，对照文件路径和代码实现，这样理解更深入。
