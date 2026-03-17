---
title: 第8章：内置通道
description: OpenClaw 内置的消息平台支持 - 各平台适配器实现
---

> **学习目标**：了解 OpenClaw 内置支持的消息平台及其实现特点
> **前置知识**：第1-7章（项目概览到通道系统）
> **源码路径**：`src/channels/adapters/`, `extensions/`
> **阅读时间**：50分钟

<SourceSnapshotCard
  repo="openclaw/openclaw"
  branch="main"
  commit="latest"
  verified-at="2024-03"
  :entries="[
    { label: '内置通道', path: 'src/channels/' },
    { label: '扩展通道', path: 'extensions/' }
  ]"
/>

## 8.1 概述

OpenClaw 内置了多个主流消息平台的通道支持，同时通过扩展系统支持更多平台。

### 8.1.1 内置通道列表

| 平台 | 连接方式 | 特点 | 状态 |
|------|----------|------|------|
| Telegram | HTTP Polling/Webhook | Bot API，功能完整 | 核心 |
| Discord | WebSocket | 实时性好，支持 Slash 命令 | 核心 |
| Slack | WebSocket + Web API | 企业级，支持 Block Kit | 核心 |
| 微信 | 长连接 | 需处理加密，企业微信支持 | 核心 |
| 飞书 | Webhook + WebSocket | 开放平台 API | 核心 |

### 8.1.2 扩展通道列表

| 平台 | 位置 | 说明 |
|------|------|------|
| WhatsApp | extensions/whatsapp | 通过扩展安装 |
| Zalo | extensions/zalo | 越南主流通讯 |
| Mattermost | extensions/mattermost | 开源团队协作 |

## 8.2 Telegram 通道

### 8.2.1 技术特点

```typescript
// Telegram 特点
- 连接方式：HTTP Long Polling 或 Webhook
- 认证：Bot Token
- 消息格式：JSON
- 特色功能：Inline Keyboard、Web App、Voice Chat
```

### 8.2.2 实现要点

```typescript
// src/channels/adapters/telegram.ts

class TelegramChannel extends BaseChannel {
  private bot: TelegramBot;
  
  async connect(): Promise<void> {
    // 方式一：Long Polling
    this.bot = new TelegramBot(this.config.token, { polling: true });
    
    // 方式二：Webhook（生产环境推荐）
    // await this.bot.setWebhook(this.config.webhookUrl);
    
    // 注册消息处理器
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('callback_query', this.handleCallback.bind(this));
    this.bot.on('inline_query', this.handleInline.bind(this));
  }
  
  // 支持的消息类型
  private handleMessage(msg: TelegramMessage) {
    if (msg.text) return this.handleText(msg);
    if (msg.photo) return this.handlePhoto(msg);
    if (msg.document) return this.handleDocument(msg);
    // ...
  }
  
  // Inline Keyboard 支持
  async sendWithKeyboard(
    chatId: string, 
    text: string, 
    keyboard: InlineKeyboard
  ): Promise<void> {
    await this.bot.sendMessage(chatId, text, {
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}
```

### 8.2.3 消息转换

```typescript
// Telegram 消息 → 统一格式
function parseTelegramMessage(msg: TelegramMessage): UnifiedMessage {
  return {
    id: msg.message_id.toString(),
    channelId: this.id,
    platform: 'telegram',
    sender: {
      id: msg.from.id.toString(),
      name: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' '),
      username: msg.from.username,
      isBot: msg.from.is_bot
    },
    content: {
      type: msg.photo ? 'image' : msg.document ? 'file' : 'text',
      text: msg.text || msg.caption,
      media: msg.photo ? { url: msg.photo[0].file_id } : undefined
    },
    timestamp: msg.date * 1000,
    replyTo: msg.reply_to_message?.message_id.toString(),
    metadata: {
      chatId: msg.chat.id,
      chatType: msg.chat.type
    }
  };
}
```

## 8.3 Discord 通道

### 8.3.1 技术特点

```typescript
// Discord 特点
- 连接方式：WebSocket (Gateway API)
- 认证：Bot Token
- 消息格式：JSON over WebSocket
- 特色功能：Slash Commands、Embed、Buttons、Select Menus
```

### 8.3.2 实现要点

```typescript
// src/channels/adapters/discord.ts

class DiscordChannel extends BaseChannel {
  private client: Discord.Client;
  
  async connect(): Promise<void> {
    this.client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
      ]
    });
    
    // 注册事件
    this.client.on('ready', this.onReady.bind(this));
    this.client.on('messageCreate', this.onMessage.bind(this));
    this.client.on('interactionCreate', this.onInteraction.bind(this));
    
    await this.client.login(this.config.token);
  }
  
  // Slash Command 支持
  private async onInteraction(interaction: Discord.Interaction) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.commandName;
    const args = interaction.options;
    
    // 转换为统一消息格式
    const unified = this.parseInteraction(interaction);
    this.emit({ type: 'message', data: unified });
  }
  
  // Embed 消息支持
  async sendEmbed(channelId: string, embed: DiscordEmbed): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  }
}
```

