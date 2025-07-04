# Potato Chat Mobile

🥔📱 Potato Chat 移动版 - 基于 Capacitor 的跨平台移动应用

## 🚀 特性

### 跨平台支持
- **Android**: Android 7.0+ (API 24+)
- **iOS**: iOS 13.0+
- **一次开发，多平台运行**: 基于 Web 技术栈

### 原生功能集成
- **推送通知**: 实时消息推送
- **设备集成**: 相机、定位、文件系统
- **生物识别**: Touch ID/Face ID 支持
- **本地存储**: 离线数据缓存
- **网络检测**: 自动处理网络状态变化

### 核心功能
- **实时聊天**: WebSocket 即时通讯
- **数字钱包**: 完整钱包管理系统
- **小程序生态**: 丰富的应用商店
- **用户系统**: 个人资料和设置管理

## 🛠️ 技术架构

### 核心技术栈
- **Capacitor 6**: 跨平台原生容器
- **React 18**: 现代化前端框架
- **TypeScript**: 类型安全开发
- **Vite**: 快速构建工具

### 移动端插件
- **@capacitor/app**: 应用生命周期管理
- **@capacitor/splash-screen**: 启动屏幕
- **@capacitor/status-bar**: 状态栏控制
- **@capacitor/keyboard**: 键盘行为管理
- **@capacitor/push-notifications**: 推送通知
- **@capacitor/local-notifications**: 本地通知
- **@capacitor/device**: 设备信息获取
- **@capacitor/network**: 网络状态监控
- **@capacitor/filesystem**: 文件系统访问
- **@capacitor/preferences**: 本地存储
- **@capacitor/share**: 系统分享
- **@capacitor/camera**: 相机功能
- **@capacitor/geolocation**: 定位服务
- **@capacitor/haptics**: 触觉反馈

## 🔨 开发环境

### 环境要求
- **Node.js**: 18+
- **npm**: 最新版本
- **Android Studio**: Android 开发
- **Xcode**: iOS 开发 (仅 macOS)

### 项目初始化
```bash
# 安装依赖
npm install

# 构建 Web 应用
npm run build:web

# 同步到原生平台
npm run sync
```

## 📱 Android 开发

### 环境配置
1. **安装 Android Studio**
2. **配置 Android SDK**
3. **设置环境变量**:
   ```bash
   export ANDROID_HOME=/path/to/android-sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### 开发流程
```bash
# 打开 Android 项目
npm run android

# 在设备上运行
npm run run:android

# 构建 APK
npm run build:android
```

### 构建发布
- **调试版本**: 自动生成调试证书
- **发布版本**: 需要配置签名证书
- **AAB 格式**: 支持 Google Play Bundle

## 📱 iOS 开发

### 环境配置
1. **安装 Xcode** (macOS 必需)
2. **安装 CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```
3. **配置开发者账号**

### 开发流程
```bash
# 打开 Xcode 项目
npm run ios

# 在模拟器运行
npm run run:ios

# 构建 IPA
npm run build:ios
```

### 发布准备
- **开发者证书**: 配置签名证书
- **描述文件**: 设置 Provisioning Profile
- **App Store**: 提交审核

## 🎨 应用配置

### 基本信息
- **App ID**: `com.potato.chat.mobile`
- **应用名称**: Potato Chat
- **版本**: 1.0.0
- **最小系统版本**: Android 7.0 / iOS 13.0

### 权限配置
#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE" />
```

#### iOS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>此应用需要访问相机以拍摄照片</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>此应用需要访问位置以提供位置相关服务</string>
<key>NSMicrophoneUsageDescription</key>
<string>此应用需要访问麦克风以录制语音消息</string>
```

## 🎯 构建流程

### 开发构建
```bash
# 1. 构建 Web 应用
npm run build:web

# 2. 同步到原生平台
npm run sync

# 3. 在原生 IDE 中运行
npm run android  # 或 npm run ios
```

### 生产构建
```bash
# Android APK
cd android
./gradlew assembleRelease

# iOS Archive
# 在 Xcode 中: Product → Archive
```

## 📊 性能优化

### 应用大小
- **Android APK**: ~15MB (预估)
- **iOS IPA**: ~20MB (预估)
- **首次加载**: <3秒
- **后续启动**: <1秒

### 优化策略
- **代码分割**: 按需加载组件
- **资源压缩**: 图片和字体优化
- **缓存策略**: 智能数据缓存
- **网络优化**: 请求合并和重试

## 🔧 调试指南

### 日志输出
```bash
# Android 日志
adb logcat | grep -i capacitor

# iOS 日志
# 在 Xcode Console 中查看
```

### 常见问题
1. **白屏问题**
   - 检查 Web 构建是否成功
   - 确认资源路径正确
   - 查看控制台错误信息

2. **插件不工作**
   - 确认插件已正确安装
   - 检查原生权限配置
   - 重新同步项目

3. **网络请求失败**
   - 配置网络安全策略
   - 检查 HTTPS 证书
   - 确认 CORS 设置

## 🔐 安全性

### 数据保护
- **HTTPS 强制**: 所有网络请求使用 HTTPS
- **本地加密**: 敏感数据本地加密存储
- **证书锁定**: 防止中间人攻击
- **权限最小化**: 仅请求必要权限

### 应用安全
- **代码混淆**: 保护应用逻辑
- **防逆向**: 防止应用被篡改
- **运行时保护**: 检测调试和注入
- **数据完整性**: 验证数据传输完整性

## 📱 用户体验

### 界面适配
- **响应式设计**: 适配不同屏幕尺寸
- **暗黑模式**: 支持系统主题切换
- **无障碍**: 遵循无障碍设计规范
- **手势支持**: 原生手势操作

### 性能体验
- **流畅动画**: 60FPS 动画效果
- **快速响应**: <100ms 交互响应
- **智能预加载**: 提前加载常用内容
- **离线支持**: 离线状态下基本功能可用

## 📝 发布检查清单

### Android 发布
- [ ] 更新版本号和版本代码
- [ ] 配置签名证书
- [ ] 优化 ProGuard 规则
- [ ] 测试不同设备和 Android 版本
- [ ] 准备 Google Play 商店资料

### iOS 发布
- [ ] 更新版本号和构建号
- [ ] 配置发布证书
- [ ] 设置 App Store 元数据
- [ ] 测试不同设备和 iOS 版本
- [ ] 准备 App Store 审核资料

### 通用检查
- [ ] 功能完整性测试
- [ ] 性能和内存测试
- [ ] 网络异常情况测试
- [ ] 用户体验测试
- [ ] 安全性检查

## 🤝 开发团队

### 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 推送到分支
5. 创建 Pull Request

### 代码规范
- **TypeScript**: 严格类型检查
- **ESLint**: 代码风格检查
- **Prettier**: 代码格式化
- **Husky**: Git Hook 检查

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**Potato Chat Mobile** - 随时随地，畅快沟通 🥔📱✨

## 🔗 相关链接

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android 开发指南](https://developer.android.com/)
- [iOS 开发指南](https://developer.apple.com/ios/)
- [React 官方文档](https://react.dev/)
