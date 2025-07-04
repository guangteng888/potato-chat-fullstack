import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { apiService, type ChatRoom, type Message } from '../services/apiService';
import { socketService } from '../services/socketService';

interface OnlineUser {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
}

interface ChatState {
  // ======================== 基础状态 ========================
  rooms: ChatRoom[];
  messages: Record<string, Message[]>;
  onlineUsers: OnlineUser[];
  activeRoom: string | null;
  isConnected: boolean;
  isTyping: Record<string, string[]>; // roomId -> userIds[]
  isLoading: boolean;
  error: string | null;

  // ======================== 聊天室管理 ========================
  loadRooms: () => Promise<void>;
  createGroupChat: (name: string, memberIds: string[]) => Promise<boolean>;
  setActiveRoom: (roomId: string | null) => void;
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void;
  
  // ======================== 消息管理 ========================
  loadMessages: (roomId: string, page?: number) => Promise<void>;
  sendMessage: (roomId: string, content: string, type?: 'text' | 'image' | 'file', replyTo?: string) => boolean;
  editMessage: (messageId: string, content: string) => boolean;
  deleteMessage: (messageId: string, roomId: string) => void;
  
  // ======================== 用户状态管理 ========================
  setOnlineUsers: (users: OnlineUser[]) => void;
  updateUserStatus: (userId: string, status: OnlineUser['status']) => void;
  
  // ======================== 打字状态管理 ========================
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  setTyping: (roomId: string, userIds: string[]) => void;
  
  // ======================== 内部状态管理 ========================
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markAsRead: (roomId: string) => void;
  clearChat: (roomId: string) => void;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    // ======================== 初始状态 ========================
    rooms: [],
    messages: {},
    onlineUsers: [],
    activeRoom: null,
    isConnected: false,
    isTyping: {},
    isLoading: false,
    error: null,

    // ======================== 聊天室管理 ========================
    loadRooms: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await apiService.getChatRooms();
        