### 8.3.3 心跳机制

```typescript
// Discord Gateway 需要心跳保活
private startHeartbeat(): void {
  this.client.on('debug', (info) => {
    if (info.includes('Heartbeat')) {
      // 心跳日志
    }
  });
}
```

## 8.4 Slack 通道

### 8.4.1 技术特点

```typescript
// Slack 特点
- 连接方式：WebSocket (RTM API) + Web API
- 认证：Bot User OAuth Token
- 消息格式：JSON
- 特色功能：Block Kit、Modals、App Home
```

### 8.4.2 实现要点

```typescript
// src/channels/adapters/slack.ts

class SlackChannel extends BaseChannel {
  private web: WebClient;
  private rtm: RTMClient;
  
  async connect(): Promise<void> {
    // Web API 用于发送消息
    this.web = new WebClient(this.config.token);
    
    // RTM 用于接收消息
    this.rtm = new RTMClient(this.config.appToken);
    
    this.rtm.on('message', this.onMessage.bind(this));
    
    await this.rtm.start();
  }
  
  // Block Kit 支持
  async sendBlocks(channel: string, blocks: Block[]): Promise<void> {
    await this.web.chat.postMessage({
      channel,
      blocks,
      text: 'Fallback text'
    });
  }
  
  // Thread 支持
  async sendThreadReply(
    channel: string, 
    threadTs: string, 
    text: string
  ): Promise<void> {
    await this.web.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text
    });
  }
}
```

## 8.5 微信通道

### 8.5.1 技术特点

```typescript
// 微信特点
- 连接方式：长连接 / Webhook
- 认证：AppID + AppSecret
- 消息格式：XML 或 JSON
- 特色功能：公众号菜单、模板消息、小程序
- 安全：消息加密/解密（AES）
```

### 8.5.2 实现要点

```typescript
// src/channels/adapters/wechat.ts

class WeChatChannel extends BaseChannel {
  private appId: string;
  private appSecret: string;
  private encodingAESKey: string;
  
  async connect(): Promise<void> {
    // 微信通过 Webhook 接收消息
    // 需要 HTTP 服务器接收 POST 请求
    this.startWebhookServer();
  }
  
  // 消息解密
  private decryptMessage(encrypted: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encodingAESKey, 'base64'),
      Buffer.alloc(16, 0)
    );
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // 消息加密
  private encryptMessage(content: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encodingAESKey, 'base64'),
      Buffer.alloc(16, 0)
    );
    
    let encrypted = cipher.update(content, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  }
  
  // 获取 access_token
  private async getAccessToken(): Promise<string> {
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
    );
    const data = await response.json();
    return data.access_token;
  }
}
```

### 8.5.3 企业微信差异

```typescript
// 企业微信与公众号的差异
interface WeChatConfig {
  type: 'mp' | 'work';  // 公众号 | 企业微信
  
  // 公众号配置
  appId?: string;
  appSecret?: string;
  
  // 企业微信配置
  corpId?: string;
  agentId?: string;
  corpSecret?: string;
}
```

## 8.6 飞书通道

### 8.6.1 技术特点

```typescript
// 飞书特点
- 连接方式：Webhook + WebSocket
- 认证：App ID + App Secret
- 消息格式：JSON
- 特色功能：卡片消息、多维表格、文档
```

### 8.6.2 实现要点

```typescript
// src/channels/adapters/feishu.ts

class FeishuChannel extends BaseChannel {
  private appId: string;
  private appSecret: string;
  
  async connect(): Promise<void> {
    // 获取 tenant_access_token
    await this.refreshAccessToken();
    
    // 启动 WebSocket 接收消息
    await this.startWebSocket();
  }
  
  // 卡片消息
  async sendCard(
    receiveId: string, 
    card: FeishuCard
  ): Promise<void> {
    await this.webhook.send({
      msg_type: 'interactive',
      card
    });
  }
}
```

## 8.7 概念→代码映射表

| 平台 | 实现文件 | 关键特性 |
|------|----------|----------|
| Telegram | `src/channels/adapters/telegram.ts` | Bot API、Inline Keyboard |
| Discord | `src/channels/adapters/discord.ts` | Gateway、Slash Commands |
| Slack | `src/channels/adapters/slack.ts` | RTM、Block Kit |
| 微信 | `src/channels/adapters/wechat.ts` | 加密消息、access_token |
| 飞书 | `src/channels/adapters/feishu.ts` | 卡片消息、开放平台 |

## 8.8 小结

内置通道展示了 Channel 抽象层的实际应用：
- 每个平台都有独特的连接方式和消息格式
- 通过统一的接口屏蔽差异
- 支持平台特有功能（如 Discord Slash Commands）

下一章将介绍如何开发自定义通道扩展。

---

**下一章**：[第9章：扩展开发](/08-extensions/) - 学习如何为 OpenClaw 开发自定义扩展
