---
title: 第9章：扩展开发
description: OpenClaw 插件扩展系统 - 开发自定义 Channel、Provider、Tool
---

> **学习目标**：掌握 OpenClaw 扩展系统的开发方法
> **前置知识**：第1-8章（项目概览到内置通道）
> **源码路径**：`src/plugin-sdk/`, `extensions/`
> **阅读时间**：60分钟

<SourceSnapshotCard
  repo="openclaw/openclaw"
  branch="main"
  commit="latest"
  verified-at="2024-03"
  :entries="[
    { label: 'Plugin SDK', path: 'src/plugin-sdk/' },
    { label: '扩展示例', path: 'extensions/' }
  ]"
/>

## 9.1 扩展系统概述

### 9.1.1 扩展类型

OpenClaw 支持三种类型的扩展：

| 类型 | 说明 | 示例 |
|------|------|------|
| **Channel** | 消息通道扩展 | WhatsApp, Zalo |
| **Provider** | AI 模型提供者扩展 | xAI, Mistral |
| **Tool** | 独立工具扩展 | Firecrawl, Memory |

### 9.1.2 扩展目录结构

```
extensions/
├── whatsapp/                    # Channel 扩展
│   ├── package.json
│   ├── openclaw.plugin.json     # 插件元数据
│   ├── index.ts                 # 导出 OpenClawPlugin
│   └── src/
│       ├── channel.ts           # Channel 实现
│       └── types.ts
│
├── xai/                         # Provider 扩展
│   ├── package.json
│   ├── openclaw.plugin.json
│   ├── index.ts
│   └── src/
│       ├── provider.ts          # Provider 实现
│       └── types.ts
│
└── firecrawl/                   # Tool 扩展
    ├── package.json
    ├── openclaw.plugin.json
    ├── index.ts
    └── src/
        └── tool.ts              # Tool 实现
```

## 9.2 Plugin SDK 核心接口

### 9.2.1 OpenClawPlugin 接口

```typescript
// src/plugin-sdk/types.ts

interface OpenClawPlugin {
  name: string;                    // 插件名称
  version: string;                 // 版本号
  description: string;             // 描述
  
  // 初始化钩子
  onLoad?(api: OpenClawPluginApi): Promise<void>;
  
  // 卸载钩子
  onUnload?(): Promise<void>;
  
  // 注册扩展
  registerChannel?: (factory: ChannelFactory) => void;
  registerProvider?: (factory: ProviderFactory) => void;
  registerTool?: (tool: Tool) => void;
}
```

### 9.2.2 OpenClawPluginApi 接口

```typescript
// 插件可用的 API
interface OpenClawPluginApi {
  // 日志
  logger: Logger;
  
  // 配置
  config: {
    get<T>(key: string): T | undefined;
    set(key: string, value: unknown): void;
  };
  
  // 存储扩展数据
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown): Promise<void>;
    delete(key: string): Promise<void>;
  };
  
  // 注册扩展
  registerChannel(factory: ChannelFactory): void;
  registerProvider(factory: ProviderFactory): void;
  registerTool(tool: Tool): void;
  
  // 发送事件
  emit(event: string, data: unknown): void;
  
  // 监听事件
  on(event: string, handler: EventHandler): void;
}
```

### 9.2.3 插件元数据

```json
// openclaw.plugin.json
{
  "name": "openclaw-channel-whatsapp",
  "version": "1.0.0",
  "type": "channel",
  "platform": "whatsapp",
  "description": "WhatsApp 消息通道扩展",
  "author": "OpenClaw Team",
  "license": "MIT",
  "keywords": ["openclaw", "channel", "whatsapp"],
  "engines": {
    "openclaw": ">=1.0.0"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0"
  }
}
```

## 9.3 开发 Channel 扩展

### 9.3.1 实现步骤

1. 创建扩展目录
2. 定义插件元数据
3. 实现 Channel 接口
4. 导出 OpenClawPlugin

### 9.3.2 完整示例：WhatsApp 通道

