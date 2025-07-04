# Potato Chat API 文档

## 概述

Potato Chat API 是一个完整的实时聊天应用后端服务，支持用户认证、实时消息、钱包功能和小程序平台。

**基础 URL:** `http://localhost:3001/api`

**认证方式:** JWT Bearer Token

## 认证相关 API

### 用户注册
```http
POST /auth/register
```

**请求体:**
```json
{
  "username": "string (3-50字符)",
  "email": "string (有效邮箱格式)",
  "password": "string (最少6字符)"
}
```

**响应:**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string",
      "status": "online",
      "createdAt": "timestamp"
    },
    "token": "string"
  }
}
```

### 用户登录
```http
POST /auth/login
```

**请求体:**
```json
{
  "identifier": "string (用户名或邮箱)",
  "password": "string"
}
```

**响应:**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string",
      "status": "online"
    },
    "token": "string"
  }
}
```

### 刷新令牌
```http
POST /auth/refresh
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "string"
  }
}
```

### 用户登出
```http
POST /auth/logout
```

**请求头:**
```
Authorization: Bearer <token>
```

## 用户管理 API

### 获取用户资料
```http
GET /user/profile
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string",
      "status": "string",
      "lastSeen": "timestamp"
    }
  }
}
```

### 更新用户资料
```http
PUT /user/profile
```

**请求头:**
```
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "username": "string (可选)",
  "email": "string (可选)",
  "avatar": "string (可选)"
}
```

### 搜索用户
```http
GET /user/search?q=<搜索关键词>
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "username": "string",
        "avatar": "string",
        "status": "string"
      }
    ]
  }
}
```

## 聊天功能 API

### 获取聊天室列表
```http
GET /chat/rooms
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "string",
        "name": "string",
        "type": "private|group",
        "avatar": "string",
        "lastMessage": {
          "content": "string",
          "timestamp": "timestamp",
          "senderId": "string"
        },
        "members": ["string"],
        "unreadCount": 0
      }
    ]
  }
}
```

### 创建群聊
```http
POST /chat/group
```

**请求头:**
```
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "name": "string",
  "memberIds": ["string"]
}
```

### 获取消息历史
```http
GET /chat/messages/:roomId?page=1&limit=50
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "string",
        "content": "string",
        "type": "text|image|file",
        "senderId": "string",
        "timestamp": "timestamp",
        "edited": false,
        "replyTo": "string (可选)"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100
    }
  }
}
```

## 钱包功能 API

### 获取钱包余额
```http
GET /wallet/balance
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "balances": [
      {
        "currency": "BTC",
        "balance": 0.5,
        "usdValue": 32500.00
      }
    ]
  }
}
```

### 发送交易
```http
POST /wallet/send
```

**请求头:**
```
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "to": "string (接收者用户ID)",
  "amount": 0.1,
  "currency": "BTC",
  "password": "string (交易密码)"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "transactionId": "string"
  }
}
```

### 获取交易历史
```http
GET /wallet/transactions?page=1&limit=20
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "string",
        "type": "send|receive",
        "amount": 0.1,
        "currency": "BTC",
        "from": "string",
        "to": "string",
        "status": "pending|confirmed|failed",
        "timestamp": "timestamp",
        "hash": "string"
      }
    ]
  }
}
```

## 小程序平台 API

### 获取小程序列表
```http
GET /miniapps
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "apps": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "icon": "string",
        "version": "string",
        "category": "string",
        "isInstalled": false,
        "rating": 4.5,
        "downloads": 1000
      }
    ]
  }
}
```

### 安装小程序
```http
POST /miniapps/:appId/install
```

**请求头:**
```
Authorization: Bearer <token>
```

### 卸载小程序
```http
DELETE /miniapps/:appId/install
```

**请求头:**
```
Authorization: Bearer <token>
```

## 系统 API

### 健康检查
```http
GET /health
```

**响应:**
```json
{
  "status": "ok",
  "timestamp": "timestamp",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## WebSocket 事件

### 连接和认证
```javascript
// 连接
const socket = io('http://localhost:3001');

// 认证
socket.emit('authenticate', token);

// 认证结果
socket.on('authenticated', (data) => {
  if (data.success) {
    console.log('认证成功');
  }
});
```

### 聊天事件

**客户端发送:**
```javascript
// 加入聊天室
socket.emit('join_room', roomId);

// 发送消息
socket.emit('send_message', {
  roomId: 'room_id',
  content: '消息内容',
  type: 'text'
});

// 开始打字
socket.emit('typing_start', { roomId: 'room_id' });

// 停止打字
socket.emit('typing_stop', { roomId: 'room_id' });
```

**服务器发送:**
```javascript
// 新消息
socket.on('new_message', (message) => {
  console.log('收到新消息:', message);
});

// 用户状态更新
socket.on('user_status_update', (data) => {
  console.log('用户状态更新:', data);
});

// 打字指示器
socket.on('typing_start', (data) => {
  console.log('用户开始打字:', data);
});

socket.on('typing_stop', (data) => {
  console.log('用户停止打字:', data);
});
```

## 错误响应格式

```json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

## 常见错误代码

- `INVALID_TOKEN` - 无效的认证令牌
- `USER_NOT_FOUND` - 用户不存在
- `INVALID_CREDENTIALS` - 无效的登录凭证
- `VALIDATION_ERROR` - 输入验证错误
- `INSUFFICIENT_BALANCE` - 余额不足
- `ROOM_NOT_FOUND` - 聊天室不存在
- `PERMISSION_DENIED` - 权限不足
