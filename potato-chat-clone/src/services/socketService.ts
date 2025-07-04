import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

// 根据后端实现定义的 Socket.IO 事件接口
interface ServerToClientEvents {
  // 连接和认证事件
  'authenticated': (data: { success: boolean; message?: string }) => void;
  
  // 聊天消息事件
  'new_message': (message: {
    id: string;
    content: string;
    type: 'text' | 'image' | 'file';
    senderId: string;
    chatRoomId: string;
    timestamp: string;
    replyToId?: string;
    sender: {
      id: string;
      username: string;
      avatar?: string;
    };
  }) => void;
  
  'message_edited': (data: {
    messageId: string;
    content: string;
    editedAt: string;
  }) => void;
  
  'message_deleted': (data: {
    messageId: string;
    roomId: string;
  }) => void;
  
  'messages_history': (data: {
    roomId: string;
    messages: any[];
  }) => void;
  
  // 聊天室事件
  'new_room': (room: {
    id: string;
    name: string;
    type: 'private' | 'group';
    avatar?: string;
    members: any[];
  }) => void;
  
  'room_created': (room: {
    id: string;
    name: string;
    type: 'private' | 'group';
    avatar?: string;
    members: any[];
  }) => void;
  
  'rooms_list': (data: { rooms: any[] }) => void;
  
  // 用户状态事件
  'user_status_update': (data: {
    userId: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen?: string;
  }) => void;
  
  'typing_start': (data: {
    userId: string;
    username: string;
    roomId: string;
  }) => void;
  
  'typing_stop': (data: {
    userId: string;
    roomId: string;
  }) => void;
  
  'online_users': (data: { users: any[] }) => void;
  
  // 系统事件
  'error': (data: { message: string; code?: string }) => void;
  'disconnect': (reason: string) => void;
}

interface ClientToServerEvents {
  // 认证事件（已通过中间件处理，这里可能不需要显式调用）
  
  // 聊天事件
  'send_message': (data: {
    roomId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    replyToId?: string;
  }) => void;
  
  'edit_message': (data: {
    messageId: string;
    content: string;
  }) => void;
  
  'delete_message': (data: {
    messageId: string;
  }) => void;
  
  'join_room': (roomId: string) => void;
  'leave_room': (roomId: string) => void;
  
  'create_private_chat': (targetUserId: string) => void;
  'create_group_chat': (data: {
    name: string;
    memberIds: string[];
  }) => void;
  
  'get_rooms': () => void;
  'get_messages': (roomId: string) => void;
  'get_online_users': () => void;
  
  // 用户状态事件
  'update_status': (data: { status: 'online' | 'offline' | 'away' | 'busy' }) => void;
  'typing_start': (data: { roomId: string }) => void;
  'typing_stop': (data: { roomId: string }) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      reconnection: false // 我们手动处理重连
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 清理所有打字计时器
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // ======================== 连接事件 ========================
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      useChatStore.getState().setConnected(true);
      this.reconnectAttempts = 0;
      
      // 请求初始数据
      this.requestInitialData();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      useChatStore.getState().setConnected(false);
      
