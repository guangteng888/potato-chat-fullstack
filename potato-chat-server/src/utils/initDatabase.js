// src/utils/initDatabase.js
const { sequelize, User, MiniApp } = require('../models');
const bcrypt = require('bcryptjs');
const { BCRYPT_SALT_ROUNDS } = require('../config/config');

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    // 同步所有模型到数据库
    await sequelize.sync({ force: false }); // force: false 表示不删除现有数据
    console.log('数据库同步完成');

    // 检查是否需要创建演示数据
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('创建演示用户...');
      await createDemoUsers();
    }

    const appCount = await MiniApp.count();
    if (appCount === 0) {
      console.log('创建演示小程序...');
      await createDemoMiniApps();
    }

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

const createDemoUsers = async () => {
  const demoUsers = [
    {
      id: 'demo1',
      username: 'demo1',
      email: 'demo1@example.com',
      password: await bcrypt.hash('123456', BCRYPT_SALT_ROUNDS),
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=demo1',
      status: 'online'
    },
    {
      id: 'demo2',
      username: 'demo2',
      email: 'demo2@example.com',
      password: await bcrypt.hash('123456', BCRYPT_SALT_ROUNDS),
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=demo2',
      status: 'online'
    },
    {
      id: 'alice',
      username: 'alice',
      email: 'alice@example.com',
      password: await bcrypt.hash('123456', BCRYPT_SALT_ROUNDS),
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alice',
      status: 'online'
    }
  ];

  await User.bulkCreate(demoUsers);
  console.log('演示用户创建完成');
};

const createDemoMiniApps = async () => {
  // 获取第一个用户作为开发者
  const developer = await User.findOne();
  if (!developer) {
    console.log('没有用户，跳过创建演示小程序');
    return;
  }

  const demoApps = [
    {
      id: 'calculator',
      name: '计算器',
      description: '简单易用的计算器应用',
      icon: '🧮',
      version: '1.0.0',
      category: 'utilities',
      permissions: [],
      size: 50,
      rating: 4.8,
      downloads: 10000,
      screenshots: [],
      isPublished: true,
      isVerified: true,
      developerId: developer.id
    },
    {
      id: 'weather',
      name: '天气预报',
      description: '实时天气信息和预报',
      icon: '🌤️',
      version: '2.1.0',
      category: 'utilities',
      permissions: ['location'],
      size: 120,
      rating: 4.6,
      downloads: 25000,
      screenshots: [],
      isPublished: true,
      isVerified: true,
      developerId: developer.id
    },
    {
      id: 'crypto-tracker',
      name: '加密货币追踪',
      description: '实时监控加密货币价格和趋势',
      icon: '📈',
      version: '1.5.2',
      category: 'finance',
      permissions: ['wallet'],
      size: 200,
      rating: 4.9,
      downloads: 50000,
      screenshots: [],
      isPublished: true,
      isVerified: true,
      developerId: developer.id
    },
    {
      id: 'notes',
      name: '笔记本',
      description: '快速记录和整理笔记',
      icon: '📝',
      version: '3.0.1',
      category: 'productivity',
      permissions: ['storage'],
      size: 80,
      rating: 4.7,
      downloads: 15000,
      screenshots: [],
      isPublished: true,
      isVerified: true,
      developerId: developer.id
    },
    {
      id: 'games-center',
      name: '游戏中心',
      description: '多种小游戏合集',
      icon: '🎮',
      version: '2.3.0',
      category: 'games',
      permissions: ['user-profile'],
      size: 500,
      rating: 4.3,
      downloads: 35000,
      screenshots: [],
      isPublished: true,
      isVerified: false,
      developerId: developer.id
    }
  ];

  await MiniApp.bulkCreate(demoApps);
  console.log('演示小程序创建完成');
};

module.exports = initDatabase;