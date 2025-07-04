import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import ChatManagement from './pages/ChatManagement'
import WalletManagement from './pages/WalletManagement'
import MiniAppManagement from './pages/MiniAppManagement'
import SystemMonitoring from './pages/SystemMonitoring'
import Analytics from './pages/Analytics'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'
import './App.css'

// 私有路由组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// 公开路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/chat" element={<ChatManagement />} />
                <Route path="/wallet" element={<WalletManagement />} />
                <Route path="/miniapps" element={<MiniAppManagement />} />
                <Route path="/system" element={<SystemMonitoring />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <Router>
          <AuthProvider>
            <AdminProvider>
              <AppRoutes />
            </AdminProvider>
          </AuthProvider>
        </Router>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
