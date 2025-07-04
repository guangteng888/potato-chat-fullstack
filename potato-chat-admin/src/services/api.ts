import axios from 'axios'

// API 基础配置
const API_BASE_URL = 'http://localhost:3001/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关 API
export const authAPI = {
  login: async (credentials: { identifier: string; password: string }) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },
}

// 用户管理 API
export const userAPI = {
  getUsers: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },
  updateUserStatus: async (id: string, status: string) => {
    const response = await api.patch(`/admin/users/${id}/status`, { status })
    return response.data
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats')
    return response.data
  },
  exportUsers: async (filters?: any) => {
    const response = await api.get('/admin/users/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },
}

// 聊天管理 API
export const chatAPI = {
  getRooms: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get('/admin/chat/rooms', { params })
    return response.data
  },
  getRoomById: async (id: string) => {
    const response = await api.get(`/admin/chat/rooms/${id}`)
    return response.data
  },
  getMessages: async (roomId: string, params?: {
    page?: number
    limit?: number
  }) => {
    const response = await api.get(`/admin/chat/rooms/${roomId}/messages`, { params })
    return response.data
  },
  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/admin/chat/messages/${messageId}`)
    return response.data
  },
  getChatStats: async () => {
    const response = await api.get('/admin/chat/stats')
    return response.data
  },
  moderateContent: async (messageId: string, action: string) => {
    const response = await api.post(`/admin/chat/messages/${messageId}/moderate`, { action })
    return response.data
  },
}

// 钱包管理 API
export const walletAPI = {
  getWallets: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get('/admin/wallet/wallets', { params })
    return response.data
  },
  getTransactions: async (params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await api.get('/admin/wallet/transactions', { params })
    return response.data
  },
  getWalletStats: async () => {
    const response = await api.get('/admin/wallet/stats')
    return response.data
  },
  approveTransaction: async (transactionId: string) => {
    const response = await api.post(`/admin/wallet/transactions/${transactionId}/approve`)
    return response.data
  },
  rejectTransaction: async (transactionId: string, reason: string) => {
    const response = await api.post(`/admin/wallet/transactions/${transactionId}/reject`, { reason })
    return response.data
  },
  exportTransactions: async (filters?: any) => {
    const response = await api.get('/admin/wallet/transactions/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },
}

// 小程序管理 API
export const miniAppAPI = {
  getMiniApps: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) => {
    const response = await api.get('/admin/miniapps', { params })
    return response.data
  },
  getMiniAppById: async (id: string) => {
    const response = await api.get(`/admin/miniapps/${id}`)
    return response.data
  },
  approveMiniApp: async (id: string) => {
    const response = await api.post(`/admin/miniapps/${id}/approve`)
    return response.data
  },
  rejectMiniApp: async (id: string, reason: string) => {
    const response = await api.post(`/admin/miniapps/${id}/reject`, { reason })
    return response.data
  },
  updateMiniApp: async (id: string, data: any) => {
    const response = await api.put(`/admin/miniapps/${id}`, data)
    return response.data
  },
  getMiniAppStats: async () => {
    const response = await api.get('/admin/miniapps/stats')
    return response.data
  },
}

// 系统监控 API
export const systemAPI = {
  getSystemHealth: async () => {
    const response = await api.get('/health')
    return response.data
  },
  getSystemStats: async () => {
    const response = await api.get('/admin/system/stats')
    return response.data
  },
  getLogs: async (params?: {
    level?: string
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }) => {
    const response = await api.get('/admin/system/logs', { params })
    return response.data
  },
  getPerformanceMetrics: async (timeRange?: string) => {
    const response = await api.get('/admin/system/performance', {
      params: { timeRange }
    })
    return response.data
  },
}

// 数据分析 API
export const analyticsAPI = {
  getDashboardData: async () => {
    const response = await api.get('/admin/analytics/dashboard')
    return response.data
  },
  
  getAnalytics: async (params: any) => {
    const response = await api.get('/admin/analytics', {
      params
    })
    return response.data
  },
  getUserAnalytics: async (timeRange: string) => {
    const response = await api.get('/admin/analytics/users', {
      params: { timeRange }
    })
    return response.data
  },
  getChatAnalytics: async (timeRange: string) => {
    const response = await api.get('/admin/analytics/chat', {
      params: { timeRange }
    })
    return response.data
  },
  getFinancialAnalytics: async (timeRange: string) => {
    const response = await api.get('/admin/analytics/financial', {
      params: { timeRange }
    })
    return response.data
  },
  exportReport: async (reportType: string, params?: any) => {
    const response = await api.get(`/admin/analytics/export/${reportType}`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },
}

export default api
