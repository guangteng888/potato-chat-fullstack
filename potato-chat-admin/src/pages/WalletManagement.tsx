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
  InputNumber,
  DatePicker,
  Popconfirm,
  message,
  Tooltip,
  Progress,
  Alert,
  Tabs
} from 'antd'
import {
  SearchOutlined,
  WalletOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  DollarOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  WarningOutlined,
  BankOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { ColumnsType } from 'antd/es/table'
import { Line, Bar } from 'react-chartjs-2'
import { walletAPI } from '../services/api'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { TabPane } = Tabs

interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'transfer' | 'fee'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  fromUser?: {
    id: string
    username: string
  }
  toUser?: {
    id: string
    username: string
  }
  description: string
  createdAt: string
  processedAt?: string
  fee?: number
  referenceId?: string
}

interface Wallet {
  id: string
  user: {
    id: string
    username: string
    email: string
  }
  balance: number
  frozenAmount: number
  totalDeposit: number
  totalWithdraw: number
  createdAt: string
  lastTransactionAt?: string
  status: 'active' | 'frozen' | 'closed'
}

const WalletManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [approveModalVisible, setApproveModalVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    pendingTransactions: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    activeWallets: 0,
    frozenWallets: 0
  })
  const [chartData, setChartData] = useState<any>(null)
  const [form] = Form.useForm()

  // 获取交易列表
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      }

      const response = await walletAPI.getTransactions(params)
      if (response.success) {
        setTransactions(response.data.transactions || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }))
      }
    } catch (error) {
      message.error('获取交易列表失败')
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取钱包列表
  const fetchWallets = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined
      }

      const response = await walletAPI.getWallets(params)
      if (response.success) {
        setWallets(response.data.wallets || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }))
      }
    } catch (error) {
      message.error('获取钱包列表失败')
      console.error('Failed to fetch wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await walletAPI.getWalletStats()
      if (response.success) {
        setStats(response.data)
        
        // 构建图表数据
        const days = Array.from({ length: 7 }, (_, i) => 
          dayjs().subtract(6 - i, 'day').format('MM/DD')
        )
        
        setChartData({
          revenue: {
            labels: days,
            datasets: [
              {
                label: '收入',
                data: response.data.dailyRevenue || Array(7).fill(0),
                borderColor: '#52c41a',
                backgroundColor: 'rgba(82, 196, 26, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: '支出',
                data: response.data.dailyExpense || Array(7).fill(0),
                borderColor: '#ff4d4f',
                backgroundColor: 'rgba(255, 77, 79, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          transactions: {
            labels: days,
            datasets: [
              {
                label: '交易笔数',
                data: response.data.dailyTransactions || Array(7).fill(0),
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                borderWidth: 2
              }
            ]
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions()
    } else {
      fetchWallets()
    }
    fetchStats()
  }, [activeTab, pagination.current, pagination.pageSize])

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    if (activeTab === 'transactions') {
      fetchTransactions()
    } else {
      fetchWallets()
    }
  }

  // 重置筛选
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('')
    setTypeFilter('')
    setDateRange(null)
    setPagination(prev => ({ ...prev, current: 1 }))
    setTimeout(() => {
      if (activeTab === 'transactions') {
        fetchTransactions()
      } else {
        fetchWallets()
      }
    }, 100)
  }

  // 审批交易
  const handleApproveTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setApproveModalVisible(true)
  }

  // 拒绝交易
  const handleRejectTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setRejectModalVisible(true)
    form.resetFields()
  }

  // 提交审批
  const handleSubmitApproval = async () => {
    if (!selectedTransaction) return

    try {
      const response = await walletAPI.approveTransaction(selectedTransaction.id)
      if (response.success) {
        message.success('交易审批成功')
        setApproveModalVisible(false)
        fetchTransactions()
      }
    } catch (error) {
      message.error('交易审批失败')
    }
  }

  // 提交拒绝
  const handleSubmitRejection = async (values: any) => {
    if (!selectedTransaction) return

    try {
      const response = await walletAPI.rejectTransaction(selectedTransaction.id, values.reason)
      if (response.success) {
        message.success('交易已拒绝')
        setRejectModalVisible(false)
        fetchTransactions()
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 导出数据
  const handleExport = async () => {
    try {
      const filters = {
        type: typeFilter,
        status: statusFilter,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      }

      const exportData = transactions.map(transaction => ({
        '交易ID': transaction.id,
        '类型': transaction.type === 'deposit' ? '充值' : 
               transaction.type === 'withdraw' ? '提现' :
               transaction.type === 'transfer' ? '转账' : '手续费',
        '金额': `¥${(transaction.amount / 100).toFixed(2)}`,
        '状态': transaction.status === 'pending' ? '待处理' :
               transaction.status === 'completed' ? '已完成' :
               transaction.status === 'failed' ? '失败' : '已取消',
        '发起用户': transaction.fromUser?.username || '-',
        '接收用户': transaction.toUser?.username || '-',
        '描述': transaction.description,
        '手续费': transaction.fee ? `¥${(transaction.fee / 100).toFixed(2)}` : '¥0.00',
        '创建时间': dayjs(transaction.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        '处理时间': transaction.processedAt ? 
          dayjs(transaction.processedAt).format('YYYY-MM-DD HH:mm:ss') : '未处理'
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '交易数据')
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      saveAs(blob, `交易数据_${dayjs().format('YYYY-MM-DD')}.xlsx`)
      
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  // 交易表格列定义
  const transactionColumns: ColumnsType<Transaction> = [
    {
      title: '交易ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text code style={{ fontSize: 12 }}>
          {id.substring(0, 8)}...
        </Text>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeConfig = {
          deposit: { color: 'green', text: '充值' },
          withdraw: { color: 'orange', text: '提现' },
          transfer: { color: 'blue', text: '转账' },
          fee: { color: 'purple', text: '手续费' }
        }
        const config = typeConfig[type as keyof typeof typeConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          ¥{(amount / 100).toFixed(2)}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: '待处理' },
          completed: { color: 'green', text: '已完成' },
          failed: { color: 'red', text: '失败' },
          cancelled: { color: 'default', text: '已取消' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '发起用户',
      dataIndex: 'fromUser',
      key: 'fromUser',
      width: 120,
      render: (user: any) => user?.username || '-'
    },
    {
      title: '接收用户',
      dataIndex: 'toUser',
      key: 'toUser',
      width: 120,
      render: (user: any) => user?.username || '-'
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: number) => (
        fee ? `¥${(fee / 100).toFixed(2)}` : '¥0.00'
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
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
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
                  onClick={() => handleApproveTransaction(record)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleRejectTransaction(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  // 钱包表格列定义
  const walletColumns: ColumnsType<Wallet> = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{user.username}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user.email}
          </Text>
        </div>
      )
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          ¥{(balance / 100).toFixed(2)}
        </Text>
      )
    },
    {
      title: '冻结金额',
      dataIndex: 'frozenAmount',
      key: 'frozenAmount',
      width: 120,
      render: (amount: number) => (
        <Text style={{ color: amount > 0 ? '#ff4d4f' : '#666' }}>
          ¥{(amount / 100).toFixed(2)}
        </Text>
      )
    },
    {
      title: '累计充值',
      dataIndex: 'totalDeposit',
      key: 'totalDeposit',
      width: 120,
      render: (amount: number) => (
        <Text style={{ color: '#52c41a' }}>
          ¥{(amount / 100).toFixed(2)}
        </Text>
      )
    },
    {
      title: '累计提现',
      dataIndex: 'totalWithdraw',
      key: 'totalWithdraw',
      width: 120,
      render: (amount: number) => (
        <Text style={{ color: '#faad14' }}>
          ¥{(amount / 100).toFixed(2)}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: '正常' },
          frozen: { color: 'red', text: '冻结' },
          closed: { color: 'default', text: '关闭' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '最后交易',
      dataIndex: 'lastTransactionAt',
      key: 'lastTransactionAt',
      width: 150,
      render: (date: string) => 
        date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '无交易记录'
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Tooltip title="冻结/解冻">
            <Button
              type="text"
              size="small"
              danger={record.status === 'active'}
            >
              {record.status === 'frozen' ? '解冻' : '冻结'}
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: 24 }}>
        钱包管理
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { 
            title: '总余额', 
            value: (stats.totalBalance / 100).toFixed(2), 
            prefix: <WalletOutlined />, 
            suffix: '元',
            color: '#1890ff',
            trend: { value: 5.2, isPositive: true }
          },
          { 
            title: '今日收入', 
            value: (stats.todayRevenue / 100).toFixed(2), 
            prefix: <CaretUpOutlined />, 
            suffix: '元',
            color: '#52c41a',
            trend: { value: 12.8, isPositive: true }
          },
          { 
            title: '本月收入', 
            value: (stats.monthlyRevenue / 100).toFixed(2), 
            prefix: <DollarOutlined />, 
            suffix: '元',
            color: '#722ed1',
            trend: { value: 8.3, isPositive: true }
          },
          { 
            title: '待处理交易', 
            value: stats.pendingTransactions, 
            prefix: <WarningOutlined />, 
            suffix: '笔',
            color: '#faad14',
            trend: { value: 2.1, isPositive: false }
          },
          { 
            title: '活跃钱包', 
            value: stats.activeWallets, 
            prefix: <BankOutlined />, 
            suffix: '个',
            color: '#13c2c2',
            trend: { value: 15.6, isPositive: true }
          }
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
                  prefix={React.cloneElement(stat.prefix, { style: { color: stat.color } })}
                  suffix={stat.suffix}
                  valueStyle={{ color: stat.color }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    较昨日 
                    {stat.trend.isPositive ? (
                      <span style={{ color: '#52c41a', marginLeft: 4 }}>
                        <CaretUpOutlined /> {stat.trend.value}%
                      </span>
                    ) : (
                      <span style={{ color: '#ff4d4f', marginLeft: 4 }}>
                        <CaretDownOutlined /> {stat.trend.value}%
                      </span>
                    )}
                  </Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="收支趋势">
            <div style={{ height: 300 }}>
              {chartData?.revenue && (
                <Line data={chartData.revenue} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="交易量统计">
            <div style={{ height: 300 }}>
              {chartData?.transactions && (
                <Bar data={chartData.transactions} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 风险提醒 */}
      {stats.pendingTransactions > 50 && (
        <Alert
          message="风险提醒"
          description={`当前有 ${stats.pendingTransactions} 笔交易待处理，请及时审核处理！`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="交易管理" key="transactions">
            {/* 筛选和搜索 */}
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  placeholder="交易类型"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="deposit">充值</Option>
                  <Option value="withdraw">提现</Option>
                  <Option value="transfer">转账</Option>
                  <Option value="fee">手续费</Option>
                </Select>
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  placeholder="交易状态"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="pending">待处理</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                  <Option value="cancelled">已取消</Option>
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

            <Table
              columns={transactionColumns}
              dataSource={transactions}
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
          </TabPane>

          <TabPane tab="钱包管理" key="wallets">
            {/* 搜索 */}
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8} lg={6}>
                <Search
                  placeholder="搜索用户名或邮箱"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  allowClear
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
                </Space>
              </Col>
            </Row>

            <Table
              columns={walletColumns}
              dataSource={wallets}
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
          </TabPane>
        </Tabs>
      </Card>

      {/* 审批交易模态框 */}
      <Modal
        title="审批交易"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleSubmitApproval}
        width={500}
      >
        {selectedTransaction && (
          <div>
            <Alert
              message="确认审批"
              description="请确认是否审批通过此笔交易。审批后交易将立即执行，无法撤销。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <Row gutter={[16, 8]}>
                <Col span={8}><Text strong>交易类型:</Text></Col>
                <Col span={16}>
                  <Tag color="blue">
                    {selectedTransaction.type === 'deposit' ? '充值' : 
                     selectedTransaction.type === 'withdraw' ? '提现' : '转账'}
                  </Tag>
                </Col>
                <Col span={8}><Text strong>交易金额:</Text></Col>
                <Col span={16}>
                  <Text strong style={{ color: '#1890ff' }}>
                    ¥{(selectedTransaction.amount / 100).toFixed(2)}
                  </Text>
                </Col>
                <Col span={8}><Text strong>发起用户:</Text></Col>
                <Col span={16}>{selectedTransaction.fromUser?.username || '-'}</Col>
                <Col span={8}><Text strong>接收用户:</Text></Col>
                <Col span={16}>{selectedTransaction.toUser?.username || '-'}</Col>
                <Col span={8}><Text strong>交易描述:</Text></Col>
                <Col span={16}>{selectedTransaction.description}</Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* 拒绝交易模态框 */}
      <Modal
        title="拒绝交易"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        {selectedTransaction && (
          <div>
            <Alert
              message="拒绝交易"
              description="请输入拒绝理由。拒绝后交易将被标记为失败状态。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
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
                <Input.TextArea 
                  rows={4} 
                  placeholder="请详细说明拒绝原因..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WalletManagement
