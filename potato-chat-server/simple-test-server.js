// 最简单的测试服务器
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// 基本中间件
app.use(cors());
app.use(express.json());

// 内存存储
const users = new Map();
const generateId = () => Math.random().toString(36).substr(2, 9);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 用户注册
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: '请提供完整的注册信息'
    });
  }
  
  // 检查用户是否已存在
  const existingUser = Array.from(users.values()).find(
    user => user.email === email || user.username === username
  );
  
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: '用户名或邮箱已存在'
    });
  }
  
  // 创建用户
  const userId = generateId();
  const user = {
    id: userId,
    username,
    email,
    createdAt: new Date()
  };
  
  users.set(userId, user);
  
  res.status(201).json({
    success: true,
    message: '注册成功',
    data: {
      user: { id: user.id, username: user.username, email: user.email }
    }
  });
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: '请提供登录信息'
    });
  }
  
  const user = Array.from(users.values()).find(
    user => user.email === identifier || user.username === identifier
  );
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '用户不存在'
    });
  }
  
  // 简化版 - 不验证密码
  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: { id: user.id, username: user.username, email: user.email },
      token: 'simple-test-token-' + generateId()
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 简单测试服务器启动成功！`);
  console.log(`🌐 服务器地址: http://localhost:${PORT}`);
  console.log(`🔍 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📝 用户注册: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 用户登录: POST http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;
