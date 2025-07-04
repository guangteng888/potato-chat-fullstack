// src/routes/auth.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate 
} = require('../middleware/validation');

// 用户注册
router.post('/register', validateRegistration, authController.register);

// 用户登录
router.post('/login', validateLogin, authController.login);

// 获取用户资料（需要认证）
router.get('/profile', authenticateToken, authController.getProfile);

// 更新用户资料（需要认证）
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);

// 搜索用户（需要认证）
router.get('/search', authenticateToken, authController.searchUsers);

// 获取用户设置（需要认证）
router.get('/settings', authenticateToken, authController.getSettings);

// 更新用户设置（需要认证）
router.put('/settings', authenticateToken, authController.updateSettings);

module.exports = router;