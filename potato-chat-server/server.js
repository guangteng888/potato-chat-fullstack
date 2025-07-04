const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://emb6d8pgbi.space.minimax.io", "https://maqhs35als.space.minimax.io", "https://um3sicg4zv.space.minimax.io", "https://6pnppxaui5.space.minimax.io"],
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://emb6d8pgbi.space.minimax.io", "https://maqhs35als.space.minimax.io", "https://um3sicg4zv.space.minimax.io", "https://6pnppxaui5.space.minimax.io"],
  credentials: true
}));
app.use(express.json());

// 数据存储 (开发阶段使用内存存储)
const users = new Map();
const messages = new Map();
const chatRooms = new Map();

// 初始化演示数据
const initDemoData = async () => {
  // 创建演示用户
  const demoUsers = [
    {
      id: 'demo1',
      username: 'demo1',
      email: 'demo1@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=demo1',
      status: 'online',
      lastSeen: new Date(),
      createdAt: new Date()
    },
    {
      id: 'demo2', 
      username: 'demo2',
      email: 'demo2@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=demo2',
      status: 'online',
      lastSeen: new Date(),
      createdAt: new Date()
    },
    {
      id: 'alice',
      username: 'alice',
      email: 'alice@example.com', 
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alice',
      status: 'online',
      lastSeen: new Date(),
      createdAt: new Date()
    }
  ];

  demoUsers.forEach(user => {
    users.set(user.id, user);
  });

  // 创建演示聊天室
  const demoChatRoom = {
    id: 'demo-chat-1',
    name: '演示群聊',
    type: 'group',
    members: ['demo1', 'demo2', 'alice'],
    createdAt: new Date(),
    lastActivity: new Date()
  };

  chatRooms.set(demoChatRoom.id, demoChatRoom);

  // 创建演示消息
  const demoMessages = [
    {
      id: 'msg1',
      roomId: 'demo-chat-1',
      senderId: 'demo1',
      content: '欢迎来到 Potato Chat！',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
      status: 'sent'
    },
    {
      id: 'msg2',
      roomId: 'demo-chat-1', 
      senderId: 'demo2',
      content: '这个界面看起来很棒！',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3分钟前
      status: 'sent'
    },
    {
      id: 'msg3',
      roomId: 'demo-chat-1',
      senderId: 'alice',
      content: '数字钱包功能很实用 💰',
      type: 'text', 
      timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1分钟前
      status: 'sent'
    }
  ];

  messages.set('demo-chat-1', demoMessages);

  console.log('演示数据初始化完成');
};

// 初始化演示数据
initDemoData();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'potato-chat-secret-key';

// 工具函数
const generateId = () => Math.random().toString(36).substr(2, 9);

// 验证JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = Array.from(users.values()).find(
      user => user.email === email || user.username === username
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名或邮箱已存在' 
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const userId = generateId();
    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      status: 'online',
      lastSeen: new Date(),
      createdAt: new Date()
    };
    
    users.set(userId, user);
    
    // 生成JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
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
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // 查找用户（通过用户名或邮箱）
    const user = Array.from(users.values()).find(
      user => user.email === identifier || user.username === identifier
    );
    
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
    user.status = 'online';
    user.lastSeen = new Date();
    
    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
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
});

