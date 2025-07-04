// src/routes/wallet.js
const express = require('express');
const router = express.Router();

const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateTransfer,
  validatePagination 
} = require('../middleware/validation');

// 获取钱包余额（需要认证）
router.get('/balance', authenticateToken, walletController.getWalletBalance);

// 发送加密货币（需要认证和转账验证）
router.post('/send', authenticateToken, validateTransfer, walletController.sendCrypto);

// 获取交易历史（需要认证和分页验证）
router.get('/transactions', authenticateToken, validatePagination, walletController.getTransactionHistory);

module.exports = router;