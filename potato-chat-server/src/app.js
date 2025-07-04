// src/app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const initDatabase = require('./utils/initDatabase');
const initializeSocket = require('./services/socketService');

// 导入路由
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const walletRoutes = require('./routes/wallet');
const miniAppsRoutes = require('./routes/miniapps');
const healthRoutes = require('./routes/health');

const app = express();
const server = http.createServer(app);

// Socket.IO 配置
const io = socketIo(server, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 初始化Socket.IO服务
initializeSocket(io);

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

// 速率限制中间件
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 为认证路由应用更严格的速率限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多10次认证尝试
  message: {
    success: false,
    message: '认证尝试过于频繁，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // 用户相关路由也使用auth路由
app.use('/api/chat', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/miniapps', miniAppsRoutes);
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

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 启动服务器
    server.listen(config.PORT, () => {
      console.log(`🚀 Potato Chat 服务器运行在端口 ${config.PORT}`);
      console.log(`🌍 环境: ${config.NODE_ENV}`);
      console.log(`📡 WebSocket 服务器已启动`);
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

module.exports = { app, server, io };