// 获取用户信息
app.get('/api/user/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '缺少认证token' 
      });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: '无效的token' 
      });
    }
    
    const user = users.get(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    const { password: _, ...userInfo } = user;
    
    res.json({
      success: true,
      data: { user: userInfo }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 获取聊天室列表
app.get('/api/chat/rooms', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: '无效的token' 
      });
    }
    
    // 获取用户参与的聊天室
    const userRooms = Array.from(chatRooms.values()).filter(room => 
      room.members.includes(decoded.userId)
    );
    
    res.json({
      success: true,
      data: { rooms: userRooms }
    });
  } catch (error) {
    console.error('获取聊天室错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  // 用户认证
  socket.on('authenticate', (token) => {
    const decoded = verifyToken(token);
    
    if (decoded) {
      socket.userId = decoded.userId;
      socket.join(`user_${decoded.userId}`);
      
      // 更新用户在线状态
      const user = users.get(decoded.userId);
      if (user) {
        user.status = 'online';
        user.lastSeen = new Date();
      }
      
      socket.emit('authenticated', { success: true });
      console.log(`用户 ${decoded.userId} 已认证`);
    } else {
      socket.emit('authenticated', { success: false, message: '认证失败' });
    }
  });
  
  // 加入聊天室
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`用户 ${socket.userId} 加入房间 ${roomId}`);
  });
  
  // 发送消息
  socket.on('send_message', (data) => {
    const { roomId, content, type = 'text' } = data;
    
    if (!socket.userId) {
      socket.emit('error', { message: '未认证的用户' });
      return;
    }
    
    const messageId = generateId();
    const message = {
      id: messageId,
      roomId,
      senderId: socket.userId,
      content,
      type,
      timestamp: new Date(),
      status: 'sent'
    };
    
    // 存储消息
    if (!messages.has(roomId)) {
      messages.set(roomId, []);
    }
    messages.get(roomId).push(message);
    
    // 发送消息到房间内所有用户
    io.to(roomId).emit('new_message', message);
    
    console.log(`消息发送: ${socket.userId} -> ${roomId}`);
  });
  
  // 创建私聊
  socket.on('create_private_chat', (targetUserId) => {
    if (!socket.userId) {
      socket.emit('error', { message: '未认证的用户' });
      return;
    }
    
    // 检查是否已存在私聊
    const existingRoom = Array.from(chatRooms.values()).find(room => 
      room.type === 'private' && 
      room.members.includes(socket.userId) && 
      room.members.includes(targetUserId)
    );
    
    if (existingRoom) {
      socket.emit('room_created', existingRoom);
      return;
    }
    
    // 创建新的私聊房间
    const roomId = generateId();
    const room = {
      id: roomId,
      name: '私聊',
      type: 'private',
      members: [socket.userId, targetUserId],
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    chatRooms.set(roomId, room);
    
    // 让双方用户加入房间
    socket.join(roomId);
    io.to(`user_${targetUserId}`).emit('new_room', room);
    
    socket.emit('room_created', room);
    
    console.log(`私聊房间创建: ${roomId} (${socket.userId} <-> ${targetUserId})`);
  });
  
  // 获取用户聊天室
  socket.on('get_rooms', () => {
    if (!socket.userId) {
      socket.emit('error', { message: '未认证的用户' });
      return;
    }
    
    // 获取用户参与的聊天室
    const userRooms = Array.from(chatRooms.values()).filter(room => 
      room.members.includes(socket.userId)
    );
    
    socket.emit('rooms_list', { rooms: userRooms });
    console.log(`发送聊天室列表给用户 ${socket.userId}:`, userRooms.length, '个房间');
  });
  
  // 获取在线用户列表
  socket.on('get_online_users', () => {
    if (!socket.userId) {
      socket.emit('error', { message: '未认证的用户' });
      return;
    }
    
    // 获取所有在线用户
    const onlineUsers = Array.from(users.values())
      .filter(user => user.status === 'online')
      .map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        status: user.status,
        lastSeen: user.lastSeen
      }));
    
    socket.emit('online_users', { users: onlineUsers });
    console.log(`发送在线用户列表给用户 ${socket.userId}:`, onlineUsers.length, '个用户');
  });

  // 获取消息历史
  socket.on('get_messages', (roomId) => {
    if (!socket.userId) {
      socket.emit('error', { message: '未认证的用户' });
      return;
    }
    
    const roomMessages = messages.get(roomId) || [];
    socket.emit('messages_history', { roomId, messages: roomMessages });
  });
  
  // 用户断开连接
  socket.on('disconnect', () => {
    if (socket.userId) {
      const user = users.get(socket.userId);
      if (user) {
        user.status = 'offline';
        user.lastSeen = new Date();
      }
      console.log(`用户 ${socket.userId} 断开连接`);
    } else {
      console.log('未认证用户断开连接:', socket.id);
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Potato Chat 服务器运行在端口 ${PORT}`);
  console.log(`WebSocket 服务器已启动`);
});

module.exports = { app, server, io };