      // 如果是服务器主动断开连接，尝试重连
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      useChatStore.getState().setConnected(false);
      this.handleReconnect();
    });

    // ======================== 认证事件 ========================
    this.socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket authentication successful');
        // 认证成功后请求初始数据
        this.requestInitialData();
      } else {
        console.error('Socket authentication failed:', data.message);
        // 认证失败，清除本地认证状态
        useAuthStore.getState().logout();
      }
    });

    // ======================== 聊天消息事件 ========================
    this.socket.on('new_message', (message) => {
      console.log('New message received:', message);
      useChatStore.getState().addMessage({
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        roomId: message.chatRoomId,
        timestamp: new Date(message.timestamp),
        replyTo: message.replyToId,
        status: 'sent'
      });
    });

    this.socket.on('message_edited', (data) => {
      console.log('Message edited:', data);
      useChatStore.getState().updateMessage(data.messageId, {
        content: data.content,
        edited: true
      });
    });

    this.socket.on('message_deleted', (data) => {
      console.log('Message deleted:', data);
      useChatStore.getState().deleteMessage(data.messageId, data.roomId);
    });

    this.socket.on('messages_history', (data) => {
      console.log('Messages history received:', data);
      const messages = data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp || msg.createdAt),
        roomId: msg.chatRoomId
      }));
      useChatStore.getState().setMessages(data.roomId, messages);
    });

    // ======================== 聊天室事件 ========================
    this.socket.on('new_room', (room) => {
      console.log('New room received:', room);
      useChatStore.getState().addRoom({
        id: room.id,
        name: room.name,
        type: room.type,
        avatar: room.avatar,
        members: room.members,
        unreadCount: 0,
        createdAt: new Date(),
        lastActivity: new Date()
      });
    });

    this.socket.on('room_created', (room) => {
      console.log('Room created:', room);
      useChatStore.getState().addRoom({
        id: room.id,
        name: room.name,
        type: room.type,
        avatar: room.avatar,
        members: room.members,
        unreadCount: 0,
        createdAt: new Date(),
        lastActivity: new Date()
      });
      
      // 自动加入新创建的房间
      this.joinRoom(room.id);
    });

    this.socket.on('rooms_list', (data) => {
      console.log('Rooms list received:', data.rooms);
      const rooms = data.rooms.map((room: any) => ({
        ...room,
        createdAt: new Date(room.createdAt),
        lastActivity: new Date(room.lastActivity || room.createdAt),
        unreadCount: 0
      }));
      useChatStore.getState().setRooms(rooms);
    });

    // ======================== 用户状态事件 ========================
    this.socket.on('user_status_update', (data) => {
      console.log('User status update:', data);
      useChatStore.getState().updateUserStatus(data.userId, data.status);
    });

    this.socket.on('typing_start', (data) => {
      console.log('User started typing:', data);
      const currentTyping = useChatStore.getState().isTyping[data.roomId] || [];
      if (!currentTyping.includes(data.userId)) {
        useChatStore.getState().setTyping(data.roomId, [...currentTyping, data.userId]);
      }
    });

    this.socket.on('typing_stop', (data) => {
      console.log('User stopped typing:', data);
      const currentTyping = useChatStore.getState().isTyping[data.roomId] || [];
      useChatStore.getState().setTyping(
        data.roomId,
        currentTyping.filter(id => id !== data.userId)
      );
    });

    this.socket.on('online_users', (data) => {
      console.log('Online users received:', data.users);
      const onlineUsers = data.users.map((user: any) => ({
        ...user,
        lastSeen: new Date(user.lastSeen)
      }));
      useChatStore.getState().setOnlineUsers(onlineUsers);
    });

    // ======================== 系统事件 ========================
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      // 可以显示错误Toast
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      const token = useAuthStore.getState().token;
      if (token) {
        this.connect(token);
      }
    }, delay);
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // 页面隐藏时，设置状态为away
      this.updateUserStatus('away');
    } else {
      // 页面可见时，设置状态为online
      this.updateUserStatus('online');
    }
  }

  private requestInitialData() {
    if (!this.socket?.connected) return;
    
    // 请求用户的聊天室列表和在线用户
    this.socket.emit('get_rooms');
    this.socket.emit('get_online_users');
  }

  // ======================== 公共方法 ========================

  // 发送消息
  sendMessage(roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text', replyToId?: string): boolean {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('send_message', {
      roomId,
      content,
      type,
      replyToId
    });

    return true;
  }

  // 编辑消息
  editMessage(messageId: string, content: string): boolean {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('edit_message', {
      messageId,
      content
    });

    return true;
  }

  // 删除消息
  deleteMessage(messageId: string): boolean {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('delete_message', {
      messageId
    });

    return true;
  }

  // 加入聊天室
  joinRoom(roomId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join_room', roomId);
  }

  // 离开聊天室
  leaveRoom(roomId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('leave_room', roomId);
  }

  // 创建私聊
  createPrivateChat(targetUserId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('create_private_chat', targetUserId);
  }

  // 创建群聊
  createGroupChat(name: string, memberIds: string[]) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('create_group_chat', {
      name,
      memberIds
    });
  }

  // 获取消息历史
  getMessages(roomId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_messages', roomId);
  }

  // 获取聊天室列表
  getRooms() {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_rooms');
  }

  // 获取在线用户
  getOnlineUsers() {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_online_users');
  }

  // 更新用户状态
  updateUserStatus(status: 'online' | 'offline' | 'away' | 'busy') {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('update_status', { status });
  }

  // 开始打字
  startTyping(roomId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('typing_start', { roomId });

    // 设置自动停止打字的计时器
    const existingTimer = this.typingTimers.get(roomId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.stopTyping(roomId);
    }, 3000); // 3秒后自动停止打字状态

    this.typingTimers.set(roomId, timer);
  }

  // 停止打字
  stopTyping(roomId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('typing_stop', { roomId });

    // 清除计时器
    const timer = this.typingTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(roomId);
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 获取socket实例（用于高级用法）
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  // 清理资源
  destroy() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.disconnect();
  }
}

// 导出单例实例
export const socketService = new SocketService();
export default socketService;

// 导出类型定义
export type { ServerToClientEvents, ClientToServerEvents };
