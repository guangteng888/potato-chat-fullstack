// src/app-simple.js
const express = require('express');
const http = require('http');
const cors = require('cors');

const config = require('./config/config');

const app = express();
const server = http.createServer(app);

// 中间件配置
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: 'Potato Chat Server API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' ? '服务器内部错误' : error.message,
    ...(config.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 启动服务器
const startServer = async () => {
  try {
    server.listen(config.PORT, () => {
      console.log(`🚀 Potato Chat 服务器运行在端口 ${config.PORT}`);
      console.log(`🌍 环境: ${config.NODE_ENV}`);
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
