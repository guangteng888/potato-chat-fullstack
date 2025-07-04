// src/routes/health.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

// 健康检查端点
router.get('/', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is not healthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

module.exports = router;