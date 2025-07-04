import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type User } from '../services/apiService';
import { socketService } from '../services/socketService';

interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 用户操作
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // 用户资料管理
  updateProfile: (updates: { username?: string; email?: string; avatar?: string }) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  
  // 内部状态管理
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ======================== 初始状态 ========================
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ======================== 用户操作 ========================
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login({ identifier, password });
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // 更新状态
            set({
              user: {
                ...user,
                lastSeen: new Date(user.lastSeen),
                createdAt: new Date(user.createdAt)
              },
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // 连接WebSocket
            socketService.connect(token);
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '登录失败'
            });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({
            isLoading: false,
            error: '网络错误，请稍后重试'
          });
          return false;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register({ username, email, password });
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // 更新状态
            set({
              user: {
                ...user,
                lastSeen: new Date(user.lastSeen),
                createdAt: new Date(user.createdAt)
              },
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // 连接WebSocket
            socketService.connect(token);
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '注册失败'
            });
            return false;
          }
        } catch (error) {
          console.error('Register error:', error);
          set({
            isLoading: false,
            error: '网络错误，请稍后重试'
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // 尝试通知服务器登出
          await apiService.logout();
        } catch (error) {
          console.error('Logout API error:', error);
          // 即使API调用失败，也要清除本地状态
        }

        // 断开WebSocket连接
        socketService.disconnect();
        
        // 清除状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      refreshToken: async () => {
        const currentToken = get().token;
        if (!currentToken) {
          return false;
        }

        try {
          const response = await apiService.refreshToken();
          
          if (response.success && response.data) {
            set({ token: response.data.token });
            return true;
          } else {
            // 刷新失败，清除认证状态
            get().logout();
            return false;
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          // 刷新失败，清除认证状态
          get().logout();
          return false;
        }
      },

      // ======================== 用户资料管理 ========================
      updateProfile: async (updates: { username?: string; email?: string; avatar?: string }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.updateUserProfile(updates);
          
          if (response.success && response.data) {
            const updatedUser = {
              ...response.data.user,
              lastSeen: new Date(response.data.user.lastSeen),
              createdAt: new Date(response.data.user.createdAt)
            };
            
            set({
              user: updatedUser,
              isLoading: false,
              error: null
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '更新失败'
            });
            return false;
          }
        } catch (error) {
          console.error('Update profile error:', error);
          set({
            isLoading: false,
            error: '网络错误，请稍后重试'
          });
          return false;
        }
      },

      uploadAvatar: async (file: File) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.uploadAvatar(file);
          
          if (response.success && response.data) {
            // 更新用户头像
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  avatar: response.data.avatarUrl
                },
                isLoading: false,
                error: null
              });
            }
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '头像上传失败'
            });
            return false;
          }
        } catch (error) {
          console.error('Upload avatar error:', error);
          set({
            isLoading: false,
            error: '网络错误，请稍后重试'
          });
          return false;
        }
      },

      // ======================== 内部状态管理 ========================
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'potato-chat-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 2, // 版本号，如果数据结构变化可以用于迁移
    }
  )
);

// 导出类型定义
export type { User };
