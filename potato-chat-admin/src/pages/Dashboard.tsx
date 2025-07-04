import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Typography,
  Space,
  Button,
  Select,
  Table,
  Tag,
  Avatar,
  Tooltip,
  Alert,
  Spin
} from 'antd'
import {
  UserOutlined,
  MessageOutlined,
  WalletOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js'
import { motion } from 'framer-motion'
import { useAdmin } from '../contexts/AdminContext'
import { analyticsAPI, systemAPI } from '../services/api'
import dayjs from 'dayjs'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

const { Text } = Typography

const Dashboard: React.FC = () => {
  const { stats, loading: adminLoading, refreshStats } = useAdmin()
  const [timeRange, setTimeRange] = useState('7d')
  const [chartData, setChartData] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 获取图表数据
  const fetchChartData = async () => {
    try {
      setLoading(true)
      const [userAnalytics, chatAnalytics, financialAnalytics] = await Promise.all([
        analyticsAPI.getUserAnalytics(timeRange),
        analyticsAPI.getChatAnalytics(timeRange),
        analyticsAPI.getFinancialAnalytics(timeRange)
      ])

      // 构建图表数据
      const days = Array.from({ length: 7 }, (_, i) => 
        dayjs().subtract(6 - i, 'day').format('MM/DD')
      )

      setChartData({
        userGrowth: {
          labels: days,
          datasets: [
            {
              label: '新用户',
              data: userAnalytics.data?.dailyNewUsers || Array(7).fill(0),
              borderColor: '#1890ff',
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: '活跃用户',
              data: userAnalytics.data?.dailyActiveUsers || Array(7).fill(0),
              borderColor: '#52c41a',
              backgroundColor: 'rgba(82, 196, 26, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        messageStats: {
          labels: days,
          datasets: [
            {
              label: '消息数量',
              data: chatAnalytics.data?.dailyMessages || Array(7).fill(0),
              backgroundColor: '#722ed1',
              borderColor: '#722ed1',
              borderWidth: 2
            }
          ]
        },
        walletDistribution: {
          labels: ['活跃钱包', '休眠钱包', '新注册'],
          datasets: [
            {
              data: [65, 25, 10],
              backgroundColor: ['#1890ff', '#faad14', '#52c41a'],
              borderWidth: 2,
              borderColor: '#fff'
            }
          ]
        }
      })

      // 模拟最近活动数据
      setRecentActivities([
        {
          key: '1',
          user: { name: '张三', avatar: '' },
          action: '注册了新账户',
          time: '2分钟前',
          type: 'user'
        },
        {
          key: '2',
          user: { name: '李四', avatar: '' },
          action: '发送了消息',
          time: '5分钟前',
          type: 'message'
        },
        {
          key: '3',
          user: { name: '王五', avatar: '' },
          action: '进行了转账',
          time: '10分钟前',
          type: 'transaction'
        },
        {
          key: '4',
          user: { name: '赵六', avatar: '' },
          action: '安装了小程序',
          time: '15分钟前',
          type: 'miniapp'
        }
      ])

      // 模拟系统告警
      setSystemAlerts([
        {
          id: 1,
          type: 'error',
          title: 'API响应时间过长',
          description: '/api/chat/messages 接口平均响应时间超过2秒',
          time: '5分钟前'
        },
        {
          id: 2,
          type: 'warning',
          title: '内存使用率较高',
          description: '服务器内存使用率达到85%',
          time: '10分钟前'
        }
      ])

    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [timeRange])

  // 统计卡片数据
  const statisticCards = [
    {
      title: '总用户数',
      value: stats?.users.total || 0,
      prefix: <UserOutlined style={{ color: '#1890ff' }} />,
      suffix: '人',
      precision: 0,
      valueStyle: { color: '#1890ff' },
      trend: { value: stats?.users.growth || 0, isPositive: true }
    },
    {
      title: '活跃用户',
      value: stats?.users.active || 0,
      prefix: <UserOutlined style={{ color: '#52c41a' }} />,
      suffix: '人',
      precision: 0,
      valueStyle: { color: '#52c41a' },
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: '消息总数',
      value: stats?.chats.totalMessages || 0,
      prefix: <MessageOutlined style={{ color: '#722ed1' }} />,
      suffix: '条',
      precision: 0,
      valueStyle: { color: '#722ed1' },
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: '钱包余额',
      value: (stats?.wallets.totalBalance || 0) / 100,
      prefix: <WalletOutlined style={{ color: '#fa8c16' }} />,
      suffix: '元',
      precision: 2,
      valueStyle: { color: '#fa8c16' },
      trend: { value: 15.8, isPositive: true }
    }
  ]

  // 活动表格列定义
  const activityColumns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={user.avatar} />
          <Text>{user.name}</Text>
        </Space>
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 100
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeConfig = {
          user: { color: 'blue', text: '用户' },
          message: { color: 'purple', text: '消息' },
          transaction: { color: 'orange', text: '交易' },
          miniapp: { color: 'green', text: '小程序' }
        }
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.user
        return <Tag color={config.color}>{config.text}</Tag>
      }
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
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          数据概览
        </Typography.Title>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
            options={[
              { label: '近7天', value: '7d' },
              { label: '近30天', value: '30d' },
              { label: '近90天', value: '90d' }
            ]}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              refreshStats()
              fetchChartData()
            }}
            loading={adminLoading || loading}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statisticCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  precision={card.precision}
                  valueStyle={card.valueStyle}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    较昨日 
                    {card.trend.isPositive ? (
                      <span style={{ color: '#52c41a', marginLeft: 4 }}>
                        <ArrowUpOutlined /> {card.trend.value}%
                      </span>
                    ) : (
                      <span style={{ color: '#ff4d4f', marginLeft: 4 }}>
                        <ArrowDownOutlined /> {card.trend.value}%
                      </span>
                    )}
                  </Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 系统告警 */}
      {systemAlerts.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Alert
                message="系统告警"
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {systemAlerts.map(alert => (
                      <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <WarningOutlined style={{ color: alert.type === 'error' ? '#ff4d4f' : '#faad14' }} />
                          <div>
                            <Text strong>{alert.title}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{alert.description}</Text>
                          </div>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>{alert.time}</Text>
                      </div>
                    ))}
                  </Space>
                }
                type="warning"
                showIcon={false}
                action={
                  <Button size="small" icon={<EyeOutlined />}>
                    查看详情
                  </Button>
                }
              />
            </motion.div>
          </Col>
        </Row>
      )}

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 用户增长趋势 */}
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card title="用户增长趋势" loading={loading}>
              <div style={{ height: 300 }}>
                {chartData?.userGrowth && (
                  <Line data={chartData.userGrowth} options={chartOptions} />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 钱包分布 */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card title="钱包状态分布" loading={loading}>
              <div style={{ height: 300 }}>
                {chartData?.walletDistribution && (
                  <Doughnut 
                    data={chartData.walletDistribution} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 消息统计和最近活动 */}
      <Row gutter={[16, 16]}>
        {/* 消息统计 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card title="每日消息统计" loading={loading}>
              <div style={{ height: 300 }}>
                {chartData?.messageStats && (
                  <Bar data={chartData.messageStats} options={chartOptions} />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card title="最近活动">
              <Table
                dataSource={recentActivities}
                columns={activityColumns}
                pagination={false}
                size="small"
                scroll={{ y: 260 }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card title="系统状态">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                  <Statistic title="系统运行时间" value={stats?.system.uptime || 0} suffix="小时" />
                </Col>
                <Col xs={24} sm={6}>
                  <div>
                    <Text type="secondary">CPU 使用率</Text>
                    <Progress 
                      percent={stats?.system.cpu || 0} 
                      status={stats && stats.system.cpu > 80 ? 'exception' : 'normal'}
                      strokeColor={stats && stats.system.cpu > 80 ? '#ff4d4f' : '#1890ff'}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div>
                    <Text type="secondary">内存使用率</Text>
                    <Progress 
                      percent={stats?.system.memory || 0} 
                      status={stats && stats.system.memory > 85 ? 'exception' : 'normal'}
                      strokeColor={stats && stats.system.memory > 85 ? '#ff4d4f' : '#52c41a'}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div>
                    <Text type="secondary">存储使用率</Text>
                    <Progress 
                      percent={stats?.system.storage || 0} 
                      status={stats && stats.system.storage > 90 ? 'exception' : 'normal'}
                      strokeColor={stats && stats.system.storage > 90 ? '#ff4d4f' : '#faad14'}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
