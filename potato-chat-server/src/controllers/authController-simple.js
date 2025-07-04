// src/controllers/authController-simple.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 临时用户存储
const users = new Map();

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 简单验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码都是必填项'
      });
    }

    // 检查用户是否已存在
    for (const [id, user] of users) {
      if (user.email === email || user.username === username) {
        return res.status(400).json({
          success: false,
          message: '用户名或邮箱已存在'
        });
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = Math.random().toString(36).substr(2, 9);
    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      createdAt: new Date()
    };

    users.set(userId, user);

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, 'potato-chat-secret-key', { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

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
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码都是必填项'
      });
    }

    // 查找用户（通过用户名或邮箱）
    let user = null;
    for (const [id, u] of users) {
      if (u.email === identifier || u.username === identifier) {
        user = u;
        break;
      }
    }

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

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, 'potato-chat-secret-key', { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

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

module.exports = {
  register,
  login
};
