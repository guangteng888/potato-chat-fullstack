// src/routes/health-simple.js
const express = require('express');
const router = express.Router();

// 健康检查端点
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
