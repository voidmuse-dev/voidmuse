# 🤝 贡献指南

## 🎯 贡献方式

- 🐛 **Bug修复**: 帮助改进插件稳定性
- ✨ **功能开发**: 添加新的AI功能
- 📖 **文档完善**: 补充技术原理文档
- 🧪 **测试用例**: 提高代码覆盖率
- 🎓 **教程编写**: 分享学习心得

## 📚 学习型贡献

我们特别欢迎以下类型的贡献：
- AI概念解释文档
- 技术原理深度分析
- 最佳实践案例分享
- 性能优化方案
- 新模型集成教程

## 🔧 开发指南

### 基本流程

1. **Fork项目** 到你的GitHub账户
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启Pull Request**

### 开发环境搭建

#### 前端开发环境
```bash
# 克隆项目
git clone https://github.com/your-org/voidmuse.git
cd voidmuse

# 安装前端依赖
cd gui
npm install

# 启动开发服务器
npm run dev
```

#### VS Code插件开发
```bash
# 安装VS Code插件依赖
cd extensions/vscode
npm install

# 编译插件
npm run compile

# 启动调试 (按F5)
```

#### IntelliJ插件开发
```bash
# 构建IntelliJ插件
cd extensions/intellij
./gradlew buildPlugin

# 运行插件
./gradlew runIde
```

## 📋 开发规范

### 代码规范
- [开发环境搭建](dev-setup.md)
- [代码规范](coding-standards.md)
- [文档编写规范](doc-standards.md)
- [测试指南](testing-guide.md)
- [提交信息规范](commit-standards.md)

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 类型说明
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### 示例
```
feat(ai-chat): 添加Claude模型支持

fix(vscode): 修复代码补全在TypeScript文件中的问题

docs: 更新安装指南
```

### 代码审查

#### Pull Request要求
1. **清晰的标题和描述**
2. **关联相关Issue**
3. **包含测试用例**
4. **更新相关文档**
5. **通过所有CI检查**

#### 审查清单
- [ ] 代码符合项目规范
- [ ] 功能正常工作
- [ ] 包含适当的测试
- [ ] 文档已更新
- [ ] 无安全隐患
- [ ] 性能影响可接受


## 📖 文档贡献

### 文档类型

#### 技术文档
- API文档
- 架构设计文档
- 技术原理解析
- 最佳实践指南

#### 用户文档
- 安装指南
- 使用教程
- 配置说明
- 故障排除

#### 开发文档
- 开发环境搭建
- 代码规范
- 贡献指南
- 发布流程

### 文档规范

#### Markdown规范
- 使用标准Markdown语法
- 代码块指定语言
- 图片使用相对路径
- 链接检查有效性

#### 内容规范
- 结构清晰，层次分明
- 语言简洁，表达准确
- 包含实际示例
- 及时更新维护



感谢你对VoidMuse项目的关注和贡献！让我们一起构建更智能的开发体验！