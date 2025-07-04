# Potato Chat Desktop

🥔 Potato Chat 桌面版 - 基于 Electron 的跨平台即时通讯应用

## 🚀 特性

### 桌面原生体验
- **跨平台支持**: Windows, macOS, Linux
- **原生窗口**: 完整的桌面应用体验
- **系统集成**: 托盘图标、开机自启动
- **快捷键**: 全面的键盘快捷键支持

### 核心功能
- **实时聊天**: 基于 WebSocket 的即时通讯
- **数字钱包**: 完整的钱包管理系统
- **小程序生态**: 丰富的小程序商店
- **用户管理**: 个人资料和设置管理

### 技术特性
- **现代架构**: Electron + React + TypeScript
- **安全性**: 上下文隔离、预加载脚本
- **性能优化**: 懒加载、内存管理
- **自动更新**: 内置更新检查机制

## 🛠️ 开发

### 环境要求
- Node.js 18+
- npm 或 yarn
- Electron 32+

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 启动桌面应用 (开发模式)
npm run start

# 同时启动 Web 开发服务器
npm run dev
```

### 构建打包
```bash
# 构建所有平台
npm run build

# 构建特定平台
npm run build:windows
npm run build:mac
npm run build:linux
```

## 📦 发布包

### Windows
- **格式**: NSIS 安装包 (.exe)
- **架构**: x64, ia32
- **特性**: 安装向导、桌面快捷方式、开始菜单

### macOS
- **格式**: DMG 磁盘映像 (.dmg)
- **架构**: x64, arm64 (Apple Silicon)
- **特性**: 代码签名、公证、安全权限

### Linux
- **格式**: AppImage (.AppImage), Debian 包 (.deb)
- **架构**: x64
- **特性**: 便携式应用、包管理器集成

## 🎮 使用指南

### 基本操作
- **启动应用**: 双击桌面图标
- **最小化到托盘**: 点击窗口关闭按钮
- **显示/隐藏**: 双击托盘图标
- **完全退出**: 右键托盘图标 → 退出

### 快捷键
- `Ctrl/Cmd + N`: 新建聊天
- `Ctrl/Cmd + ,`: 打开设置
- `Ctrl/Cmd + Q`: 退出应用
- `F11`: 全屏切换 (Windows/Linux)
- `Ctrl/Cmd + Shift + I`: 开发者工具

### 系统功能
- **开机自启动**: 右键托盘图标设置
- **系统通知**: 新消息通知提醒
- **窗口状态**: 自动记住窗口大小和位置

## 🔧 配置

### 应用设置
应用设置存储在系统用户目录：
- **Windows**: `%APPDATA%/potato-chat-desktop`
- **macOS**: `~/Library/Application Support/potato-chat-desktop`
- **Linux**: `~/.config/potato-chat-desktop`

### 环境变量
- `NODE_ENV`: 设置为 `development` 启用开发模式
- `ELECTRON_ENABLE_LOGGING`: 启用详细日志
- `ELECTRON_DISABLE_SECURITY_WARNINGS`: 禁用安全警告

## 🔐 安全性

### 安全特性
- **上下文隔离**: 主进程与渲染进程隔离
- **预加载脚本**: 安全的API暴露机制
- **CSP策略**: 内容安全策略保护
- **权限控制**: 最小权限原则

### 更新机制
- **自动检查**: 启动时检查更新
- **安全下载**: 签名验证更新包
- **增量更新**: 减少下载大小
- **回滚保护**: 更新失败自动回滚

## 📊 性能

### 资源占用
- **内存**: ~200MB (典型使用)
- **CPU**: <10% (空闲时)
- **启动时间**: <3秒
- **响应时间**: <100ms

### 优化策略
- **懒加载**: 按需加载组件
- **内存管理**: 定期清理缓存
- **网络优化**: 请求合并和缓存
- **渲染优化**: 虚拟滚动和防抖

## 🐛 故障排除

### 常见问题
1. **应用无法启动**
   - 检查 Node.js 版本 (需要 18+)
   - 重新安装依赖: `npm install`
   - 清除缓存: `npm cache clean --force`

2. **网络连接问题**
   - 检查防火墙设置
   - 确认 WebSocket 连接
   - 检查代理配置

3. **托盘图标不显示**
   - 重启应用
   - 检查系统通知设置
   - 更新显卡驱动

### 调试模式
```bash
# 启用详细日志
ELECTRON_ENABLE_LOGGING=1 npm start

# 调试主进程
npm start --inspect=9229

# 调试渲染进程
# 在应用中按 Ctrl/Cmd + Shift + I
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

**Potato Chat Desktop** - 让沟通更简单，让连接更紧密 🥔✨