// src/routes/auth-simple.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController-simple');

// 用户注册（无验证器，先测试基本功能）
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

module.exports = router;
