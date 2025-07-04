// src/models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  fromUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  cryptocurrency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    validate: {
      min: 0.00000001
    }
  },
  fee: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('send', 'receive', 'buy', 'sell', 'swap'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '交易哈希(模拟)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['fromUserId']
    },
    {
      fields: ['toUserId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['cryptocurrency']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Transaction;