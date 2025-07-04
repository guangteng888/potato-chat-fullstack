// src/models/ChatRoom.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('private', 'group', 'channel'),
    allowNull: false,
    defaultValue: 'private'
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      muted: false,
      pinned: false,
      archived: false,
      allowFileSharing: true,
      allowVoiceCalls: true,
      allowVideoConference: true
    }
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['lastActivity']
    }
  ]
});

module.exports = ChatRoom;