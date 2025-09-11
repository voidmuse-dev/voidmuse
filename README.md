# VoidMuse

<div align="center">

<img src="doc/img/icon/VoidMuse-full.png" alt="VoidMuse Logo" width="200" />

🚀 **开源驱动的智能AI IDE插件** | **学习型AI工程化项目**

适配 IntelliJ IDEA & Visual Studio Code

<a href="https://opensource.org/licenses/Apache-2.0" target="_blank">
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License" style="height: 22px;" />
</a>
<a href="#" target="_blank">
  <img src="https://img.shields.io/badge/Platform-Cross%20Platform-brightgreen.svg" alt="Platform" style="height: 22px;" />
</a>
<a href="#" target="_blank">
  <img src="https://img.shields.io/badge/Language-TypeScript%20%7C%20%20Java-orange.svg" alt="Language" style="height: 22px;" />
</a>
<a href="#" target="_blank">
  <img src="https://img.shields.io/badge/Open%20Source-Yes-green.svg" alt="Open Source" style="height: 22px;" />
</a>

</div>

---

## 🎯 项目愿景

> **不仅仅是一个AI插件，更是一个AI工程化学习平台**

VoidMuse致力于通过**开源组件整合**的方式，以**最低的开发成本**构建高效智能的AI IDE插件。我们相信开源的力量，通过精心选择和整合优秀的开源组件，让每个开发者都能轻松构建自己的AI工具。

### 🌟 核心理念

- 📚 **学习导向**: 提供完整的技术原理文档，让用户深度理解AI工程化
- 🔧 **开源整合**: 基于20+优秀开源组件，降低开发门槛
- 🧠 **知识传递**: 从Embedding到向量数据库，全面覆盖前沿AI概念
- 💡 **实践驱动**: 理论与实践结合，边学边用

---

## 🚀 快速开始

### 🎯 三分钟快速上手

想要立即体验VoidMuse的强大功能？跟着我们的快速配置指南，三步搞定！

👉 **[📖 查看三步快速上手指南](doc/quick-start.md)**

> 💡 只需配置AI模型API密钥，就能开始使用基础功能。搜索和代码理解功能可以后续按需配置。

### 两种使用方式

#### 🎯 作为用户 - 直接使用插件

**VS Code安装**
1. 打开VS Code扩展商店 (Ctrl+Shift+X)
2. 搜索 "VoidMuse"
3. 点击安装并重启编辑器

**IntelliJ IDEA安装**
1. 打开 Settings → Plugins
2. 搜索 "VoidMuse"
3. 点击安装并重启IDE

#### 🔧 作为学习者 - 本地开发学习

```bash
# 克隆学习型项目
git clone https://github.com/your-org/voidmuse.git
cd voidmuse

# 安装前端依赖
cd gui
npm install

# 启动开发服务器
npm run dev

# 安装VS Code插件依赖
cd ../extensions/vscode
npm install

# 启动VS Code插件调试
npm run compile
# 按F5启动调试

# 构建IntelliJ插件
cd ../intellij
./gradlew buildPlugin
```

### 详细配置指南

如果你需要更详细的配置说明，可以查看以下文档：

- 🤖 **[AI模型配置](doc/freeLLMQuota.md)** - 获取免费API密钥和配置指南
- 🔍 **[搜索功能配置](doc/googleSearchConfig.md)** - Google搜索配置详细教程
- 🔍 **[博查搜索配置](doc/bochaSearchConfig.md)** - 国内搜索服务配置
- 🧠 **代码理解配置** - 使用相同的AI模型API即可

详细配置指南请参考：
- [基础配置指南](docs/basic-setup.md)
- [开发环境搭建](docs/dev-environment.md)
- [调试与学习技巧](docs/debug-and-learn.md)

---

## 🏗️ 整体架构

![VoidMuse架构图](doc/img/architecture.svg)

*VoidMuse采用模块化架构设计，支持多IDE平台，集成多种AI模型，提供完整的AI开发体验。*

详细架构文档：[技术架构说明](doc/architecture.md)

---

## 🔬 技术亮点与学习价值

