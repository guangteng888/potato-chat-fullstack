import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';

// 基础接口定义
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: string;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  avatar?: string;
  description?: string;
  members: string[];
  createdAt: string;
  lastActivity: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  encrypted?: boolean;
  replyTo?: string;
}

interface WalletBalance {
  currency: string;
  balance: number;
  usdValue: number;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'buy' | 'sell';
  cryptocurrency: string;
  amount: number;
  usdValue: number;
  from: string;
  to: string;
  hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  fee?: number;
  notes?: string;
}

interface MiniApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  developer: {
    id: string;
    name: string;
    verified: boolean;
  };
  category: 'productivity' | 'games' | 'finance' | 'social' | 'utilities' | 'entertainment';
  permissions: string[];
  size: number;
  rating: number;
  downloads: number;
  screenshots: string[];
  isInstalled?: boolean;
  isRunning?: boolean;
  lastUsed?: string;
  url?: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器 - 添加认证token
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 处理错误和token刷新
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 如果正在刷新token，将请求加入队列
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshResponse = await this.refreshToken();
            if (refreshResponse.success && refreshResponse.data?.token) {
              const newToken = refreshResponse.data.token;
              useAuthStore.getState().setToken(newToken);
              
              // 处理队列中的请求
              this.processQueue(null, newToken);
              
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async handleRequest<T>(requestPromise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response = await requestPromise;
      return response.data;
    } catch (error: any) {
      console.error('API请求错误:', error);
      
      // 网络错误处理
      if (!error.response) {
        return {
          success: false,
          error: '网络连接失败，请检查网络设置',
          code: 'NETWORK_ERROR'
        };
      }

      // 服务器错误处理
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          '请求失败';

      return {
        success: false,
        error: errorMessage,
        code: error.response?.data?.code || error.response?.status?.toString()
      };
    }
  }

  // ======================== 认证相关 API ========================

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.handleRequest(
      this.api.post('/auth/register', userData)
    );
  }

  async login(credentials: {
    identifier: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.handleRequest(
      this.api.post('/auth/login', credentials)
    );
  }

  async logout(): Promise<ApiResponse> {
    return this.handleRequest(
      this.api.post('/auth/logout')
    );
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.handleRequest(
      this.api.post('/auth/refresh')
    );
  }

  // ======================== 用户管理 API ========================

  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.handleRequest(
      this.api.get('/user/profile')
    );
  }

  async updateUserProfile(updates: {
    username?: string;
    email?: string;
    avatar?: string;
    status?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.handleRequest(
      this.api.put('/user/profile', updates)
    );
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.handleRequest(
      this.api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  async searchUsers(query: string): Promise<ApiResponse<{ users: User[] }>> {
    return this.handleRequest(
      this.api.get(`/user/search`, { params: { q: query } })
    );
  }

  async getUserSettings(): Promise<ApiResponse<{ settings: any }>> {
    return this.handleRequest(
      this.api.get('/user/settings')
    );
  }

  async updateUserSettings(settings: any): Promise<ApiResponse> {
    return this.handleRequest(
      this.api.put('/user/settings', settings)
    );
  }

  // ======================== 聊天相关 API ========================

  async getChatRooms(): Promise<ApiResponse<{ rooms: ChatRoom[] }>> {
    return this.handleRequest(
      this.api.get('/chat/rooms')
    );
  }

  async createGroupChat(data: {
    name: string;
    memberIds: string[];
    description?: string;
  }): Promise<ApiResponse<{ room: ChatRoom }>> {
    return this.handleRequest(
      this.api.post('/chat/group', data)
    );
  }

  async getMessageHistory(
    roomId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<ApiResponse<{ messages: Message[]; hasMore: boolean; total: number }>> {
    return this.handleRequest(
      this.api.get(`/chat/messages/${roomId}`, {
        params: { page, limit }
      })
    );
  }

  async deleteMessage(messageId: string): Promise<ApiResponse> {
    return this.handleRequest(
      this.api.delete(`/chat/message/${messageId}`)
    );
  }

  async editMessage(messageId: string, content: string): Promise<ApiResponse<{ message: Message }>> {
    return this.handleRequest(
      this.api.put(`/chat/message/${messageId}`, { content })
    );
  }

  // ======================== 文件上传 API ========================

  async uploadFile(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ fileUrl: string; fileId: string; fileName: string; fileSize: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.handleRequest(
      this.api.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      })
    );
  }

  async uploadImage(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ imageUrl: string; imageId: string; fileName: string; fileSize: number }>> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.handleRequest(
      this.api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      })
    );
  }

  // ======================== 钱包相关 API ========================

  async getWalletBalance(): Promise<ApiResponse<{ balances: WalletBalance[] }>> {
    return this.handleRequest(
      this.api.get('/wallet/balance')
    );
  }

  async sendCrypto(data: {
    to: string;
    amount: number;
    currency: string;
    password: string;
    notes?: string;
  }): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.handleRequest(
      this.api.post('/wallet/send', data)
    );
  }

  async getTransactionHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ transactions: Transaction[]; hasMore: boolean; total: number }>> {
    return this.handleRequest(
      this.api.get('/wallet/transactions', {
        params: { page, limit }
      })
    );
  }

  async getTransactionDetails(transactionId: string): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.handleRequest(
      this.api.get(`/wallet/transaction/${transactionId}`)
    );
  }

  // ======================== 小程序相关 API ========================

  async getMiniApps(): Promise<ApiResponse<{ apps: MiniApp[] }>> {
    return this.handleRequest(
      this.api.get('/miniapps')
    );
  }

  async getInstalledMiniApps(): Promise<ApiResponse<{ apps: MiniApp[] }>> {
    return this.handleRequest(
      this.api.get('/miniapps/installed')
    );
  }

  async installMiniApp(appId: string): Promise<ApiResponse> {
    return this.handleRequest(
      this.api.post(`/miniapps/${appId}/install`)
    );
  }

  async uninstallMiniApp(appId: string): Promise<ApiResponse> {
    return this.handleRequest(
      this.api.delete(`/miniapps/${appId}/install`)
    );
  }

  async getMiniAppDetails(appId: string): Promise<ApiResponse<{ app: MiniApp }>> {
    return this.handleRequest(
      this.api.get(`/miniapps/${appId}`)
    );
  }

  async searchMiniApps(
    query?: string,
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ apps: MiniApp[]; hasMore: boolean; total: number }>> {
    return this.handleRequest(
      this.api.get('/miniapps/search', {
        params: { q: query, category, page, limit }
      })
    );
  }

  // ======================== 系统相关 API ========================

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.handleRequest(
      this.api.get('/health')
    );
  }

  async getSystemStatus(): Promise<ApiResponse<{ 
    uptime: number; 
    memory: any; 
    database: string; 
    activeConnections: number; 
  }>> {
    return this.handleRequest(
      this.api.get('/health/status')
    );
  }

  // ======================== 工具方法 ========================

  /**
   * 检查 API 连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前用户的认证状态
   */
  isAuthenticated(): boolean {
    const token = useAuthStore.getState().token;
    return !!token;
  }

  /**
   * 清除所有认证信息
   */
  clearAuth(): void {
    useAuthStore.getState().logout();
  }

  /**
   * 获取完整的文件 URL
   */
  getFileUrl(relativePath: string): string {
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    return `${this.baseURL.replace('/api', '')}${relativePath}`;
  }
}

// 导出单例实例
export const apiService = new ApiService();
export default apiService;

// 导出类型定义
export type {
  ApiResponse,
  User,
  ChatRoom,
  Message,
  WalletBalance,
  Transaction,
  MiniApp
};
