import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Divider, Alert } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const onFinish = async (values: { identifier: string; password: string }) => {
    try {
      setLoading(true)
      setError(null)
      await login(values)
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            width: 400,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: 16,
          }}
          bodyStyle={{ padding: 40 }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Logo和标题 */}
            <div style={{ textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <SafetyOutlined
                  style={{
                    fontSize: 48,
                    color: '#1890ff',
                    marginBottom: 16,
                  }}
                />
              </motion.div>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Potato Chat
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                管理员控制台
              </Text>
            </div>

            <Divider />

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </motion.div>
            )}

            {/* 登录表单 */}
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="identifier"
                label="用户名或邮箱"
                rules={[
                  { required: true, message: '请输入用户名或邮箱' },
                  { min: 3, message: '用户名至少3个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名或邮箱"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: 48,
                    fontSize: 16,
                    borderRadius: 8,
                  }}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>
            </Form>

            {/* 提示信息 */}
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                仅限管理员使用 • 请确保您有相应权限
              </Text>
            </div>

            {/* 演示账户信息 */}
            <Card
              size="small"
              title="演示账户"
              style={{
                background: '#f6f8fa',
                border: '1px solid #e1e8ed',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>管理员:</Text>
                  <Text code style={{ marginLeft: 8 }}>admin@potato.chat</Text>
                </div>
                <div>
                  <Text strong>密码:</Text>
                  <Text code style={{ marginLeft: 8 }}>admin123</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Card>
      </motion.div>

      {/* 背景装饰 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  )
}

export default LoginPage
