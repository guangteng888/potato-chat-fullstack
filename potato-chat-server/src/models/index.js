// src/models/index.js
const sequelize = require('../config/database');

// 导入所有模型
const User = require('./User');
const ChatRoom = require('./ChatRoom');
const ChatRoomMember = require('./ChatRoomMember');
const Message = require('./Message');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const MiniApp = require('./MiniApp');
const UserMiniApp = require('./UserMiniApp');

// 定义关联关系

// User与ChatRoom的关联 (通过ChatRoomMember)
User.belongsToMany(ChatRoom, { 
  through: ChatRoomMember, 
  foreignKey: 'userId',
  as: 'chatRooms'
});
ChatRoom.belongsToMany(User, { 
  through: ChatRoomMember, 
  foreignKey: 'chatRoomId',
  as: 'members'
});

// User与ChatRoomMember的直接关联
User.hasMany(ChatRoomMember, { foreignKey: 'userId', as: 'memberships' });
ChatRoomMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ChatRoom与ChatRoomMember的直接关联
ChatRoom.hasMany(ChatRoomMember, { foreignKey: 'chatRoomId', as: 'memberships' });
ChatRoomMember.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });

// ChatRoom的创建者关联
ChatRoom.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(ChatRoom, { foreignKey: 'createdBy', as: 'createdChatRooms' });

// Message关联
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });

Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });
ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId', as: 'messages' });

// Message回复关联
Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });
Message.hasMany(Message, { foreignKey: 'replyToId', as: 'replies' });

// Wallet关联
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallets' });

// Transaction关联
Transaction.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
Transaction.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });
User.hasMany(Transaction, { foreignKey: 'fromUserId', as: 'sentTransactions' });
User.hasMany(Transaction, { foreignKey: 'toUserId', as: 'receivedTransactions' });

// MiniApp关联
MiniApp.belongsTo(User, { foreignKey: 'developerId', as: 'developer' });
User.hasMany(MiniApp, { foreignKey: 'developerId', as: 'developedApps' });

// User与MiniApp的关联 (通过UserMiniApp)
User.belongsToMany(MiniApp, { 
  through: UserMiniApp, 
  foreignKey: 'userId',
  as: 'installedApps'
});
MiniApp.belongsToMany(User, { 
  through: UserMiniApp, 
  foreignKey: 'miniAppId',
  as: 'installedByUsers'
});

// User与UserMiniApp的直接关联
User.hasMany(UserMiniApp, { foreignKey: 'userId', as: 'appInstallations' });
UserMiniApp.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// MiniApp与UserMiniApp的直接关联
MiniApp.hasMany(UserMiniApp, { foreignKey: 'miniAppId', as: 'installations' });
UserMiniApp.belongsTo(MiniApp, { foreignKey: 'miniAppId', as: 'miniApp' });

// 导出所有模型和sequelize实例
module.exports = {
  sequelize,
  User,
  ChatRoom,
  ChatRoomMember,
  Message,
  Wallet,
  Transaction,
  MiniApp,
  UserMiniApp
};