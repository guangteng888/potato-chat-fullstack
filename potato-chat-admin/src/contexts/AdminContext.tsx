import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { systemAPI, analyticsAPI } from '../services/api'
import { useAuth } from './AuthContext'

interface SystemStats {
  users: {
    total: number
    active: number
    newToday: number
    growth: number
  }
  chats: {
    totalRooms: number
    totalMessages: number
    activeRooms: number
    messagesPerDay: number
  }
  wallets: {
    totalBalance: number
    transactionsToday: number
    revenue: number
    pendingTransactions: number
  }
  miniApps: {
    total: number
    active: number
    pending: number
    installs: number
  }
  system: {
    uptime: number
    cpu: number
    memory: number
    storage: number
  }
}

interface AdminContextType {
  stats: SystemStats | null
  dashboardData: any
  refreshStats: () => Promise<void>
  refreshDashboard: () => Promise<void>
  loading: boolean
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

interface AdminProviderProps {
  children: ReactNode
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 从本地存储恢复主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // 保存主题设置到本地存储
  useEffect(() => {
    localStorage.setItem('admin_theme', theme)
  }, [theme])

  // 获取系统统计数据
  const refreshStats = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      
      // 并行获取各种统计数据
      const [systemResponse, userResponse, chatResponse, walletResponse, miniAppResponse] = await Promise.allSettled([
        systemAPI.getSystemStats(),
        analyticsAPI.getUserAnalytics('today'),
        analyticsAPI.getChatAnalytics('today'),
        analyticsAPI.getFinancialAnalytics('today'),
        analyticsAPI.getDashboardData()
      ])

      // 构建统计数据对象
      const newStats: SystemStats = {
        users: {
          total: 0,
          active: 0,
          newToday: 0,
          growth: 0
        },
        chats: {
          totalRooms: 0,
          totalMessages: 0,
          activeRooms: 0,
          messagesPerDay: 0
        },
        wallets: {
          totalBalance: 0,
          transactionsToday: 0,
          revenue: 0,
          pendingTransactions: 0
        },
        miniApps: {
          total: 0,
          active: 0,
          pending: 0,
          installs: 0
        },
        system: {
          uptime: 0,
          cpu: 0,
          memory: 0,
          storage: 0
        }
      }

      // 处理系统统计
      if (systemResponse.status === 'fulfilled') {
        const systemData = systemResponse.value.data
        newStats.system = {
          uptime: systemData.uptime || 0,
          cpu: systemData.cpu || 0,
          memory: systemData.memory || 0,
          storage: systemData.storage || 0
        }
      }

      // 处理用户统计
      if (userResponse.status === 'fulfilled') {
        const userData = userResponse.value.data
        newStats.users = {
          total: userData.total || 0,
          active: userData.active || 0,
          newToday: userData.newToday || 0,
          growth: userData.growth || 0
        }
      }

      // 处理聊天统计
      if (chatResponse.status === 'fulfilled') {
        const chatData = chatResponse.value.data
        newStats.chats = {
          totalRooms: chatData.totalRooms || 0,
          totalMessages: chatData.totalMessages || 0,
          activeRooms: chatData.activeRooms || 0,
          messagesPerDay: chatData.messagesPerDay || 0
        }
      }

      // 处理钱包统计
      if (walletResponse.status === 'fulfilled') {
        const walletData = walletResponse.value.data
        newStats.wallets = {
          totalBalance: walletData.totalBalance || 0,
          transactionsToday: walletData.transactionsToday || 0,
          revenue: walletData.revenue || 0,
          pendingTransactions: walletData.pendingTransactions || 0
        }
      }

      // 处理小程序统计
      if (miniAppResponse.status === 'fulfilled') {
        const miniAppData = miniAppResponse.value.data
        newStats.miniApps = {
          total: miniAppData.miniApps?.total || 0,
          active: miniAppData.miniApps?.active || 0,
          pending: miniAppData.miniApps?.pending || 0,
          installs: miniAppData.miniApps?.installs || 0
        }
      }

      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取仪表板数据
  const refreshDashboard = async () => {
    if (!isAuthenticated) return
    
    try {
      const response = await analyticsAPI.getDashboardData()
      if (response.success) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  // 当用户登录时获取数据
  useEffect(() => {
    if (isAuthenticated) {
      refreshStats()
      refreshDashboard()
      
      // 设置定时刷新
      const interval = setInterval(() => {
        refreshStats()
      }, 30000) // 每30秒刷新一次
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const value = {
    stats,
    dashboardData,
    refreshStats,
    refreshDashboard,
    loading,
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
