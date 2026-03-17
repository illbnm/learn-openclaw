---
title: 术语表
description: OpenClaw 核心概念和术语定义
---

# 术语表

本书使用统一的术语定义，避免歧义。遇到不熟悉的术语，请在此查阅。

## 核心概念

### Gateway（网关）

**定义**：OpenClaw 的核心消息路由中心，负责接收来自各消息通道的消息，并根据路由规则分发给对应的 Agent 处理。

**职责**：
- WebSocket 连接管理
- 消息协议解析
- 认证和授权
- 消息路由分发

**相关文件**：`src/gateway/`

**参见**：第4章 Gateway 网关

---

### Agent（代理）

**定义**：AI 代理是处理用户消息的核心单元，负责调用 LLM 生成回复、执行工具、管理对话上下文。

**职责**：
- 会话管理
- LLM 调用和流式响应处理
- 工具执行
- 对话历史维护

**相关文件**：`src/agents/`

**参见**：第5章 Agent 代理

---

### Channel（通道）

**定义**：消息通道是对不同 IM 平台的统一抽象，每个 Channel 实现特定平台的消息收发逻辑。

**示例**：
- WhatsApp Channel
- Telegram Channel
- Discord Channel
- Slack Channel

**相关文件**：`src/channels/`, `extensions/*/`

**参见**：第7章 通道系统

---

### Provider（提供商）

**定义**：AI 提供商是对不同 LLM 服务的统一抽象，每个 Provider 实现特定 AI 服务的调用接口。

**示例**：
- OpenAI Provider
- Anthropic Provider
- xAI Provider
- Mistral Provider

**相关文件**：`src/providers/`, `extensions/*/`

**参见**：第10章 Provider

---

### Routing（路由）

**定义**：消息路由决定来自某 Channel 的消息应发给哪个 Agent 处理，支持基于规则、基于上下文等多种路由策略。

**相关文件**：`src/routing/`

**参见**：第6章 消息路由

---

## 扩展系统

### Plugin（插件）

**定义**：插件是扩展 OpenClaw 功能的标准方式，可以是 Channel、Provider 或 Tool。

**类型**：
- **Channel Plugin**：添加新的消息通道
- **Provider Plugin**：添加新的 AI 提供商
- **Tool Plugin**：添加独立工具

**相关文件**：`src/plugin-sdk/`, `extensions/`

**参见**：第11章 Plugin SDK

---

### Plugin SDK

**定义**：插件开发工具包，提供扩展开发所需的类型定义和辅助函数。

**核心接口**：
- `OpenClawPlugin`：插件对象接口
- `OpenClawPluginApi`：插件可用的核心 API
- `registerChannel()`：注册通道
- `registerProvider()`：注册提供商

**相关文件**：`src/plugin-sdk/`

**参见**：第11章 Plugin SDK

---

### Extension（扩展）

**定义**：Extension 是 Plugin 的实例化形式，存放在 `extensions/` 目录下，每个扩展是一个独立的 npm 包。

**结构**：
```
extensions/<name>/
├── package.json           # 依赖声明
├── openclaw.plugin.json   # 插件元数据
├── index.ts               # 入口文件
└── src/                   # 实现代码
```

**参见**：第9章 扩展开发

---

## 数据与存储

### Memory（记忆）

**定义**：长期记忆存储系统，基于向量数据库（LanceDB），为 Agent 提供上下文检索能力。

**用途**：
- 存储对话历史
- 语义检索相关上下文
- 长期记忆持久化

**相关文件**：`src/memory/`, `extensions/memory-lancedb/`

---

### Session（会话）

**定义**：会话代表用户与 Agent 的一次连续对话，包含对话历史、上下文状态等。

**生命周期**：
1. 用户首次发消息创建会话
2. 会话持续接收消息
3. 会话超时或用户主动结束

---

## 架构组件

### CLI（命令行界面）

**定义**：OpenClaw 的命令行入口，支持配置管理、代理运行、更新等子命令。

**入口文件**：`src/entry.ts` → `src/cli/`

**参见**：第2章 项目结构

---

### TUI（终端用户界面）

**定义**：交互式终端界面，提供类似聊天应用的体验，用于直接与 Agent 对话。

**相关文件**：`src/tui/`

---

### Infra（基础设施）

**定义**：跨模块共享的底层能力，包括设备身份管理、网络工具、环境变量处理等。

**相关文件**：`src/infra/`

---

## 跨平台

### OpenClawKit

**定义**：跨平台共享 Swift 库，为 iOS、macOS、watchOS 提供统一的 Gateway 通信和设备能力抽象。

**核心功能**：
- WebSocket 连接管理
- 消息编解码
- 设备能力封装（相机、定位等）

**相关文件**：`apps/shared/OpenClawKit/`

**参见**：第13章 客户端架构

---

### Gateway Node Session

**定义**：客户端与 Gateway 的 WebSocket 会话连接，管理连接状态、心跳、消息收发。

**相关文件**：`apps/shared/OpenClawKit/Sources/OpenClawKit/GatewayNodeSession.swift`

---

## 消息处理

### Webhook

**定义**：消息通道（如 WhatsApp、Telegram）通过 Webhook 将用户消息推送到 OpenClaw Gateway。

**流程**：
1. 用户在 IM 平台发送消息
2. 平台通过 Webhook 推送到 Gateway
3. Gateway 解析并路由消息

---

### Stream Response（流式响应）

**定义**：AI 生成内容以流式方式逐步返回，而非等待完整响应，提升用户体验。

**实现**：Server-Sent Events (SSE) 或 WebSocket 流

---

### Tool Calling（工具调用）

**定义**：AI 模型可以调用预定义的工具（如搜索、计算器），执行特定任务后返回结果。

**流程**：
1. AI 决定需要调用工具
2. 返回工具调用请求
3. Agent 执行工具
4. 将结果返回给 AI
5. AI 生成最终回复

---

## 配置与安全

### Config（配置）

**定义**：用户配置管理，包括通道凭证、AI 提供商密钥、路由规则等。

**存储位置**：`~/.openclaw/`

**相关文件**：`src/config/`

---

### Pairing（配对）

**定义**：设备与 Gateway 的安全配对流程，建立信任关系后方可通信。

**相关文件**：`src/pairing/`

---

### Secrets（密钥）

**定义**：敏感信息的安全存储，如 API Key、OAuth Token 等。

**相关文件**：`src/secrets/`

---

## 术语对照表

| 英文术语 | 中文术语 | 缩写 |
|---------|---------|------|
| Gateway | 网关 | GW |
| Agent | 代理 | - |
| Channel | 通道 | CH |
| Provider | 提供商 | - |
| Plugin | 插件 | - |
| Extension | 扩展 | Ext |
| Memory | 记忆 | - |
| Session | 会话 | - |
| Configuration | 配置 | Config |
| Webhook | 网络钩子 | - |
| WebSocket | 网络套接字 | WS |

---

## 首字母缩写

| 缩写 | 全称 | 含义 |
|------|------|------|
| LLM | Large Language Model | 大语言模型 |
| SSE | Server-Sent Events | 服务器推送事件 |
| API | Application Programming Interface | 应用程序接口 |
| SDK | Software Development Kit | 软件开发工具包 |
| CLI | Command Line Interface | 命令行界面 |
| TUI | Terminal User Interface | 终端用户界面 |
| IM | Instant Messaging | 即时通讯 |
| DM | Direct Message | 私信 |

---

> **贡献术语**：如果发现遗漏或歧义的术语，欢迎在本书 GitHub 仓库提交 Issue 或 PR。
