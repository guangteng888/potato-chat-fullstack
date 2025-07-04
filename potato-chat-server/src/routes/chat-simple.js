// src/routes/chat-simple.js
const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// 获取聊天室列表（需要认证）
router.get('/rooms', authenticateToken, chatController.getChatRooms);

// 创建群聊（需要认证）
router.post('/group', authenticateToken, chatController.createGroupChat);

// 创建私聊（需要认证）
router.post('/private', authenticateToken, chatController.createPrivateChat);

// 获取聊天记录（需要认证）
router.get('/messages/:roomId', authenticateToken, chatController.getMessageHistory);

module.exports = router;