        if (response.success && response.data) {
          const rooms = response.data.rooms.map(room => ({
            ...room,
            lastActivity: room.lastMessage ? new Date(room.lastMessage.timestamp) : new Date(),
            createdAt: new Date(),
            unreadCount: room.unreadCount || 0
          }));
          
          set({
            rooms,
            isLoading: false,
            error: null
          });
        } else {
          set({
            isLoading: false,
            error: response.error || '加载聊天室失败'
          });
        }
      } catch (error) {
        console.error('Load rooms error:', error);
        set({
          isLoading: false,
          error: '网络错误，请稍后重试'
        });
      }
    },

    createGroupChat: async (name: string, memberIds: string[]) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await apiService.createGroupChat({ name, memberIds });
        
        if (response.success && response.data) {
          // 聊天室将通过WebSocket事件添加，这里只需要处理成功状态
          set({
            isLoading: false,
            error: null
          });
          
          return true;
        } else {
          set({
            isLoading: false,
            error: response.error || '创建群聊失败'
          });
          return false;
        }
      } catch (error) {
        console.error('Create group chat error:', error);
        set({
          isLoading: false,
          error: '网络错误，请稍后重试'
        });
        return false;
      }
    },

    setActiveRoom: (roomId) => {
      const currentRoom = get().activeRoom;
      
      // 如果切换房间，先离开当前房间
      if (currentRoom && currentRoom !== roomId) {
        socketService.leaveRoom(currentRoom);
      }
      
      set({ activeRoom: roomId });
      
      // 加入新房间
      if (roomId) {
        socketService.joinRoom(roomId);
        
        // 加载消息历史
        get().loadMessages(roomId);
        
        // 标记为已读
        get().markAsRead(roomId);
      }
    },

    updateRoom: (roomId, updates) => {
      set((state) => ({
        rooms: state.rooms.map(room =>
          room.id === roomId ? { ...room, ...updates } : room
        )
      }));
    },

    // ======================== 消息管理 ========================
    loadMessages: async (roomId: string, page: number = 1) => {
      // 如果不是当前活跃房间，不加载消息
      if (get().activeRoom !== roomId) {
        return;
      }

      try {
        const response = await apiService.getMessageHistory(roomId, page);
        
        if (response.success && response.data) {
          const messages = response.data.messages.map(message => ({
            ...message,
            timestamp: new Date(message.timestamp),
            status: 'sent' as const
          }));
          
          if (page === 1) {
            // 第一页，替换现有消息
            set((state) => ({
              messages: { ...state.messages, [roomId]: messages }
            }));
          } else {
            // 后续页面，追加到现有消息前面
            set((state) => ({
              messages: {
                ...state.messages,
                [roomId]: [...messages, ...(state.messages[roomId] || [])]
              }
            }));
          }
        }
      } catch (error) {
        console.error('Load messages error:', error);
        set({ error: '加载消息失败' });
      }
    },

    sendMessage: (roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text', replyTo?: string) => {
      const success = socketService.sendMessage(roomId, content, type, replyTo);
      
      if (success) {
        // 创建临时消息对象，显示发送状态
        const tempMessage: Message = {
          id: `temp_${Date.now()}`,
          content,
          type,
          senderId: 'current_user', // 临时使用，实际消息会通过WebSocket返回
          roomId,
          timestamp: new Date(),
          edited: false,
          replyTo
        };
        
        // 添加到消息列表（临时显示）
        get().addMessage(tempMessage);
      }
      
      return success;
    },

    editMessage: (messageId: string, content: string) => {
      const success = socketService.editMessage(messageId, content);
      
      if (success) {
        // 立即更新本地消息（乐观更新）
        get().updateMessage(messageId, {
          content,
          edited: true
        });
      }
      
      return success;
    },

    deleteMessage: (messageId: string, roomId: string) => {
      const success = socketService.deleteMessage(messageId);
      
      if (success) {
        // 立即从本地删除（乐观更新）
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: (state.messages[roomId] || []).filter(msg => msg.id !== messageId)
          }
        }));
      }
    },

    // ======================== 用户状态管理 ========================
    setOnlineUsers: (users) => {
      const onlineUsers = users.map(user => ({
        ...user,
        lastSeen: new Date(user.lastSeen)
      }));
      set({ onlineUsers });
    },

    updateUserStatus: (userId, status) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.map(user =>
          user.id === userId
            ? { ...user, status, lastSeen: status === 'offline' ? new Date() : user.lastSeen }
            : user
        )
      }));
    },

    // ======================== 打字状态管理 ========================
    startTyping: (roomId: string) => {
      socketService.startTyping(roomId);
    },

    stopTyping: (roomId: string) => {
      socketService.stopTyping(roomId);
    },

    setTyping: (roomId, userIds) => {
      set((state) => ({
        isTyping: { ...state.isTyping, [roomId]: userIds }
      }));
    },

    // ======================== 内部状态管理 ========================
    setRooms: (rooms) => set({ rooms }),

    addRoom: (room) => {
      set((state) => {
        // 检查房间是否已存在
        const existingIndex = state.rooms.findIndex(r => r.id === room.id);
        
        if (existingIndex >= 0) {
          // 更新现有房间
          const updatedRooms = [...state.rooms];
          updatedRooms[existingIndex] = room;
          return { rooms: updatedRooms };
        } else {
          // 添加新房间到顶部
          return { rooms: [room, ...state.rooms] };
        }
      });
    },

    setMessages: (roomId, messages) => {
      set((state) => ({
        messages: { ...state.messages, [roomId]: messages }
      }));
    },

    addMessage: (message) => {
      set((state) => {
        const roomMessages = state.messages[message.roomId] || [];
        
        // 检查是否为临时消息的真实版本
        const tempIndex = roomMessages.findIndex(
          msg => msg.id.startsWith('temp_') && 
                 msg.content === message.content && 
                 msg.roomId === message.roomId
        );
        
        let newMessages;
        if (tempIndex >= 0) {
          // 替换临时消息
          newMessages = [...roomMessages];
          newMessages[tempIndex] = message;
        } else {
          // 添加新消息
          newMessages = [...roomMessages, message];
        }
        
        // 更新房间的最后消息和活动时间
        const updatedRooms = state.rooms.map(room => {
          if (room.id === message.roomId) {
            return {
              ...room,
              lastMessage: {
                content: message.content,
                timestamp: message.timestamp.toISOString(),
                senderId: message.senderId
              },
              lastActivity: message.timestamp
            };
          }
          return room;
        });
        
        return {
          messages: { ...state.messages, [message.roomId]: newMessages },
          rooms: updatedRooms
        };
      });
    },

    updateMessage: (messageId, updates) => {
      set((state) => {
        const newMessages = { ...state.messages };
        
        // 查找并更新消息
        Object.keys(newMessages).forEach(roomId => {
          const messageIndex = newMessages[roomId].findIndex(msg => msg.id === messageId);
          if (messageIndex >= 0) {
            newMessages[roomId] = [...newMessages[roomId]];
            newMessages[roomId][messageIndex] = {
              ...newMessages[roomId][messageIndex],
              ...updates
            };
          }
        });
        
        return { messages: newMessages };
      });
    },

    setConnected: (isConnected) => set({ isConnected }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    markAsRead: (roomId) => {
      set((state) => ({
        rooms: state.rooms.map(room =>
          room.id === roomId ? { ...room, unreadCount: 0 } : room
        )
      }));
    },

    clearChat: (roomId) => {
      set((state) => ({
        messages: { ...state.messages, [roomId]: [] }
      }));
    },
  }))
);

// 导出类型定义
export type { OnlineUser, Message as ChatMessage, ChatRoom };
