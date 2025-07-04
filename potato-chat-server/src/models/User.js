// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [60, 60] // bcrypt hash length
    }
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: function() {
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${this.username}`;
    }
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'away', 'busy'),
    defaultValue: 'offline'
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      notifications: {
        desktop: true,
        sound: true,
        vibration: true,
        messagePreview: true,
        groupMessages: true,
        calls: true
      },
      appearance: {
        theme: 'system',
        language: 'zh-CN',
        fontSize: 'medium',
        compactMode: false
      },
      privacy: {
        onlineStatus: true,
        lastSeen: true,
        readReceipts: true,
        typing: true,
        profilePhoto: 'everyone'
      },
      chat: {
        autoDownload: 'wifi',
        saveToGallery: true,
        enterToSend: true,
        linkPreviews: true
      },
      data: {
        autoBackup: true,
        backupFrequency: 'daily',
        includeVideos: false,
        lowDataMode: false
      }
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    }
  ]
});

module.exports = User;