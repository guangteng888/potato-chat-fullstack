import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  DatePicker,
  Select,
  Button,
  Space,
  Tag,
  Progress,
  Tooltip
} from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  MessageOutlined,
  WalletOutlined,
  AppstoreOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import type { ColumnsType } from 'antd/es/table'
import { analyticsAPI } from '../services/api'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    totalMessages: number
    totalTransactions: number
    revenue: number
    userGrowthRate: number
    messageGrowthRate: number
    revenueGrowthRate: number
  }
  userAnalytics: {
    dailyActiveUsers: number[]
    userRegistrations: number[]
    userRetention: {
      day1: number
      day7: number
      day30: number
    }
    userSegments: {
      name: string
      count: number
      percentage: number
    }[]
  }
  messageAnalytics: {
    dailyMessages: number[]
    messageTypes: {
      text: number
      image: number
      file: number
      voice: number
    }
    popularChannels: {
      name: string
      messages: number
      growth: number
    }[]
  }
  revenueAnalytics: {
    dailyRevenue: number[]
    revenueBySource: {
      name: string
      amount: number
      percentage: number
    }[]
    topSpenders: {
      username: string
      amount: number
      transactions: number
    }[]
  }
  miniAppAnalytics: {
    totalApps: number
    activeApps: number
    downloads: number[]
    categories: {
      name: string
      count: number
      downloads: number
    }[]
    topApps: {
      name: string
      downloads: number
      rating: number
    }[]
  }
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [chartData, setChartData] = useState<any>(null)

  // 获取分析数据
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = {
        startDate: timeRange?.[0]?.format('YYYY-MM-DD'),
        endDate: timeRange?.[1]?.format('YYYY-MM-DD')
      }

      const response = await analyticsAPI.getAnalytics(params)
      if (response.success) {
        setData(response.data)
        buildChartData(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // 模拟数据
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 125432,
          activeUsers: 45678,
          newUsers: 2341,
          totalMessages: 1234567,
          totalTransactions: 8765,
          revenue: 234567,
          userGrowthRate: 12.5,
          messageGrowthRate: 8.3,
          revenueGrowthRate: 15.7
        },
        userAnalytics: {
          dailyActiveUsers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5000) + 40000),
          userRegistrations: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 100),
          userRetention: {
            day1: 85.2,
            day7: 65.8,
            day30: 42.3
          },
          userSegments: [
            { name: '新用户', count: 15234, percentage: 35.2 },
            { name: '活跃用户', count: 18567, percentage: 42.9 },
            { name: '沉默用户', count: 7234, percentage: 16.7 },
            { name: '流失用户', count: 2234, percentage: 5.2 }
          ]
        },
        messageAnalytics: {
          dailyMessages: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 30000),
          messageTypes: {
            text: 78.5,
            image: 15.2,
            file: 4.8,
            voice: 1.5
          },
          popularChannels: [
            { name: '技术交流群', messages: 45678, growth: 12.3 },
            { name: '生活分享', messages: 34567, growth: 8.7 },
            { name: '游戏讨论', messages: 23456, growth: -2.1 },
            { name: '学习小组', messages: 18765, growth: 15.6 }
          ]
        },
        revenueAnalytics: {
          dailyRevenue: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10000) + 5000),
          revenueBySource: [
            { name: '充值', amount: 145678, percentage: 62.1 },
            { name: '小程序', amount: 56789, percentage: 24.2 },
            { name: '会员', amount: 23456, percentage: 10.0 },
            { name: '其他', amount: 8765, percentage: 3.7 }
          ],
          topSpenders: [
            { username: '用户A', amount: 12345, transactions: 87 },
            { username: '用户B', amount: 9876, transactions: 65 },
            { username: '用户C', amount: 8765, transactions: 54 },
            { username: '用户D', amount: 7654, transactions: 43 },
            { username: '用户E', amount: 6543, transactions: 32 }
          ]
        },
        miniAppAnalytics: {
          totalApps: 234,
          activeApps: 156,
          downloads: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 500),
          categories: [
            { name: '工具', count: 45, downloads: 23456 },
            { name: '游戏', count: 67, downloads: 34567 },
            { name: '社交', count: 34, downloads: 15678 },
            { name: '购物', count: 23, downloads: 12345 },
            { name: '教育', count: 32, downloads: 9876 },
            { name: '娱乐', count: 33, downloads: 8765 }
          ],
          topApps: [
            { name: '天气助手', downloads: 12345, rating: 4.8 },
            { name: '记账本', downloads: 9876, rating: 4.6 },
            { name: '翻译工具', downloads: 8765, rating: 4.7 },
            { name: '音乐播放器', downloads: 7654, rating: 4.5 },
            { name: '计算器', downloads: 6543, rating: 4.9 }
          ]
        }
      }
      setData(mockData)
      buildChartData(mockData)
    } finally {
      setLoading(false)
    }
  }

  // 构建图表数据
  const buildChartData = (analyticsData: AnalyticsData) => {
    const days = Array.from({ length: 30 }, (_, i) => 
      dayjs().subtract(29 - i, 'day').format('MM/DD')
    )

    setChartData({
      userGrowth: {
        labels: days,
        datasets: [
          {
            label: '日活跃用户',
            data: analyticsData.userAnalytics.dailyActiveUsers,
            borderColor: '#1890ff',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: '新注册用户',
            data: analyticsData.userAnalytics.userRegistrations,
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
            label: '每日消息数',
            data: analyticsData.messageAnalytics.dailyMessages,
            backgroundColor: '#722ed1',
            borderColor: '#722ed1',
            borderWidth: 2
          }
        ]
      },
      revenue: {
        labels: days,
        datasets: [
          {
            label: '每日收入',
            data: analyticsData.revenueAnalytics.dailyRevenue,
            borderColor: '#fa8c16',
            backgroundColor: 'rgba(250, 140, 22, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      userSegments: {
        labels: analyticsData.userAnalytics.userSegments.map(s => s.name),
        datasets: [
          {
            data: analyticsData.userAnalytics.userSegments.map(s => s.percentage),
            backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
            borderWidth: 0
          }
        ]
      },
      messageTypes: {
        labels: ['文字', '图片', '文件', '语音'],
        datasets: [
          {
            data: [
              analyticsData.messageAnalytics.messageTypes.text,
              analyticsData.messageAnalytics.messageTypes.image,
              analyticsData.messageAnalytics.messageTypes.file,
              analyticsData.messageAnalytics.messageTypes.voice
            ],
            backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#722ed1'],
            borderWidth: 0
          }
        ]
      },
      revenueSource: {
        labels: analyticsData.revenueAnalytics.revenueBySource.map(s => s.name),
        datasets: [
          {
            data: analyticsData.revenueAnalytics.revenueBySource.map(s => s.percentage),
            backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#722ed1'],
            borderWidth: 0
          }
        ]
      }
    })
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  // 导出报表
  const handleExport = () => {
    if (!data) return

    try {
      const exportData = {
        '概览数据': [
          { '指标': '总用户数', '数值': data.overview.totalUsers },
          { '指标': '活跃用户数', '数值': data.overview.activeUsers },
          { '指标': '新用户数', '数值': data.overview.newUsers },
          { '指标': '总消息数', '数值': data.overview.totalMessages },
          { '指标': '总交易数', '数值': data.overview.totalTransactions },
          { '指标': '总收入', '数值': `¥${(data.overview.revenue / 100).toFixed(2)}` }
        ],
        '用户留存': [
          { '时间': '1天', '留存率': `${data.userAnalytics.userRetention.day1}%` },
          { '时间': '7天', '留存率': `${data.userAnalytics.userRetention.day7}%` },
          { '时间': '30天', '留存率': `${data.userAnalytics.userRetention.day30}%` }
        ],
        '热门频道': data.messageAnalytics.popularChannels.map(channel => ({
          '频道名称': channel.name,
          '消息数': channel.messages,
          '增长率': `${channel.growth}%`
        })),
        '消费排行': data.revenueAnalytics.topSpenders.map(spender => ({
          '用户名': spender.username,
          '消费金额': `¥${(spender.amount / 100).toFixed(2)}`,
          '交易次数': spender.transactions
        }))
      }

      const wb = XLSX.utils.book_new()
      
      Object.entries(exportData).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      })

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      saveAs(blob, `数据分析报表_${dayjs().format('YYYY-MM-DD')}.xlsx`)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

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

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  // 热门频道表格列
  const channelColumns: ColumnsType<any> = [
    {
      title: '频道名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '消息数',
      dataIndex: 'messages',
      key: 'messages',
      render: (count: number) => count.toLocaleString()
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <span style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {growth >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
          {Math.abs(growth)}%
        </span>
      )
    }
  ]

  // 消费排行表格列
  const spenderColumns: ColumnsType<any> = [
    {
      title: '排名',
      key: 'rank',
      render: (_, __, index) => index + 1
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '消费金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${(amount / 100).toFixed(2)}`
    },
    {
      title: '交易次数',
      dataIndex: 'transactions',
      key: 'transactions'
    }
  ]

  return (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          数据分析
        </Title>
        <Space>
          <RangePicker
            value={timeRange}
            onChange={setTimeRange}
            format="YYYY-MM-DD"
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchAnalytics}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出报表
          </Button>
        </Space>
      </div>

      {/* 概览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {data && [
          { 
            title: '总用户数', 
            value: data.overview.totalUsers, 
            icon: <UserOutlined />, 
            color: '#1890ff',
            growth: data.overview.userGrowthRate
          },
          { 
            title: '活跃用户', 
            value: data.overview.activeUsers, 
            icon: <UserOutlined />, 
            color: '#52c41a',
            growth: data.overview.userGrowthRate * 0.8
          },
          { 
            title: '总消息数', 
            value: data.overview.totalMessages, 
            icon: <MessageOutlined />, 
            color: '#722ed1',
            growth: data.overview.messageGrowthRate
          },
          { 
            title: '总收入', 
            value: `¥${(data.overview.revenue / 100).toFixed(0)}`, 
            icon: <WalletOutlined />, 
            color: '#faad14',
            growth: data.overview.revenueGrowthRate
          },
          { 
            title: '小程序', 
            value: data.miniAppAnalytics.totalApps, 
            icon: <AppstoreOutlined />, 
            color: '#13c2c2',
            growth: 8.5
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
                  prefix={React.cloneElement(stat.icon, { style: { color: stat.color } })}
                  valueStyle={{ color: stat.color }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    较上期 
                    <span style={{ color: stat.growth >= 0 ? '#52c41a' : '#ff4d4f', marginLeft: 4 }}>
                      {stat.growth >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />} {Math.abs(stat.growth)}%
                    </span>
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
          <Card title="用户增长趋势" loading={loading}>
            <div style={{ height: 300 }}>
              {chartData?.userGrowth && (
                <Line data={chartData.userGrowth} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="用户构成" loading={loading}>
            <div style={{ height: 300 }}>
              {chartData?.userSegments && (
                <Doughnut data={chartData.userSegments} options={pieOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="消息统计" loading={loading}>
            <div style={{ height: 300 }}>
              {chartData?.messageStats && (
                <Bar data={chartData.messageStats} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="消息类型分布" loading={loading}>
            <div style={{ height: 300 }}>
              {chartData?.messageTypes && (
                <Pie data={chartData.messageTypes} options={pieOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="收入趋势" loading={loading}>
            <div style={{ height: 300 }}>
              {chartData?.revenue && (
                <Line data={chartData.revenue} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="收入来源" loading={loading}>
            <div style={{ height: 300 }}>
              {chartData?.revenueSource && (
                <Doughnut data={chartData.revenueSource} options={pieOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 数据表格 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="用户留存率" loading={loading}>
            {data && (
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                      {data.userAnalytics.userRetention.day1}%
                    </Title>
                    <Text type="secondary">1天留存</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
                      {data.userAnalytics.userRetention.day7}%
                    </Title>
                    <Text type="secondary">7天留存</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ color: '#faad14', margin: 0 }}>
                      {data.userAnalytics.userRetention.day30}%
                    </Title>
                    <Text type="secondary">30天留存</Text>
                  </div>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="小程序分类统计" loading={loading}>
            {data && (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {data.miniAppAnalytics.categories.map((category, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{category.name}</Text>
                      <Text>{category.downloads.toLocaleString()}</Text>
                    </div>
                    <Progress 
                      percent={Math.min((category.downloads / 40000) * 100, 100)} 
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="热门频道" loading={loading}>
            <Table
              columns={channelColumns}
              dataSource={data?.messageAnalytics.popularChannels}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="消费排行榜" loading={loading}>
            <Table
              columns={spenderColumns}
              dataSource={data?.revenueAnalytics.topSpenders}
              rowKey="username"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Analytics
