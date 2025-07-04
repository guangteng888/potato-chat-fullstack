// src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // 使用内存数据库进行测试
  logging: false // a lot of noise
});

module.exports = sequelize;
