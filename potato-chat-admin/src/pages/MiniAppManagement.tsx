import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Input,
  Button,
  Select,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Upload,
  Image,
  Rate,
  message,
  Tooltip,
  Popconfirm,
  Badge,
  Descriptions,
  Drawer
} from 'antd'
import {
  SearchOutlined,
  AppstoreOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  StarOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { ColumnsType } from 'antd/es/table'
import { miniAppAPI } from '../services/api'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography
const { TextArea } = Input

interface MiniApp {
  id: string
  name: string
  description: string
  icon: string
  category: string
  developer: {
    id: string
    username: string
    email: string
  }
  version: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  downloads: number
  rating: number
  reviews: number
  size: number
  permissions: string[]
  screenshots: string[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

const MiniAppManagement: React.FC = () => {
  const [miniApps, setMiniApps] = useState<MiniApp[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedMiniApp, setSelectedMiniApp] = useState<MiniApp | null>(null)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [approveModalVisible, setApproveModalVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    totalDownloads: 0,
    averageRating: 0
  })
  const [form] = Form.useForm()

  // 获取小程序列表
  const fetchMiniApps = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined
      }

      const response = await miniAppAPI.getMiniApps(params)
      if (response.success) {
        setMiniApps(response.data.miniApps || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }))
      }
    } catch (error) {
      message.error('获取小程序列表失败')
      console.error('Failed to fetch mini apps:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await miniAppAPI.getMiniAppStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch mini app stats:', error)
    }
  }

  useEffect(() => {
    fetchMiniApps()
    fetchStats()
  }, [pagination.current, pagination.pageSize])

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchMiniApps()
  }

  // 重置筛选
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('')
    setCategoryFilter('')
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(fetchMiniApps, 100)
  }

  // 查看小程序详情
  const handleViewDetails = async (miniApp: MiniApp) => {
    try {
      const response = await miniAppAPI.getMiniAppById(miniApp.id)
      if (response.success) {
        setSelectedMiniApp(response.data.miniApp)
        setDetailDrawerVisible(true)
      }
    } catch (error) {
      message.error('获取小程序详情失败')
    }
  }

  // 审批小程序
  const handleApprove = (miniApp: MiniApp) => {
    setSelectedMiniApp(miniApp)
    setApproveModalVisible(true)
  }

  // 拒绝小程序
  const handleReject = (miniApp: MiniApp) => {
    setSelectedMiniApp(miniApp)
    setRejectModalVisible(true)
    form.resetFields()
  }

  // 提交审批
  const handleSubmitApproval = async () => {
    if (!selectedMiniApp) return

    try {
      const response = await miniAppAPI.approveMiniApp(selectedMiniApp.id)
      if (response.success) {
        message.success('小程序审批通过')
        setApproveModalVisible(false)
        fetchMiniApps()
      }
    } catch (error) {
      message.error('审批失败')
    }
  }

  // 提交拒绝
  const handleSubmitRejection = async (values: any) => {
    if (!selectedMiniApp) return

    try {
      const response = await miniAppAPI.rejectMiniApp(selectedMiniApp.id, values.reason)
      if (response.success) {
        message.success('小程序已拒绝')
        setRejectModalVisible(false)
        fetchMiniApps()
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 表格列定义
  const columns: ColumnsType<MiniApp> = [
    {
      title: '小程序',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <Space>
          <Image
            width={40}
            height={40}
            src={record.icon}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOAOWNHgS0yNi8xOjQWkOQBFQgZbg=="
            style={{ borderRadius: 8 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              v{record.version} • {record.developer.username}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        const categoryColors = {
          '工具': 'blue',
          '游戏': 'green',
          '社交': 'purple',
          '购物': 'orange',
          '教育': 'cyan',
          '娱乐': 'magenta'
        }
        return (
          <Tag color={categoryColors[category as keyof typeof categoryColors] || 'default'}>
            {category}
          </Tag>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
          suspended: { color: 'default', text: '已暂停' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: number, record) => (
        <Space>
          <Rate disabled value={rating} allowHalf style={{ fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            ({record.reviews})
          </Text>
        </Space>
      )
    },
    {
      title: '下载量',
      dataIndex: 'downloads',
      key: 'downloads',
      width: 100,
      render: (downloads: number) => (
        <Badge count={downloads > 1000 ? '1k+' : downloads} 
               style={{ backgroundColor: '#1890ff' }} />
      )
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 80,
      render: (size: number) => `${(size / 1024 / 1024).toFixed(1)}MB`
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
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
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="审批通过">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'approved' && (
            <Tooltip title="暂停">
              <Button
                type="text"
                size="small"
                danger
              >
                暂停
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: 24 }}>
        小程序管理
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: '总数量', value: stats.total, color: '#1890ff' },
          { title: '待审核', value: stats.pending, color: '#faad14' },
          { title: '已通过', value: stats.approved, color: '#52c41a' },
          { title: '已拒绝', value: stats.rejected, color: '#ff4d4f' },
          { title: '总下载', value: stats.totalDownloads, color: '#722ed1' },
          { title: '平均评分', value: stats.averageRating.toFixed(1), color: '#13c2c2' }
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
              placeholder="搜索小程序名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="pending">待审核</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="suspended">已暂停</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="分类"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="工具">工具</Option>
              <Option value="游戏">游戏</Option>
              <Option value="社交">社交</Option>
              <Option value="购物">购物</Option>
              <Option value="教育">教育</Option>
              <Option value="娱乐">娱乐</Option>
            </Select>
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
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 小程序表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={miniApps}
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 小程序详情抽屉 */}
      <Drawer
        title="小程序详情"
        width={800}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedMiniApp && (
          <div>
            {/* 基本信息 */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Image
                width={80}
                height={80}
                src={selectedMiniApp.icon}
                style={{ borderRadius: 12 }}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                {selectedMiniApp.name}
              </Title>
              <Space>
                <Tag color="blue">{selectedMiniApp.category}</Tag>
                <Rate disabled value={selectedMiniApp.rating} allowHalf />
                <Text type="secondary">({selectedMiniApp.reviews} 评价)</Text>
              </Space>
            </div>

            {/* 详细信息 */}
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="小程序ID" span={2}>
                {selectedMiniApp.id}
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                v{selectedMiniApp.version}
              </Descriptions.Item>
              <Descriptions.Item label="大小">
                {(selectedMiniApp.size / 1024 / 1024).toFixed(1)}MB
              </Descriptions.Item>
              <Descriptions.Item label="下载量">
                {selectedMiniApp.downloads.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="评分">
                {selectedMiniApp.rating.toFixed(1)}/5.0
              </Descriptions.Item>
              <Descriptions.Item label="开发者" span={2}>
                <Space>
                  <Text>{selectedMiniApp.developer.username}</Text>
                  <Text type="secondary">({selectedMiniApp.developer.email})</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态" span={2}>
                <Tag color={
                  selectedMiniApp.status === 'approved' ? 'green' :
                  selectedMiniApp.status === 'pending' ? 'orange' :
                  selectedMiniApp.status === 'rejected' ? 'red' : 'default'
                }>
                  {selectedMiniApp.status === 'approved' ? '已通过' :
                   selectedMiniApp.status === 'pending' ? '待审核' :
                   selectedMiniApp.status === 'rejected' ? '已拒绝' : '已暂停'}
                </Tag>
                {selectedMiniApp.rejectionReason && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="danger">拒绝原因: {selectedMiniApp.rejectionReason}</Text>
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {dayjs(selectedMiniApp.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(selectedMiniApp.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {/* 描述 */}
            <Card title="应用描述" size="small" style={{ marginBottom: 16 }}>
              <Text>{selectedMiniApp.description}</Text>
            </Card>

            {/* 权限列表 */}
            <Card title="所需权限" size="small" style={{ marginBottom: 16 }}>
              <Space wrap>
                {selectedMiniApp.permissions.map(permission => (
                  <Tag key={permission} color="blue">{permission}</Tag>
                ))}
              </Space>
            </Card>

            {/* 应用截图 */}
            <Card title="应用截图" size="small">
              <Space wrap>
                {selectedMiniApp.screenshots.map((screenshot, index) => (
                  <Image
                    key={index}
                    width={120}
                    height={200}
                    src={screenshot}
                    style={{ borderRadius: 8 }}
                  />
                ))}
              </Space>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 审批通过模态框 */}
      <Modal
        title="审批小程序"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleSubmitApproval}
        width={500}
      >
        {selectedMiniApp && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image
                width={60}
                height={60}
                src={selectedMiniApp.icon}
                style={{ borderRadius: 8 }}
              />
              <Title level={5} style={{ marginTop: 8 }}>
                {selectedMiniApp.name}
              </Title>
            </div>
            <p>确认审批通过该小程序吗？审批后小程序将在商店中上架。</p>
          </div>
        )}
      </Modal>

      {/* 拒绝审核模态框 */}
      <Modal
        title="拒绝小程序"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        {selectedMiniApp && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image
                width={60}
                height={60}
                src={selectedMiniApp.icon}
                style={{ borderRadius: 8 }}
              />
              <Title level={5} style={{ marginTop: 8 }}>
                {selectedMiniApp.name}
              </Title>
            </div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitRejection}
            >
              <Form.Item
                name="reason"
                label="拒绝理由"
                rules={[{ required: true, message: '请输入拒绝理由' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请详细说明拒绝原因，这将帮助开发者改进应用..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MiniAppManagement
