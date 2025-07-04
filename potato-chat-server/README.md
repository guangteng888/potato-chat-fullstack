# Potato Chat Server

🥔 一个功能完整的现代化实时聊天应用后端服务

## 特性

- 🔐 **安全认证** - JWT 令牌认证，bcrypt 密码加密
- 💬 **实时聊天** - WebSocket 支持，私聊和群聊
- 💰 **数字钱包** - 多币种支持，安全交易
- 🎮 **小程序平台** - 可扩展的小程序生态系统
- 📊 **系统监控** - 健康检查，日志记录
- 🗃️ **数据持久化** - SQLite/PostgreSQL 支持
- 🛡️ **安全防护** - 输入验证，速率限制，CORS

## 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Sequelize
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Logging**: Morgan

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 环境配置

```bash
cp .env.example .env
```

编辑 `.env` 文件设置你的配置。

### 启动开发服务器

```bash
pnpm run dev
```

服务器将在 http://localhost:3001 启动

### 运行测试

```bash
pnpm test
```

## 项目结构

```
potato-chat-server/
├── src/
│   ├── config/          # 配置文件
│   │   ├── config.js    # 应用配置
│   │   └── database.js  # 数据库配置
│   ├── controllers/     # 控制器
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── walletController.js
│   │   └── miniAppsController.js
│   ├── middleware/      # 中间件
│   │   ├── auth.js      # 认证中间件
│   │   └── validation.js # 验证中间件
│   ├── models/          # 数据模型
│   │   ├── User.js
│   │   ├── ChatRoom.js
│   │   ├── Message.js
│   │   ├── Wallet.js
│   │   ├── Transaction.js
│   │   └── MiniApp.js
│   ├── routes/          # 路由
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── wallet.js
│   │   ├── miniapps.js
│   │   └── health.js
│   ├── services/        # 服务
│   │   └── socketService.js
│   ├── utils/           # 工具函数
│   │   └── initDatabase.js
│   └── app.js           # 应用入口
├── test.js              # 测试脚本
├── package.json
└── README.md
```

## API 文档

详细的 API 文档请查看 [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### 主要端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/chat/rooms` - 获取聊天室列表
- `GET /api/wallet/balance` - 获取钱包余额
- `GET /api/miniapps` - 获取小程序列表
- `GET /api/health` - 健康检查

## WebSocket 事件

### 客户端事件
- `authenticate` - 用户认证
- `join_room` - 加入聊天室
- `send_message` - 发送消息
- `typing_start` / `typing_stop` - 打字状态

### 服务器事件
- `authenticated` - 认证结果
- `new_message` - 新消息
- `user_status_update` - 用户状态更新
- `typing_start` / `typing_stop` - 打字指示器

## 数据模型

### 用户模型 (User)
```javascript
{
  id: String,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  status: Enum['online', 'offline', 'away', 'busy'],
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 聊天室模型 (ChatRoom)
```javascript
{
  id: String,
  name: String,
  type: Enum['private', 'group'],
  description: String,
  avatar: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 消息模型 (Message)
```javascript
{
  id: String,
  content: String,
  type: Enum['text', 'image', 'file', 'voice'],
  roomId: String,
  senderId: String,
  replyTo: String,
  timestamp: Date,
  edited: Boolean,
  deleted: Boolean
}
```

## 部署

### 开发环境
```bash
pnpm run dev
```

### 生产环境
详细的部署指南请查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Docker 部署
```bash
docker-compose up -d
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` |
| `JWT_SECRET` | JWT 密钥 | `potato-chat-secret-key` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `DB_HOST` | 数据库主机 | `localhost` |
| `DB_PORT` | 数据库端口 | `5432` |
| `DB_NAME` | 数据库名称 | `potato_chat` |
| `DB_USER` | 数据库用户 | `postgres` |
| `DB_PASSWORD` | 数据库密码 | - |

## 安全性

- ✅ JWT 令牌认证
- ✅ 密码 bcrypt 加密 
- ✅ 输入数据验证
- ✅ SQL 注入防护 (Sequelize ORM)
- ✅ XSS 防护 (express-validator)
- ✅ CORS 配置
- ✅ 速率限制
- ✅ 安全头设置

## 测试

运行所有测试：
```bash
pnpm test
```

运行特定测试：
```bash
pnpm test -- --grep "用户认证"
```

## 监控

### 健康检查
```bash
curl http://localhost:3001/api/health
```

### 日志
- 请求日志: 控制台输出
- 错误日志: `logs/error.log`
- 访问日志: `logs/access.log`

## 开发

### 代码规范
- ESLint 代码检查
- Prettier 代码格式化
- Husky Git 钩子

### 调试
```bash
pnpm run debug
```

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 性能

- 支持集群模式
- Redis 缓存支持
- 数据库连接池
- WebSocket 负载均衡
- 响应时间 < 100ms (平均)

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 支持

- 📧 Email: support@potato-chat.com
- 💬 Discord: [Potato Chat Community](https://discord.gg/potato-chat)
- 📖 文档: [docs.potato-chat.com](https://docs.potato-chat.com)

## 版本历史

- **v1.0.0** - 初始发布
  - 用户认证系统
  - 实时聊天功能
  - 钱包系统
  - 小程序平台
  - API 文档

## 路线图

- [ ] 文件上传功能
- [ ] 语音/视频通话
- [ ] 消息加密
- [ ] 推送通知
- [ ] 管理后台
- [ ] 多语言支持
- [ ] API 版本管理

---

由 ❤️ 和 🥔 制作
