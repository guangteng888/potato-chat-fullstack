// src/models/ChatRoomMember.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatRoomMember = sequelize.define('ChatRoomMember', {
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
  chatRoomId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'ChatRooms',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('member', 'admin', 'owner'),
    defaultValue: 'member'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastReadMessageId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'chatRoomId']
    },
    {
      fields: ['chatRoomId']
    }
  ]
});

module.exports = ChatRoomMember;