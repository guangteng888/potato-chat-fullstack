// src/models/UserMiniApp.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserMiniApp = sequelize.define('UserMiniApp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  miniAppId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'MiniApps',
      key: 'id'
    }
  },
  installedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  appData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户在此小程序中的个人数据'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'miniAppId']
    },
    {
      fields: ['miniAppId']
    }
  ]
});

module.exports = UserMiniApp;