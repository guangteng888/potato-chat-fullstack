import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../services/api'
import { message } from 'antd'

interface User {
  id: string
  username: string
  email: string
  role: string
  avatar?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (credentials: { identifier: string; password: string }) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的认证信息
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (credentials: { identifier: string; password: string }) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        const { user: userData, token } = response.data
        
        // 检查用户是否有管理员权限
        if (userData.role !== 'admin' && userData.role !== 'superadmin') {
          throw new Error('无管理员权限')
        }
        
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        
        message.success('登录成功')
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      message.error(error.message || '登录失败')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      setUser(null)
      setIsAuthenticated(false)
      message.success('已退出登录')
    }
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