```typescript
// extensions/whatsapp/index.ts

import { OpenClawPlugin, BaseChannel, Channel, UnifiedMessage } from '@openclaw/plugin-sdk';
import { Client, LocalAuth } from 'whatsapp-web.js';

class WhatsAppChannel extends BaseChannel implements Channel {
  readonly platform = 'whatsapp';
  readonly name = 'WhatsApp';
  
  private client: Client;
  
  async connect(): Promise<void> {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true
      }
    });
    
    // 事件处理
    this.client.on('qr', (qr) => {
      // 生成二维码供用户扫描
      this.emit({
        type: 'qr',
        data: { qr }
      });
    });
    
    this.client.on('ready', () => {
      this.connected = true;
      this.emit({ type: 'connected', data: { channelId: this.id } });
    });
    
    this.client.on('message', (msg) => {
      const unified = this.parseMessage(msg);
      this.emit({ type: 'message', data: unified });
    });
    
    await this.client.initialize();
  }
  
  async disconnect(): Promise<void> {
    await this.client.destroy();
    this.connected = false;
  }
  
  async send(message: OutgoingMessage): Promise<void> {
    const chatId = this.getChatId(message);
    const text = typeof message.content === 'string' 
      ? message.content 
      : message.content.text;
    
    await this.client.sendMessage(chatId, text);
  }
  
  private parseMessage(msg: WhatsAppMessage): UnifiedMessage {
    return {
      id: msg.id.id,
      channelId: this.id,
      platform: 'whatsapp',
      sender: {
        id: msg.from,
        name: msg._data.notifyName
      },
      content: {
        type: msg.type as 'text' | 'image' | 'video',
        text: msg.body
      },
      timestamp: msg.timestamp * 1000
    };
  }
}

// 导出插件
export default {
  name: 'openclaw-channel-whatsapp',
  version: '1.0.0',
  description: 'WhatsApp 消息通道扩展',
  
  async onLoad(api) {
    api.logger.info('WhatsApp 插件加载中...');
    
    api.registerChannel({
      platform: 'whatsapp',
      create: async (config) => {
        const channel = new WhatsAppChannel(config);
        return channel;
      }
    });
  },
  
  async onUnload() {
    console.log('WhatsApp 插件已卸载');
  }
} as OpenClawPlugin;
```

## 9.4 开发 Provider 扩展

### 9.4.1 Provider 接口

```typescript
// src/plugin-sdk/types.ts

interface Provider {
  readonly id: string;
  readonly name: string;
  readonly models: string[];
  
  // 认证方法
  readonly authMethod: ProviderAuthMethod;
  authenticate(credentials: Credentials): Promise<void>;
  
  // 聊天完成
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncIterable<ChatChunk>;
  
  // 嵌入
  embed?(request: EmbedRequest): Promise<EmbedResponse>;
}

interface ProviderAuthMethod {
  type: 'api_key' | 'oauth' | 'custom';
  fields: AuthField[];
}

interface AuthField {
  name: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
}
```

### 9.4.2 完整示例：xAI Provider

```typescript
// extensions/xai/index.ts

import { OpenClawPlugin, Provider, ChatRequest, ChatResponse } from '@openclaw/plugin-sdk';

class XAIProvider implements Provider {
  readonly id = 'xai';
  readonly name = 'xAI (Grok)';
  readonly models = ['grok-beta', 'grok-2'];
  
  readonly authMethod = {
    type: 'api_key' as const,
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ]
  };
  
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1';
  
  async authenticate(credentials: { apiKey: string }): Promise<void> {
    this.apiKey = credentials.apiKey;
    
    // 验证 API Key
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    
    if (!response.ok) {
      throw new Error('xAI API Key 验证失败');
    }
  }
  
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens
      })
    });
    
    const data = await response.json();
    
    return {
      id: data.id,
      model: data.model,
      choices: data.choices.map(choice => ({
        message: {
          role: choice.message.role,
          content: choice.message.content
        },
        finishReason: choice.finish_reason
      })),
      usage: data.usage
    };
  }
  
  async *chatStream(request: ChatRequest): AsyncIterable<ChatChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true
      })
    });
    
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        yield JSON.parse(data);
      }
    }
  }
}

export default {
  name: 'openclaw-provider-xai',
  version: '1.0.0',
  description: 'xAI (Grok) 模型提供者',
  
  async onLoad(api) {
    api.registerProvider({
      id: 'xai',
      create: async (config) => {
        const provider = new XAIProvider();
        await provider.authenticate(config.credentials);
        return provider;
      }
    });
  }
} as OpenClawPlugin;
```

## 9.5 开发 Tool 扩展

### 9.5.1 Tool 接口

```typescript
interface Tool {
  name: string;                    // 工具名称
  description: string;             // 工具描述（LLM 使用）
  parameters: JSONSchema;          // 参数 JSON Schema
  
  // 执行函数
  execute(params: Record<string, unknown>): Promise<ToolResult>;
}

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
```

### 9.5.2 完整示例：Firecrawl Tool