### 🧠 AI工程化核心概念

- **Embedding技术**: 从原理到实践的完整解析
- **向量数据库**: 本地化索引与检索机制
- **上下文管理**: 大模型对话的上下文优化策略
- **MCP协议**: 多模态对话协议的标准化实现

### 🔧 开源组件生态

我们精心选择并整合了以下优秀开源组件：

#### 前端技术栈
- **React 18.x** - 现代化UI框架
- **TypeScript 5.x** - 类型安全的JavaScript超集
- **Vite 4.x** - 快速的前端构建工具
- **Ant Design 5.x** - 企业级UI设计语言
- **TipTap** - 富文本编辑器

#### AI相关组件
- **@ai-sdk/anthropic** - Claude模型集成
- **@ai-sdk/openai** - OpenAI模型支持
- **@ai-sdk/deepseek** - DeepSeek模型适配
- **@openrouter/ai-sdk-provider** - 多模型路由支持
- **@modelcontextprotocol/sdk** - MCP协议实现

#### IDE集成
- **VS Code Extension API** - VS Code插件开发
- **IntelliJ Platform SDK** - IDEA插件框架
- **Gradle** - Java项目构建工具

### 📖 深度学习资源

- [Codebase原理详解](docs/codebase-principles.md)
- [提高检索准确率的10种方法](docs/accuracy-optimization.md)
- [Embedding技术深度解析](docs/embedding-guide.md)
- [AI工程化最佳实践](docs/ai-engineering.md)
- [MCP协议技术解析](docs/mcp-protocol.md)

---

## 🛠️ 功能特性

### 🧠 智能代码补全 (AutoComplete)

- **技术原理**: 基于上下文感知的智能补全算法
- **学习价值**: 了解AI代码补全的实现机制
- **核心特性**: 
  - 实时代码分析
  - 上下文感知补全
  - 多语言支持

### 🔍 本地代码库索引 (Codebase)

- **技术原理**: 向量化存储 + 语义检索
- **学习价值**: 掌握向量数据库的构建与优化
- **核心特性**:
  - 本地化向量数据库
  - 语义相似度检索
  - 智能代码上下文提取
- **深度文档**: [Codebase技术原理](docs/codebase-deep-dive.md)

### 💬 多模型AI对话 (AI Chat)

- **技术原理**: 多轮对话 + 工具调用 + 上下文管理
- **学习价值**: 理解大模型应用的工程化实践
- **支持模型**:
  - OpenAI GPT系列
  - Anthropic Claude系列
  - DeepSeek系列
  - 通过OpenRouter支持更多模型

### 🔗 MCP协议支持

- **技术原理**: 标准化多模态对话协议
- **学习价值**: 跨平台AI交互的设计模式
- **协议特性**:
  - 工具调用标准化
  - 多模态数据处理
  - 可扩展的插件架构

### 🔍 智能搜索集成

- **支持引擎**: Google搜索、博查AI搜索
- **配置文档**: 
  - [Google搜索配置](doc/googleSearchConfig.md)
  - [博查搜索配置](doc/bochaSearchConfig.md)
- **免费资源**: [大模型厂商免费额度汇总](doc/freeLLMQuota.md)

---

## 📚 学习路径指南

### 🎯 适合人群

- AI工程师想了解IDE插件开发
- 前端/后端开发者想学习AI集成
- 学生和研究者想理解AI工程化
- 开源爱好者想参与AI项目

### 📖 推荐学习路径

#### 初级路径 (AI概念入门)
1. [什么是Embedding？](docs/embedding-basics.md)
2. [向量数据库基础](docs/vector-db-intro.md)
3. [大模型API使用指南](docs/llm-api-guide.md)

#### 高级路径 (工程实践)
1. [Codebase索引原理与实现](docs/codebase-implementation.md)
2. [提高检索准确率的策略](docs/retrieval-optimization.md)
3. [多模型适配架构设计](docs/multi-model-architecture.md)
4. [MCP协议深度解析](docs/mcp-deep-dive.md)

### 🛠️ 实践项目

