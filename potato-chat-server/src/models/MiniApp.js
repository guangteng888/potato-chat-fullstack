// src/models/MiniApp.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MiniApp = sequelize.define('MiniApp', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0.0'
  },
  category: {
    type: DataTypes.ENUM('productivity', 'games', 'finance', 'social', 'utilities', 'entertainment'),
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '应用大小(KB)'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  screenshots: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  manifest: {
    type: DataTypes.JSON,
    allowNull: true
  },
  developerId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['developerId']
    },
    {
      fields: ['isPublished']
    }
  ]
});

module.exports = MiniApp;