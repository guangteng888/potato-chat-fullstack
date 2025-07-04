// src/app-step2.js - 数据库集成版本
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/config');
const initDatabase = require('./utils/initDatabase');

// 导入路由
const authRoutes = require('./routes/auth-step2');
const healthRoutes = require('./routes/health');

const app = express();
const server = http.createServer(app);

// 中间件配置

// 日志中间件
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// CORS 中间件
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// JSON 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // 用户相关路由也使用auth路由
app.use('/api/health', healthRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Potato Chat Server API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    docs: '/api/health'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误处理:', error);
  
  // 数据库连接错误
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: '数据库连接失败'
    });
  }
  
  // 验证错误
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: error.errors.map(e => e.message)
    });
  }
  
  // JWT 错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
  
  // 默认错误
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' ? '服务器内部错误' : error.message,
    ...(config.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 启动服务器
const startServer = async () => {
  try {
    console.log('正在初始化数据库...');
    // 初始化数据库
    await initDatabase();
    
    // 启动服务器
    server.listen(config.PORT, () => {
      console.log(`🚀 Potato Chat 服务器运行在端口 ${config.PORT}`);
      console.log(`🌍 环境: ${config.NODE_ENV}`);
      console.log(`💾 数据库: SQLite`);
      console.log(`📊 健康检查: http://localhost:${config.PORT}/api/health`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 如果这个文件被直接运行，则启动服务器
if (require.main === module) {
  startServer();
}

module.exports = { app, server };
