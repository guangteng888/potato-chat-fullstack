// src/models/Wallet.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  cryptocurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 10] // BTC, ETH, USDT等
    }
  },
  balance: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  frozenBalance: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '钱包地址(模拟)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'cryptocurrency']
    },
    {
      fields: ['cryptocurrency']
    }
  ]
});

module.exports = Wallet;