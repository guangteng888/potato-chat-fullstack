// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Wallet } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS, DEFAULT_CRYPTOCURRENCIES } = require('../config/config');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`
    });

    // 为新用户创建默认钱包
    const walletPromises = DEFAULT_CRYPTOCURRENCIES.map(crypto => 
      Wallet.create({
        userId: user.id,
        cryptocurrency: crypto.symbol,
        balance: crypto.initialBalance,
        address: `${crypto.symbol.toLowerCase()}_${user.id}_${Math.random().toString(36).substr(2, 8)}`
      })
    );
    await Promise.all(walletPromises);

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user.toJSON();

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: userInfo,
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginField = identifier || email;

    if (!loginField) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名或邮箱'
      });
    }

    // 查找用户（通过用户名或邮箱）
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginField },
          { username: loginField }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 更新用户状态
    await user.update({
      status: 'online',
      lastSeen: new Date()
    });

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user.toJSON();

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userInfo,
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取当前用户信息
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const { username, email, bio, location, website } = req.body;
    const userId = req.userId;

    // 检查用户名和邮箱是否被其他用户使用
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: userId },
          [Op.or]: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名或邮箱已被使用'
        });
      }
    }

    // 更新用户信息
    const [updatedCount] = await User.update(
      { username, email, bio, location, website },
      { 
        where: { id: userId },
        returning: true
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取更新后的用户信息
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: '资料更新成功',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 搜索用户
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.userId;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词至少需要2个字符'
      });
    }

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId }, // 排除当前用户
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'username', 'email', 'avatar', 'status', 'lastSeen'],
      limit: 20
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新用户设置
const updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const settings = req.body;

    const [updatedCount] = await User.update(
      { settings },
      { where: { id: userId } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '设置更新成功'
    });
  } catch (error) {
    console.error('更新设置错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户设置
const getSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['settings']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { settings: user.settings }
    });
  } catch (error) {
    console.error('获取设置错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  searchUsers,
  updateSettings,
  getSettings
};