// src/config/config.js
require('dotenv').config();

module.exports = {
  // 服务器配置
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT配置
  JWT_SECRET: process.env.JWT_SECRET || 'potato-chat-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS配置
  CORS_ORIGIN: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://emb6d8pgbi.space.minimax.io", 
    "https://maqhs35als.space.minimax.io", 
    "https://um3sicg4zv.space.minimax.io", 
    "https://6pnppxaui5.space.minimax.io"
  ],
  
  // 上传配置
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // 安全配置
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15分钟
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 每个IP最多100次请求
  
  // 钱包配置
  DEFAULT_CRYPTOCURRENCIES: [
    { symbol: 'BTC', name: 'Bitcoin', initialBalance: 0 },
    { symbol: 'ETH', name: 'Ethereum', initialBalance: 0 },
    { symbol: 'USDT', name: 'Tether', initialBalance: 0 }
  ]
};