import React, { useState } from 'react'
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Switch,
  Typography,
  Space,
  Divider,
  notification
} from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  MessageOutlined,
  WalletOutlined,
  AppstoreOutlined,
  MonitorOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdmin } from '../../contexts/AdminContext'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, setTheme, sidebarCollapsed, setSidebarCollapsed, stats } = useAdmin()
  const [notifications] = useState([
    { id: 1, title: '新用户注册', content: '有5个新用户注册', type: 'info' },
    { id: 2, title: '系统告警', content: 'CPU使用率超过80%', type: 'warning' },
    { id: 3, title: '交易异常', content: '检测到可疑交易', type: 'error' },
  ])

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: '聊天管理',
    },
    {
      key: '/wallet',
      icon: <WalletOutlined />,
      label: '钱包管理',
    },
    {
      key: '/miniapps',
      icon: <AppstoreOutlined />,
      label: '小程序管理',
    },
    {
      key: '/system',
      icon: <MonitorOutlined />,
      label: '系统监控',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleNotificationClick = () => {
    notification.open({
      message: '通知中心',
      description: '您有新的系统通知',
      placement: 'topRight',
    })
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const notificationMenuItems = notifications.map(notif => ({
    key: notif.id.toString(),
    label: (
      <div style={{ width: 280 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{notif.title}</div>
        <div style={{ color: '#666', fontSize: 12 }}>{notif.content}</div>
      </div>
    ),
  }))

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={240}
        style={{
          background: theme === 'dark' ? '#001529' : '#fff',
          borderRight: theme === 'light' ? '1px solid #f0f0f0' : 'none',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030',
          }}
        >
          <Typography.Title
            level={4}
            style={{
              margin: 0,
              color: theme === 'dark' ? '#fff' : '#1890ff',
              fontSize: sidebarCollapsed ? 16 : 18,
            }}
          >
            {sidebarCollapsed ? 'PC' : 'Potato Chat'}
          </Typography.Title>
        </div>
        
        <Menu
          theme={theme}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ borderRight: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: theme === 'dark' ? '#141414' : '#fff',
            borderBottom: theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            
            {/* 实时统计显示 */}
            {stats && (
              <Space size="large" style={{ marginLeft: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                    {stats.users.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>总用户</div>
                </div>
                <Divider type="vertical" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
                    {stats.users.active.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>活跃用户</div>
                </div>
                <Divider type="vertical" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }}>
                    ¥{(stats.wallets.totalBalance / 100).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>钱包余额</div>
                </div>
              </Space>
            )}
          </div>

          <Space size="middle">
            {/* 主题切换 */}
            <Switch
              checked={theme === 'dark'}
              onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />

            {/* 通知 */}
            <Dropdown
              menu={{ items: notificationMenuItems }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <Badge count={notifications.length} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={handleNotificationClick}
                  style={{ fontSize: 16 }}
                />
              </Badge>
            </Dropdown>

            {/* 用户菜单 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                />
                <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                  {user?.username}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: theme === 'dark' ? '#141414' : '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