- [构建你的第一个AI插件](docs/build-your-plugin.md)
- [自定义Embedding模型集成](docs/custom-embedding.md)
- [扩展MCP协议支持](docs/extend-mcp.md)
- [实现自定义搜索引擎](docs/custom-search.md)

---

## 🚀 未来功能规划

| 功能模块 | 核心特性 | 技术原理 | 计划时间 | 学习价值 |
|---------|---------|---------|---------|----------|
| 🧠 **上下文记忆** | 跨会话记忆、智能优先级、个性化学习 | 向量数据库 + 语义检索 | xxx | AI记忆系统设计 |
| 🗜️ **上下文压缩** | 动态长度管理、多级压缩、语义保持 | 智能摘要 + 分层压缩 | xxx | 大模型上下文优化 |
| 🤖 **Agent代码生成** | 需求分析、架构设计、自动实现、测试验证 | 多Agent协作框架 | xxx | AI驱动软件开发 |

### 🤝 参与开发

欢迎社区贡献：**算法优化** | **原型开发** | **测试验证** | **文档编写**

📖 技术文档：[记忆系统](docs/context-memory-design.md) | [压缩算法](docs/compression-algorithms.md) | [Agent架构](docs/agent-architecture.md) | [协作协议](docs/multi-agent-protocol.md)

---

## 📊 数据收集说明

### 🔒 隐私保护承诺

为了更好地了解用户使用情况并改进产品体验，VoidMuse在GUI界面中集成了**极简化的埋点功能**。我们承诺：

- ✅ **仅收集页面访问数据**：只记录页面进入和离开时间，用于计算页面停留时长
- ✅ **无敏感信息收集**：不收集任何代码内容、个人信息或操作细节
- ✅ **透明开源**：所有埋点代码完全开源，可在 `gui/src/services/AnalyticsService.ts` 中查看

### 📚 埋点技术学习价值

我们的埋点实现也是一个很好的**前端数据分析学习案例**：

- 🎯 **多平台支持**：同时集成Google Analytics和百度统计
- ⏱️ **精确计时**：页面停留时间的准确计算方法
- 🔄 **生命周期管理**：页面可见性变化的完整处理
- 🛡️ **异常处理**：埋点失败时的优雅降级

---

## 🤝 贡献指南

我们欢迎各种形式的贡献！无论是Bug修复、功能开发、文档完善还是技术分享，都能让VoidMuse变得更好。

详细贡献指南：[贡献指南](doc/contributing.md)

### 快速开始贡献

1. **Fork项目** 到你的GitHub账户
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启Pull Request**

---

## 🙏 致谢

### 开源组件致谢

感谢以下优秀的开源项目：

- [React](https://reactjs.org/) - 用户界面构建库
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- [AI SDK](https://sdk.vercel.ai/) - 统一的AI模型接口
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI工具调用标准
- [TipTap](https://tiptap.dev/) - 无头富文本编辑器
- [VS Code Extension API](https://code.visualstudio.com/api) - VS Code扩展开发
- [IntelliJ Platform SDK](https://plugins.jetbrains.com/docs/intellij/) - IntelliJ插件开发


### 社区贡献者

感谢所有为项目贡献代码、文档和想法的开发者们。你们的贡献让VoidMuse变得更好！

## 📞 联系我们

- 🐛 **问题反馈**: [GitHub Issues](https://github.com/voidmuse-dev/voidmuse/issues)
- 📧 **邮箱联系**: voidmuse@qq.com

### 💬 社群交流

<div align="center">

| QQ交流群 | 微信交流群 |
|:---:|:---:|
| <img src="doc/img/qq-group.jpg" width="150" alt="QQ群二维码"/> |  |
| 扫码加入QQ群 | 扫码加入微信群 |
| 群号：865855850 | xxx |

</div>

> 💡 **提示**: 加群时请备注来源，方便管理员审核通过

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个Star！**

**🚀 让我们一起构建更智能的开发体验！**

</div>

---

## 📄 许可证

本项目采用 [Apache-2.0](LICENSE) 许可证，我们相信开源的力量。