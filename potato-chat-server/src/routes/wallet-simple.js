// src/routes/wallet-simple.js
const express = require('express');
const router = express.Router();

const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// 获取钱包余额（需要认证）
router.get('/balance', authenticateToken, walletController.getWalletBalance);

// 获取交易历史（需要认证）
router.get('/transactions', authenticateToken, walletController.getTransactionHistory);

// 转账（需要认证）
router.post('/transfer', authenticateToken, walletController.sendCrypto);

module.exports = router;
