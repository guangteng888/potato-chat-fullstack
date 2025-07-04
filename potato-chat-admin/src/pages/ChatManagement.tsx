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
  Typography,
  Row,
  Col,
  Statistic,
  Popconfirm,
  message,
  Drawer,
  List,
  Timeline,
  Badge,
  Tooltip,
  Form
} from 'antd'
import {
  SearchOutlined,
  MessageOutlined,
  EyeOutlined,
  DeleteOutlined,
  WarningOutlined,
  UserOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { ColumnsType } from 'antd/es/table'
import { chatAPI } from '../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Search, TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

interface ChatRoom {
  id: string
  name: string
  type: 'private' | 'group' | 'channel'
  memberCount: number
  messageCount: number
  lastMessage: {
    content: string
    sender: string
    timestamp: string
  }
  createdAt: string
  isActive: boolean
  owner?: {
    id: string
    username: string
    avatar?: string
  }
}

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice'
  sender: {
    id: string
    username: string
    avatar?: string
  }
  timestamp: string
  roomId: string
  isDeleted: boolean
  flagged: boolean
  flagReason?: string
}

const ChatManagement: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messagesDrawerVisible, setMessagesDrawerVisible] = useState(false)
  const [moderateModalVisible, setModerateModalVisible] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalMessages: 0,
    flaggedMessages: 0,
    todayMessages: 0
  })
  const [form] = Form.useForm()

  // 获取聊天室列表
  const fetchRooms = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        type: typeFilter || undefined
      }

      const response = await chatAPI.getRooms(params)
      if (response.success) {
        setRooms(response.data.rooms || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }))
      }
    } catch (error) {
      message.error('获取聊天室列表失败')
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await chatAPI.getChatStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch chat stats:', error)
    }
  }

  // 获取聊天消息
  const fetchMessages = async (roomId: string) => {
    try {
      setMessagesLoading(true)
      const response = await chatAPI.getMessages(roomId, {
        page: 1,
        limit: 50
      })
      if (response.success) {
        setMessages(response.data.messages || [])
      }
    } catch (error) {
      message.error('获取消息列表失败')
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    fetchStats()
  }, [pagination.current, pagination.pageSize])

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchRooms()
  }

  // 重置筛选
  const handleReset = () => {
    setSearchText('')
    setTypeFilter('')
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(fetchRooms, 100)
  }

  // 查看聊天室消息
  const handleViewMessages = async (room: ChatRoom) => {
    setSelectedRoom(room)
    setMessagesDrawerVisible(true)
    await fetchMessages(room.id)
  }

  // 删除消息
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await chatAPI.deleteMessage(messageId)
      if (response.success) {
        message.success('消息删除成功')
        if (selectedRoom) {
          fetchMessages(selectedRoom.id)
        }
      }
    } catch (error) {
      message.error('删除消息失败')
    }
  }

  // 内容审核
  const handleModerateMessage = (message: Message) => {
    setSelectedMessage(message)
    setModerateModalVisible(true)
    form.resetFields()
  }

  // 提交审核结果
  const handleSubmitModeration = async (values: any) => {
    if (!selectedMessage) return

    try {
      const response = await chatAPI.moderateContent(selectedMessage.id, values.action)
      if (response.success) {
        message.success('审核完成')
        setModerateModalVisible(false)
        if (selectedRoom) {
          fetchMessages(selectedRoom.id)
        }
      }
    } catch (error) {
      message.error('审核失败')
    }
  }

  // 聊天室表格列定义
  const roomColumns: ColumnsType<ChatRoom> = [
    {
      title: '聊天室',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            style={{ 
              backgroundColor: record.type === 'group' ? '#1890ff' : 
                               record.type === 'channel' ? '#52c41a' : '#faad14' 
            }}
            icon={record.type === 'group' ? <TeamOutlined /> : <MessageOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.id}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeConfig = {
          private: { color: 'blue', text: '私聊' },
          group: { color: 'green', text: '群聊' },
          channel: { color: 'purple', text: '频道' }
        }
        const config = typeConfig[type as keyof typeof typeConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
      )
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 100,
      render: (count: number) => count.toLocaleString()
    },
    {
      title: '最后消息',
      dataIndex: 'lastMessage',
      key: 'lastMessage',
      width: 200,
      render: (lastMessage: any) => (
        lastMessage ? (
          <div>
            <Text ellipsis style={{ display: 'block', maxWidth: 180 }}>
              {lastMessage.content}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {lastMessage.sender} • {dayjs(lastMessage.timestamp).fromNow()}
            </Text>
          </div>
        ) : (
          <Text type="secondary">暂无消息</Text>
        )
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? '活跃' : '不活跃'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看消息">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewMessages(record)}
            />
          </Tooltip>
          <Tooltip title="聊天室设置">
            <Button
              type="text"
              size="small"
              icon={<FilterOutlined />}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: 24 }}>
        聊天管理
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: '总聊天室', value: stats.totalRooms, icon: <MessageOutlined />, color: '#1890ff' },
          { title: '活跃聊天室', value: stats.activeRooms, icon: <TeamOutlined />, color: '#52c41a' },
          { title: '总消息数', value: stats.totalMessages, icon: <MessageOutlined />, color: '#722ed1' },
          { title: '今日消息', value: stats.todayMessages, icon: <ClockCircleOutlined />, color: '#faad14' },
          { title: '违规消息', value: stats.flaggedMessages, icon: <WarningOutlined />, color: '#ff4d4f' }
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
                  prefix={stat.icon}
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
              placeholder="搜索聊天室名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="聊天室类型"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="private">私聊</Option>
              <Option value="group">群聊</Option>
              <Option value="channel">频道</Option>
            </Select>
          </Col>
          <Col xs={12} sm={10} lg={6}>
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
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 聊天室表格 */}
      <Card>
        <Table
          columns={roomColumns}
          dataSource={rooms}
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

      {/* 消息列表抽屉 */}
      <Drawer
        title={`聊天室消息 - ${selectedRoom?.name}`}
        width={800}
        onClose={() => setMessagesDrawerVisible(false)}
        open={messagesDrawerVisible}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>聊天室信息:</Text>
            <Tag color="blue">{selectedRoom?.type === 'private' ? '私聊' : selectedRoom?.type === 'group' ? '群聊' : '频道'}</Tag>
            <Text type="secondary">成员: {selectedRoom?.memberCount}人</Text>
            <Text type="secondary">消息: {selectedRoom?.messageCount}条</Text>
          </Space>
        </div>

        <List
          loading={messagesLoading}
          itemLayout="vertical"
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              key={message.id}
              actions={[
                <Button
                  type="text"
                  size="small"
                  icon={<WarningOutlined />}
                  onClick={() => handleModerateMessage(message)}
                >
                  举报
                </Button>,
                <Popconfirm
                  title="确定要删除这条消息吗？"
                  onConfirm={() => handleDeleteMessage(message.id)}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>
              ]}
              style={{
                backgroundColor: message.flagged ? '#fff2f0' : undefined,
                padding: 12,
                border: message.flagged ? '1px solid #ffccc7' : '1px solid #f0f0f0',
                borderRadius: 8,
                marginBottom: 8
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    src={message.sender.avatar} 
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <Space>
                    <Text strong>{message.sender.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(message.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                    {message.flagged && (
                      <Tag color="red">违规</Tag>
                    )}
                    {message.isDeleted && (
                      <Tag color="default">已删除</Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    {message.type === 'text' ? (
                      <Text>{message.content}</Text>
                    ) : (
                      <Tag color="blue">{
                        message.type === 'image' ? '图片消息' :
                        message.type === 'file' ? '文件消息' : '语音消息'
                      }</Tag>
                    )}
                    {message.flagReason && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="danger" style={{ fontSize: 12 }}>
                          违规原因: {message.flagReason}
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* 内容审核模态框 */}
      <Modal
        title="内容审核"
        open={moderateModalVisible}
        onCancel={() => setModerateModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        {selectedMessage && (
          <div>
            <div style={{ 
              background: '#f5f5f5', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 16 
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Avatar 
                    src={selectedMessage.sender.avatar} 
                    icon={<UserOutlined />}
                  />
                  <Text strong>{selectedMessage.sender.username}</Text>
                  <Text type="secondary">
                    {dayjs(selectedMessage.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </Space>
                <Text>{selectedMessage.content}</Text>
              </Space>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitModeration}
            >
              <Form.Item
                name="action"
                label="审核操作"
                rules={[{ required: true, message: '请选择审核操作' }]}
              >
                <Select placeholder="请选择审核操作">
                  <Option value="approve">正常内容</Option>
                  <Option value="flag">标记违规</Option>
                  <Option value="delete">删除消息</Option>
                  <Option value="ban_user">封禁用户</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reason"
                label="审核理由"
              >
                <TextArea 
                  rows={3} 
                  placeholder="请输入审核理由（选填）"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ChatManagement
