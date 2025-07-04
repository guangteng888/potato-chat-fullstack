// basic-server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://emb6d8pgbi.space.minimax.io", 
    "https://maqhs35als.space.minimax.io", 
    "https://um3sicg4zv.space.minimax.io", 
    "https://6pnppxaui5.space.minimax.io"
  ],
  credentials: true
}));

app.use(express.json());

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

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Potato Chat 基础服务器运行在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});
