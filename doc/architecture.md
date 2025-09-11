# 🏗️ 技术架构

## 整体架构图

![VoidMuse架构图](img/architecture.svg)

## 项目结构

```
VoidMuse/
├── gui/                    # Web前端界面 (React + TypeScript)
│   ├── src/
│   │   ├── llm/           # AI模型服务层
│   │   ├── mcp/           # MCP协议客户端
│   │   ├── storage/       # 本地存储服务
│   │   ├── services/      # 业务服务层
│   │   ├── components/    # UI组件库
│   │   └── contexts/      # React上下文
│   └── package.json
├── extensions/             # IDE插件代码
│   ├── vscode/            # VS Code插件 (TypeScript)
│   │   ├── src/
│   │   │   ├── services/  # 插件服务
│   │   │   ├── edit/      # 代码编辑功能
│   │   │   └── common/    # 通用工具
│   │   └── package.json
│   └── intellij/          # IntelliJ插件 (Java/Kotlin)
│       ├── src/main/
│       └── build.gradle.kts
└── doc/                   # 技术文档
    ├── freeLLMQuota.md
    ├── googleSearchConfig.md
    └── bochaSearchConfig.md
```

## 核心模块说明

### 前端架构 (gui/)
- **AIModelService**: 统一的AI模型调用服务
- **McpClient**: MCP协议客户端实现
- **StorageService**: 本地数据存储管理
- **EmbeddingService**: 向量化与检索服务
- **TokenUsageService**: Token使用统计与成本管理

### VS Code插件 (extensions/vscode/)
- **AutoCompletionService**: 智能代码补全
- **EmbeddingsService**: 代码向量化处理
- **FileService**: 文件操作与管理
- **InlineEditService**: 行内代码编辑
- **GitService**: Git集成功能

### IntelliJ插件 (extensions/intellij/)
- 基于IntelliJ Platform SDK
- Java/Kotlin混合开发
- 与VS Code插件功能对等

## 技术选型分析

### 为什么选择这些技术？

- **React + TypeScript**: 现代化前端开发，类型安全
- **Vite**: 快速的开发构建体验
- **Ant Design**: 成熟的企业级UI组件库
- **AI SDK**: 统一的多模型接口抽象
- **MCP协议**: 标准化的AI工具调用协议

### 详细技术选型文档

- [技术选型文档](tech-selection.md)
- [组件对比分析](component-comparison.md)
- [性能基准测试](performance-benchmark.md)

## 架构设计原则

### 1. 模块化设计
- 各功能模块独立开发和维护
- 清晰的接口定义和依赖关系
- 支持插件化扩展

### 2. 跨平台兼容
- 统一的前端界面
- 适配多种IDE平台
- 一致的用户体验

### 3. 可扩展性
- 支持多种AI模型
- 灵活的配置系统
- 开放的插件接口

### 4. 性能优化
- 本地化向量存储
- 智能缓存机制
- 异步处理优化

## 数据流架构

### 1. 用户交互流程
```
用户输入 → IDE插件 → Web界面 → AI服务 → 结果返回
```

### 2. 代码索引流程
```
代码文件 → 向量化处理 → 本地存储 → 语义检索 → 上下文提取
```

### 3. AI对话流程
```
用户问题 → 上下文收集 → 模型调用 → 结果处理 → 界面展示
```

## 安全与隐私

### 1. 本地优先
- 代码索引完全本地化
- 敏感信息不上传
- 用户数据自主控制

### 2. API安全
- 安全的密钥存储
- 加密传输协议
- 访问权限控制

### 3. 隐私保护
- 最小化数据收集
- 透明的数据使用
- 用户隐私设置