```typescript
// extensions/firecrawl/index.ts

import { OpenClawPlugin, Tool, ToolResult } from '@openclaw/plugin-sdk';
import FirecrawlApp from '@mendable/firecrawl-js';

class FirecrawlTool implements Tool {
  name = 'firecrawl';
  description = '抓取网页内容并转换为 Markdown';
  
  parameters = {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: '要抓取的网页 URL'
      },
      mode: {
        type: 'string',
        enum: ['crawl', 'scrape'],
        description: '抓取模式：crawl（爬取整站）或 scrape（抓取单页）'
      }
    },
    required: ['url']
  };
  
  private client: FirecrawlApp;
  
  constructor(apiKey: string) {
    this.client = new FirecrawlApp({ apiKey });
  }
  
  async execute(params: { url: string; mode?: 'crawl' | 'scrape' }): Promise<ToolResult> {
    try {
      const mode = params.mode || 'scrape';
      
      if (mode === 'scrape') {
        const result = await this.client.scrapeUrl(params.url);
        return {
          success: true,
          data: result.data
        };
      } else {
        const result = await this.client.crawlUrl(params.url);
        return {
          success: true,
          data: result.data
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default {
  name: 'openclaw-tool-firecrawl',
  version: '1.0.0',
  description: 'Firecrawl 网页抓取工具',
  
  async onLoad(api) {
    const apiKey = api.config.get('firecrawl.apiKey');
    
    api.registerTool(new FirecrawlTool(apiKey));
  }
} as OpenClawPlugin;
```

## 9.6 扩展安装与管理

### 9.6.1 安装扩展

```bash
# 从 npm 安装
openclaw plugin install openclaw-channel-whatsapp

# 从本地安装
openclaw plugin install ./extensions/my-plugin

# 从 GitHub 安装
openclaw plugin install github:user/repo
```

### 9.6.2 配置扩展

```yaml
# openclaw.yaml
plugins:
  - name: openclaw-channel-whatsapp
    enabled: true
    config:
      sessionPath: ./sessions/whatsapp
  
  - name: openclaw-provider-xai
    enabled: true
    config:
      apiKey: ${XAI_API_KEY}
```

### 9.6.3 扩展生命周期

```
加载阶段                    运行阶段                    卸载阶段
   │                          │                          │
   ▼                          ▼                          ▼
┌─────────┐              ┌─────────┐              ┌─────────┐
│ 发现插件 │──────►       │ onLoad  │──────►       │ onUnload │
└─────────┘              └─────────┘              └─────────┘
                              │                          │
                              ▼                          ▼
                         ┌─────────┐              ┌─────────┐
                         │ 注册扩展 │              │ 清理资源 │
                         └─────────┘              └─────────┘
```

## 9.7 最佳实践

### 9.7.1 错误处理

```typescript
class MyChannel extends BaseChannel {
  async send(message: OutgoingMessage): Promise<void> {
    try {
      // 发送逻辑
    } catch (error) {
      this.emit({
        type: 'error',
        data: { 
          error: new Error(`发送失败: ${error.message}`) 
        }
      });
      throw error;
    }
  }
}
```

### 9.7.2 日志记录

```typescript
async onLoad(api: OpenClawPluginApi) {
  api.logger.info('插件加载中...');
  api.logger.debug('配置:', api.config);
  
  try {
    // 初始化
    api.logger.info('插件加载完成');
  } catch (error) {
    api.logger.error('插件加载失败:', error);
    throw error;
  }
}
```

### 9.7.3 资源清理

```typescript
async onUnload() {
  // 关闭连接
  await this.channel?.disconnect();
  
  // 清理定时器
  clearInterval(this.heartbeatTimer);
  
  // 释放资源
  this.client = null;
}
```

## 9.8 概念→代码映射表

| 概念组件 | 对应目录/文件 | 核心作用 |
|---------|-------------|---------|
| **Plugin 接口** | `src/plugin-sdk/types.ts` | 插件定义 |
| **Plugin API** | `src/plugin-sdk/api.ts` | 插件可用的 API |
| **Channel 扩展** | `extensions/whatsapp/` | 消息通道示例 |
| **Provider 扩展** | `extensions/xai/` | 模型提供者示例 |
| **Tool 扩展** | `extensions/firecrawl/` | 独立工具示例 |

## 9.9 小结

OpenClaw 的扩展系统提供了灵活的扩展能力：
- **Channel 扩展**：连接新的消息平台
- **Provider 扩展**：集成新的 AI 模型
- **Tool 扩展**：添加新的工具能力

通过 Plugin SDK，开发者可以轻松为 OpenClaw 添加新功能。

---

**下一章**：[第10章：Provider 提供者](/09-providers/) - 深入了解 OpenClaw 如何与各种 AI 模型交互
