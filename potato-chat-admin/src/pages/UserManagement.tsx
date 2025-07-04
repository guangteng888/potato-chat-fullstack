import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Input,
  Button,
  Select,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Row,
  Col,
  Statistic,
  Typography,
  Popconfirm,
  message,
  Drawer,
  Descriptions,
  Switch,
  DatePicker,
  Tooltip,
  Badge
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  UserOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { ColumnsType } from 'antd/es/table'
import { userAPI } from '../services/api'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'banned'
  role: 'user' | 'admin' | 'superadmin'
  createdAt: string
  lastSeen?: string
  phoneNumber?: string
  walletBalance?: number
  messageCount?: number
  loginCount?: number
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    banned: 0,
    newToday: 0
  })
  const [form] = Form.useForm()

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      }

      const response = await userAPI.getUsers(params)
      if (response.success) {
        setUsers(response.data.users || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }))
      }
    } catch (error) {
      message.error('获取用户列表失败')
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取用户统计
  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [pagination.current, pagination.pageSize])

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchUsers()
  }

  // 重置筛选
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('')
    setRoleFilter('')
    setDateRange(null)
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(fetchUsers, 100)
  }

  // 查看用户详情
  const handleViewUser = async (user: User) => {
    try {
      const response = await userAPI.getUserById(user.id)
      if (response.success) {
        setSelectedUser(response.data.user)
        setDetailDrawerVisible(true)
      }
    } catch (error) {
      message.error('获取用户详情失败')
    }
  }

  // 编辑用户
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role,
      phoneNumber: user.phoneNumber
    })
    setEditModalVisible(true)
  }

  // 保存用户编辑
  const handleSaveUser = async (values: any) => {
    if (!selectedUser) return

    try {
      const response = await userAPI.updateUser(selectedUser.id, values)
      if (response.success) {
        message.success('用户信息更新成功')
        setEditModalVisible(false)
        fetchUsers()
      }
    } catch (error) {
      message.error('更新用户信息失败')
    }
  }

  // 更新用户状态
  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await userAPI.updateUserStatus(userId, status)
      if (response.success) {
        message.success('用户状态更新成功')
        fetchUsers()
      }
    } catch (error) {
      message.error('更新用户状态失败')
    }
  }

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await userAPI.deleteUser(userId)
      if (response.success) {
        message.success('用户删除成功')
        fetchUsers()
      }
    } catch (error) {
      message.error('删除用户失败')
    }
  }

  // 导出用户数据
  const handleExport = async () => {
    try {
      const filters = {
        search: searchText,
        status: statusFilter,
        role: roleFilter,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      }

      // 这里可以调用导出API，也可以直接导出当前页面数据
      const exportData = users.map(user => ({
        '用户ID': user.id,
        '用户名': user.username,
        '邮箱': user.email,
        '状态': user.status === 'active' ? '活跃' : user.status === 'inactive' ? '不活跃' : '已封禁',
        '角色': user.role === 'admin' ? '管理员' : user.role === 'superadmin' ? '超级管理员' : '普通用户',
        '注册时间': dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        '最后登录': user.lastSeen ? dayjs(user.lastSeen).format('YYYY-MM-DD HH:mm:ss') : '从未登录',
        '钱包余额': user.walletBalance ? `¥${(user.walletBalance / 100).toFixed(2)}` : '¥0.00'
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '用户数据')
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      saveAs(blob, `用户数据_${dayjs().format('YYYY-MM-DD')}.xlsx`)
      
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar 
            size="small" 
            src={record.avatar} 
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.username}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'orange', text: '不活跃' },
          banned: { color: 'red', text: '已封禁' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => {
        const roleConfig = {
          user: { color: 'blue', text: '用户' },
          admin: { color: 'purple', text: '管理员' },
          superadmin: { color: 'red', text: '超管' }
        }
        const config = roleConfig[role as keyof typeof roleConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '钱包余额',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
      width: 120,
      render: (balance: number) => (
        <Text strong>¥{((balance || 0) / 100).toFixed(2)}</Text>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '最后登录',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: 150,
      render: (date: string) => 
        date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '从未登录'
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Popconfirm
            title={`确定要${record.status === 'banned' ? '解封' : '封禁'}该用户吗？`}
            onConfirm={() => 
              handleUpdateUserStatus(
                record.id, 
                record.status === 'banned' ? 'active' : 'banned'
              )
            }
          >
            <Tooltip title={record.status === 'banned' ? '解封' : '封禁'}>
              <Button
                type="text"
                size="small"
                danger={record.status !== 'banned'}
              >
                {record.status === 'banned' ? '解封' : '封禁'}
              </Button>
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            title="确定要删除该用户吗？此操作不可恢复！"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: 24 }}>
        用户管理
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: '总用户数', value: stats.total, color: '#1890ff' },
          { title: '活跃用户', value: stats.active, color: '#52c41a' },
          { title: '不活跃用户', value: stats.inactive, color: '#faad14' },
          { title: '封禁用户', value: stats.banned, color: '#ff4d4f' },
          { title: '今日新增', value: stats.newToday, color: '#722ed1' }
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={4} xl={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 筛选和搜索 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <Search
              placeholder="搜索用户名或邮箱"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4} lg={3}>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="active">活跃</Option>
              <Option value="inactive">不活跃</Option>
              <Option value="banned">已封禁</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4} lg={3}>
            <Select
              placeholder="角色"
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
              <Option value="superadmin">超级管理员</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize
              }))
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        width={600}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                src={selectedUser.avatar} 
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Title level={4}>{selectedUser.username}</Title>
              <Tag color="blue">{selectedUser.email}</Tag>
            </div>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="用户ID">
                {selectedUser.id}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  selectedUser.status === 'active' ? 'green' :
                  selectedUser.status === 'inactive' ? 'orange' : 'red'
                }>
                  {selectedUser.status === 'active' ? '活跃' :
                   selectedUser.status === 'inactive' ? '不活跃' : '已封禁'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color={
                  selectedUser.role === 'superadmin' ? 'red' :
                  selectedUser.role === 'admin' ? 'purple' : 'blue'
                }>
                  {selectedUser.role === 'superadmin' ? '超级管理员' :
                   selectedUser.role === 'admin' ? '管理员' : '普通用户'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                {selectedUser.phoneNumber || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额">
                <Text strong>¥{((selectedUser.walletBalance || 0) / 100).toFixed(2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="消息数量">
                {selectedUser.messageCount || 0} 条
              </Descriptions.Item>
              <Descriptions.Item label="登录次数">
                {selectedUser.loginCount || 0} 次
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {selectedUser.lastSeen ? 
                  dayjs(selectedUser.lastSeen).format('YYYY-MM-DD HH:mm:ss') : 
                  '从未登录'
                }
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">不活跃</Option>
                  <Option value="banned">已封禁</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="user">普通用户</Option>
                  <Option value="admin">管理员</Option>
                  <Option value="superadmin">超级管理员</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="phoneNumber"
            label="手机号"
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
