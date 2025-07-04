// src/models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  chatRoomId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'ChatRooms',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'voice', 'video', 'location', 'system'),
    defaultValue: 'text'
  },
  status: {
    type: DataTypes.ENUM('sending', 'sent', 'delivered', 'read'),
    defaultValue: 'sent'
  },
  replyToId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Messages',
      key: 'id'
    }
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data for files, images, etc.'
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      fields: ['chatRoomId', 'createdAt']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['replyToId']
    }
  ],
  paranoid: true // 启用软删除
});

module.exports = Message;