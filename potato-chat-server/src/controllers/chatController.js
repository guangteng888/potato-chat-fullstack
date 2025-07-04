// src/controllers/chatController.js
const { ChatRoom, ChatRoomMember, Message, User } = require('../models');
const { Op } = require('sequelize');

// 获取用户的聊天室列表
const getChatRooms = async (req, res) => {
  try {
    const userId = req.userId;

    const rooms = await ChatRoom.findAll({
      include: [
        {
          model: ChatRoomMember,
          as: 'memberships',
          where: { userId, isActive: true },
          attributes: ['role', 'unreadCount', 'lastReadMessageId']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'avatar', 'status'],
          through: { 
            where: { isActive: true },
            attributes: []
          }
        },
        {
          model: Message,
          as: 'messages',
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1,
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ],
      order: [['lastActivity', 'DESC']]
    });

    // 格式化返回数据
    const formattedRooms = rooms.map(room => {
      const roomData = room.toJSON();
      const membership = roomData.memberships[0];
      const lastMessage = roomData.messages[0] || null;
      
      return {
        id: roomData.id,
        name: roomData.name,
        type: roomData.type,
        avatar: roomData.avatar,
        description: roomData.description,
        members: roomData.members,
        lastMessage,
        unreadCount: membership?.unreadCount || 0,
        createdAt: roomData.createdAt,
        lastActivity: roomData.lastActivity,
        settings: roomData.settings
      };
    });

    res.json({
      success: true,
      data: { rooms: formattedRooms }
    });
  } catch (error) {
    console.error('获取聊天室错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 创建群聊
const createGroupChat = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const userId = req.userId;

    // 验证所有成员是否存在
    const users = await User.findAll({
      where: { id: { [Op.in]: [...memberIds, userId] } },
      attributes: ['id', 'username', 'avatar']
    });

    if (users.length !== memberIds.length + 1) {
      return res.status(400).json({
        success: false,
        message: '部分用户不存在'
      });
    }

    // 创建聊天室
    const chatRoom = await ChatRoom.create({
      name,
      type: 'group',
      createdBy: userId
    });

    // 添加成员
    const membershipPromises = [userId, ...memberIds].map((memberId, index) => 
      ChatRoomMember.create({
        userId: memberId,
        chatRoomId: chatRoom.id,
        role: memberId === userId ? 'owner' : 'member'
      })
    );

    await Promise.all(membershipPromises);

    // 创建系统消息
    await Message.create({
      chatRoomId: chatRoom.id,
      senderId: userId,
      content: `${req.user.username} 创建了群聊`,
      type: 'system'
    });

    // 返回完整的聊天室信息
    const fullChatRoom = await ChatRoom.findByPk(chatRoom.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'avatar', 'status'],
          through: { attributes: ['role'] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '群聊创建成功',
      data: { room: fullChatRoom }
    });
  } catch (error) {
    console.error('创建群聊错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取聊天记录
const getMessageHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    // 验证用户是否是聊天室成员
    const membership = await ChatRoomMember.findOne({
      where: { userId, chatRoomId: roomId, isActive: true }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: '您不是此聊天室的成员'
      });
    }

    const offset = (page - 1) * limit;
    
    const messages = await Message.findAndCountAll({
      where: { 
        chatRoomId: roomId,
        deletedAt: null
      },
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
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        messages: messages.rows.reverse(), // 反转以获得正确的时间顺序
        pagination: {
          total: messages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(messages.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取聊天记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 创建私聊
const createPrivateChat = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.userId;

    if (targetUserId === userId) {
      return res.status(400).json({
        success: false,
        message: '不能与自己创建私聊'
      });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '目标用户不存在'
      });
    }

    // 检查是否已存在私聊
    const existingRoom = await ChatRoom.findOne({
      where: { type: 'private' },
      include: [
        {
          model: User,
          as: 'members',
          where: { id: { [Op.in]: [userId, targetUserId] } },
          through: { where: { isActive: true } },
          attributes: []
        }
      ],
      having: sequelize.literal('COUNT(*) = 2')
    });

    if (existingRoom) {
      return res.json({
        success: true,
        message: '私聊已存在',
        data: { room: existingRoom }
      });
    }

    // 创建新的私聊房间
    const chatRoom = await ChatRoom.create({
      name: '私聊',
      type: 'private',
      createdBy: userId
    });

    // 添加两个成员
    await Promise.all([
      ChatRoomMember.create({
        userId,
        chatRoomId: chatRoom.id,
        role: 'member'
      }),
      ChatRoomMember.create({
        userId: targetUserId,
        chatRoomId: chatRoom.id,
        role: 'member'
      })
    ]);

    // 返回完整的聊天室信息
    const fullChatRoom = await ChatRoom.findByPk(chatRoom.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'avatar', 'status'],
          through: { attributes: ['role'] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '私聊创建成功',
      data: { room: fullChatRoom }
    });
  } catch (error) {
    console.error('创建私聊错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getChatRooms,
  createGroupChat,
  getMessageHistory,
  createPrivateChat
};