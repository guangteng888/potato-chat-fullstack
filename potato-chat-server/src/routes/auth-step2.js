// src/routes/auth-step2.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// 用户注册（暂时不使用验证器）
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取用户资料（需要认证）
router.get('/profile', authenticateToken, authController.getProfile);

// 更新用户资料（需要认证）
router.put('/profile', authenticateToken, authController.updateProfile);

// 搜索用户（需要认证）
router.get('/search', authenticateToken, authController.searchUsers);

module.exports = router;
