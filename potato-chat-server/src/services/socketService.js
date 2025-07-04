// src/services/socketService.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const { User, ChatRoom, ChatRoomMember, Message } = require('../models');

const initializeSocket = (io) => {
  // Socket认证中间件
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`用户 ${socket.userId} 已连接:`, socket.id);

    // 用户加入个人房间
    socket.join(`user_${socket.userId}`);

    // 更新用户在线状态
    updateUserStatus(socket.userId, 'online');

    // 发送认证成功消息
    socket.emit('authenticated', { success: true });

    // 发送初始数据
    sendUserRooms(socket);
    sendOnlineUsers(socket);

    // 加入聊天室
    socket.on('join_room', async (roomId) => {
      try {
        // 验证用户是否有权限加入此房间
        const membership = await ChatRoomMember.findOne({
          where: { userId: socket.userId, chatRoomId: roomId, isActive: true }
        });

        if (membership) {
          socket.join(roomId);
          console.log(`用户 ${socket.userId} 加入房间 ${roomId}`);
          
          // 发送房间的历史消息
          const messages = await Message.findAll({
            where: { chatRoomId: roomId },
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'avatar']
              }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
          });

          socket.emit('messages_history', { 
            roomId, 
            messages: messages.reverse() 
          });
        } else {
          socket.emit('error', { message: '无权限加入此房间' });
        }
      } catch (error) {
        console.error('加入房间错误:', error);
        socket.emit('error', { message: '加入房间失败' });
      }
    });

    // 发送消息
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type = 'text', replyToId } = data;

        // 验证用户是否是房间成员
        const membership = await ChatRoomMember.findOne({
          where: { userId: socket.userId, chatRoomId: roomId, isActive: true }
        });

        if (!membership) {
          socket.emit('error', { message: '您不是此房间的成员' });
          return;
        }

        // 创建消息
        const message = await Message.create({
          chatRoomId: roomId,
          senderId: socket.userId,
          content,
          type,
          replyToId,
          status: 'sent'
        });

        // 获取完整的消息信息
        const fullMessage = await Message.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'avatar']
            },
            {
              model: Message,
              as: 'replyTo',
              attributes: ['id', 'content', 'type'],
              include: [
                {
                  model: User,
                  as: 'sender',
                  attributes: ['id', 'username']
                }
              ]
            }
          ]
        });

        // 更新房间的最后活动时间
        await ChatRoom.update(
          { lastActivity: new Date() },
          { where: { id: roomId } }
        );

        // 发送消息到房间内所有用户
        io.to(roomId).emit('new_message', fullMessage);

        console.log(`消息发送: ${socket.userId} -> ${roomId}`);
      } catch (error) {
        console.error('发送消息错误:', error);
        socket.emit('error', { message: '发送消息失败' });
      }
    });

    // 创建私聊
    socket.on('create_private_chat', async (targetUserId) => {
      try {
        // 检查目标用户是否存在
        const targetUser = await User.findByPk(targetUserId);
        if (!targetUser) {
          socket.emit('error', { message: '目标用户不存在' });
          return;
        }

        // 检查是否已存在私聊
        const existingRoom = await ChatRoom.findOne({
          where: { type: 'private' },
          include: [
            {
              model: User,
              as: 'members',
              where: { id: [socket.userId, targetUserId] },
              through: { where: { isActive: true } },
              attributes: []
            }
          ],
          having: sequelize.literal('COUNT(*) = 2')
        });

        if (existingRoom) {
          socket.emit('room_created', existingRoom);
          return;
        }

        // 创建新的私聊房间
        const room = await ChatRoom.create({
          name: '私聊',
          type: 'private',
          createdBy: socket.userId
        });

        // 添加成员
        await Promise.all([
          ChatRoomMember.create({
            userId: socket.userId,
            chatRoomId: room.id,
            role: 'member'
          }),
          ChatRoomMember.create({
            userId: targetUserId,
            chatRoomId: room.id,
            role: 'member'
          })
        ]);

        // 获取完整的房间信息
        const fullRoom = await ChatRoom.findByPk(room.id, {
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'username', 'avatar', 'status'],
              through: { attributes: ['role'] }
            }
          ]
        });

        // 让双方用户加入房间
        socket.join(room.id);
        io.to(`user_${targetUserId}`).emit('new_room', fullRoom);
        socket.emit('room_created', fullRoom);

        console.log(`私聊房间创建: ${room.id} (${socket.userId} <-> ${targetUserId})`);
      } catch (error) {
        console.error('创建私聊错误:', error);
        socket.emit('error', { message: '创建私聊失败' });
      }
    });

    // 获取用户聊天室
    socket.on('get_rooms', () => {
      sendUserRooms(socket);
    });

    // 获取在线用户列表
    socket.on('get_online_users', () => {
      sendOnlineUsers(socket);
    });

    // 获取消息历史
    socket.on('get_messages', async (roomId) => {
      try {
        const membership = await ChatRoomMember.findOne({
          where: { userId: socket.userId, chatRoomId: roomId, isActive: true }
        });

        if (!membership) {
          socket.emit('error', { message: '无权限访问此房间' });
          return;
        }

        const messages = await Message.findAll({
          where: { chatRoomId: roomId },
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 50
        });

        socket.emit('messages_history', { 
          roomId, 
          messages: messages.reverse() 
        });
      } catch (error) {
        console.error('获取消息历史错误:', error);
        socket.emit('error', { message: '获取消息历史失败' });
      }
    });

    // 开始打字
    socket.on('typing_start', (data) => {
      socket.to(data.roomId).emit('typing_start', {
        roomId: data.roomId,
        userId: socket.userId
      });
    });

    // 停止打字
    socket.on('typing_stop', (data) => {
      socket.to(data.roomId).emit('typing_stop', {
        roomId: data.roomId,
        userId: socket.userId
      });
    });

    // 更新用户状态
    socket.on('update_status', async (data) => {
      try {
        await updateUserStatus(socket.userId, data.status);
        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status: data.status
        });
      } catch (error) {
        console.error('更新用户状态错误:', error);
      }
    });

    // 用户断开连接
    socket.on('disconnect', async () => {
      try {
        await updateUserStatus(socket.userId, 'offline');
        console.log(`用户 ${socket.userId} 断开连接`);
      } catch (error) {
        console.error('处理断开连接错误:', error);
      }
    });
  });

  // 辅助函数
  async function updateUserStatus(userId, status) {
    try {
      await User.update(
        { 
          status, 
          lastSeen: new Date() 
        },
        { where: { id: userId } }
      );
    } catch (error) {
      console.error('更新用户状态错误:', error);
    }
  }

  async function sendUserRooms(socket) {
    try {
      const rooms = await ChatRoom.findAll({
        include: [
          {
            model: ChatRoomMember,
            as: 'memberships',
            where: { userId: socket.userId, isActive: true },
            attributes: ['role', 'unreadCount']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'username', 'avatar', 'status'],
            through: { 
              where: { isActive: true },
              attributes: []
            }
          }
        ],
        order: [['lastActivity', 'DESC']]
      });

      socket.emit('rooms_list', { rooms });
    } catch (error) {
      console.error('发送用户房间列表错误:', error);
    }
  }

  async function sendOnlineUsers(socket) {
    try {
      const onlineUsers = await User.findAll({
        where: { status: 'online' },
        attributes: ['id', 'username', 'avatar', 'status', 'lastSeen']
      });

      socket.emit('online_users', { users: onlineUsers });
    } catch (error) {
      console.error('发送在线用户列表错误:', error);
    }
  }
};

module.exports = initializeSocket;