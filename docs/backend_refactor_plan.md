# Potato Chat 后端重构与完善计划

## 1. 目标

将现有基于内存的、功能不全的后端服务器，重构为一个功能完整、数据持久化、安全且可维护的模块化系统，使其完成度达到100%，以支持所有前端定义的功能。

## 2. 技术选型

-   **框架**: Express.js (保持现有)
-   **数据库**: SQLite (轻量级、文件型，适合本项目快速开发和部署)
-   **ORM**: Sequelize (功能强大，支持模型、迁移、关联)
-   **验证**: express-validator (强大的中间件，用于API输入验证)
-   **日志**: morgan (HTTP请求日志记录器)

## 3. 重构步骤

### 第一阶段：项目结构重构与环境搭建

1.  **创建新目录结构**：将单一的 `server.js` 分解为模块化的结构，包括 `src/config`, `src/models`, `src/controllers`, `src/routes`, `src/middleware`, `src/services`, `src/utils`。
2.  **安装新依赖**: 安装 `sequelize`, `sqlite3`, `express-validator`, `morgan` 等新包。
3.  **创建主应用文件**: 建立 `src/app.js` 作为新的应用入口，配置所有中间件和路由。
4.  **修改启动脚本**: 更新 `package.json` 的启动脚本，使其指向新的入口。

### 第二阶段：数据持久化与模型建立

1.  **配置数据库**: 在 `src/config` 中设置 Sequelize，连接到 SQLite 数据库文件。
2.  **定义数据模型**: 在 `src/models` 中为所有核心实体（User, ChatRoom, Message, Wallet, Transaction, MiniApp）创建 Sequelize 模型，并定义它们之间的关联。
3.  **同步数据库**: 编写一个脚本，用于在应用启动时同步模型到数据库，创建相应的表结构。

### 第三阶段：功能模块化实现 (API & 逻辑)

我将逐个模块地重写和实现后端逻辑，确保每个模块都经过充分的开发和验证。

1.  **用户认证与安全 (`/api/auth`, `/api/user`)**
    -   [ ] 重构注册和登录逻辑，使用 User 模型进行数据库操作。
    -   [ ] 实现用户个人资料更新、头像上传（模拟）、用户搜索功能。
    -   [ ] 创建 `auth` 中间件，使用 JWT 保护需要认证的路由。
    -   [ ] 为所有认证和用户相关的路由添加输入验证。

2.  **聊天功能 (`/api/chat` & Socket.IO)**
    -   [ ] 重构聊天室创建、获取列表的逻辑，使用 ChatRoom 和 Message 模型。
    -   [ ] 将 Socket.IO 逻辑移至 `src/services/socketService.js`。
    -   [ ] 修改 Socket.IO 事件处理器，将收发的消息持久化到数据库。
    -   [ ] 实现消息历史记录的数据库分页查询。

3.  **钱包系统 (`/api/wallet`)**
    -   [ ] 实现获取钱包余额、发起交易、查询交易历史的 API。
    -   [ ] 所有操作都将通过 Wallet 和 Transaction 模型与数据库交互。
    -   [ ] 添加安全检查，确保用户只能访问自己的钱包。

4.  **小程序平台 (`/api/miniapps`)**
    -   [ ] 实现获取小程序列表、安装、卸载的 API。
    -   [ ] 创建 `UserMiniApps` 关联表来管理用户和已安装小程序的关系。

### 第四阶段：收尾与文档

1.  **添加日志与监控**: 集成 `morgan` 用于请求日志，并创建一个 `/api/health` 健康检查端点。
2.  **编写API文档**: 创建一份简洁的 API 文档，说明所有端点、请求格式和响应。
3.  **最终测试**: 编写一个简单的测试脚本来验证所有 API 端点的功能和安全性。

## 4. 预期交付成果

-   一个结构清晰、模块化的 `potato-chat-server` 项目。
-   一个 `database.sqlite` 文件，包含所有数据表。
-   完整的 API 实现，与前端 `apiService.ts` 的定义相匹配。
-   包含 JWT 认证和输入验证的安全机制。
-   一份 `README.md`，包含项目介绍、API 文档和启动说明。
