// src/controllers/walletController.js
const { Wallet, Transaction, User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// 获取钱包余额
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.userId;

    const wallets = await Wallet.findAll({
      where: { userId, isActive: true },
      attributes: ['id', 'cryptocurrency', 'balance', 'frozenBalance', 'address', 'lastActivity']
    });

    // 模拟加密货币价格（实际项目中应该从外部API获取）
    const mockPrices = {
      'BTC': 65000,
      'ETH': 3200,
      'USDT': 1
    };

    const balances = wallets.map(wallet => ({
      ...wallet.toJSON(),
      usdValue: parseFloat(wallet.balance) * (mockPrices[wallet.cryptocurrency] || 0),
      price: mockPrices[wallet.cryptocurrency] || 0,
      change24h: Math.random() * 10 - 5 // 模拟24小时涨跌幅
    }));

    res.json({
      success: true,
      data: { balances }
    });
  } catch (error) {
    console.error('获取钱包余额错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 发送加密货币
const sendCrypto = async (req, res) => {
  try {
    const { to, amount, currency, password } = req.body;
    const fromUserId = req.userId;

    // 验证交易密码（这里简化为用户登录密码）
    const user = await User.findByPk(fromUserId);
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '交易密码错误'
      });
    }

    // 查找收款人
    const toUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: to },
          { email: to },
          { id: to }
        ]
      }
    });

    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: '收款人不存在'
      });
    }

    if (toUser.id === fromUserId) {
      return res.status(400).json({
        success: false,
        message: '不能向自己转账'
      });
    }

    // 检查发送方余额
    const fromWallet = await Wallet.findOne({
      where: { userId: fromUserId, cryptocurrency: currency, isActive: true }
    });

    if (!fromWallet) {
      return res.status(404).json({
        success: false,
        message: '钱包不存在'
      });
    }

    const transferAmount = parseFloat(amount);
    const fee = transferAmount * 0.001; // 0.1% 手续费
    const totalAmount = transferAmount + fee;

    if (parseFloat(fromWallet.balance) < totalAmount) {
      return res.status(400).json({
        success: false,
        message: '余额不足'
      });
    }

    // 检查或创建收款方钱包
    let toWallet = await Wallet.findOne({
      where: { userId: toUser.id, cryptocurrency: currency, isActive: true }
    });

    if (!toWallet) {
      toWallet = await Wallet.create({
        userId: toUser.id,
        cryptocurrency: currency,
        balance: 0,
        address: `${currency.toLowerCase()}_${toUser.id}_${Math.random().toString(36).substr(2, 8)}`
      });
    }

    // 创建交易记录
    const transaction = await Transaction.create({
      fromUserId,
      toUserId: toUser.id,
      cryptocurrency: currency,
      amount: transferAmount,
      fee,
      type: 'send',
      status: 'pending',
      txHash: `tx_${Math.random().toString(36).substr(2, 16)}`,
      description: `转账给 ${toUser.username}`
    });

    // 执行转账（这里简化处理，实际应该使用数据库事务）
    try {
      // 扣除发送方余额
      await fromWallet.update({
        balance: parseFloat(fromWallet.balance) - totalAmount,
        lastActivity: new Date()
      });

      // 增加接收方余额
      await toWallet.update({
        balance: parseFloat(toWallet.balance) + transferAmount,
        lastActivity: new Date()
      });

      // 更新交易状态
      await transaction.update({
        status: 'confirmed',
        completedAt: new Date()
      });

      res.json({
        success: true,
        message: '转账成功',
        data: { transactionId: transaction.id }
      });
    } catch (error) {
      // 如果转账失败，回滚交易状态
      await transaction.update({ status: 'failed' });
      throw error;
    }
  } catch (error) {
    console.error('发送加密货币错误:', error);
    res.status(500).json({
      success: false,
      message: '转账失败，请稍后重试'
    });
  }
};

// 获取交易历史
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.findAndCountAll({
      where: {
        [Op.or]: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // 格式化交易数据
    const formattedTransactions = transactions.rows.map(tx => {
      const txData = tx.toJSON();
      const isReceived = txData.toUserId === userId;
      
      return {
        ...txData,
        direction: isReceived ? 'received' : 'sent',
        counterparty: isReceived ? txData.fromUser : txData.toUser
      };
    });

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          total: transactions.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(transactions.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取交易历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getWalletBalance,
  sendCrypto,
  getTransactionHistory
};