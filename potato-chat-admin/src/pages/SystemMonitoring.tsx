import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Alert,
  Select,
  Badge,
  Tooltip,
  Timeline
} from 'antd'
import {
  MonitorOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  WifiOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Line, Doughnut } from 'react-chartjs-2'
import type { ColumnsType } from 'antd/es/table'
import { systemAPI } from '../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Title, Text } = Typography
const { Option } = Select

interface SystemStatus {
  uptime: number
  cpu: number
  memory: number
  storage: number
  network: {
    incoming: number
    outgoing: number
  }
  database: {
    status: 'healthy' | 'warning' | 'error'
    connections: number
    queries: number
  }
  services: {
    name: string
    status: 'running' | 'stopped' | 'error'
    uptime: number
    memory: number
    cpu: number
  }[]
}

interface LogEntry {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  source: string
  details?: any
}

const SystemMonitoring: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [logLevel, setLogLevel] = useState<string>('')
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  // 获取系统状态
  const fetchSystemStatus = async () => {
    try {
      setLoading(true)
      const response = await systemAPI.getSystemStats()
      if (response.success) {
        setSystemStatus(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取性能数据
  const fetchPerformanceData = async () => {
    try {
      const response = await systemAPI.getPerformanceMetrics('24h')
      if (response.success) {
        const data = response.data
        
        // 构建图表数据
        const hours = Array.from({ length: 24 }, (_, i) => 
          dayjs().subtract(23 - i, 'hour').format('HH:mm')
        )
        
        setPerformanceData({
          cpu: {
            labels: hours,
            datasets: [
              {
                label: 'CPU使用率',
                data: data.cpu || Array(24).fill(0),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          memory: {
            labels: hours,
            datasets: [
              {
                label: '内存使用率',
                data: data.memory || Array(24).fill(0),
                borderColor: '#52c41a',
                backgroundColor: 'rgba(82, 196, 26, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          storage: {
            labels: ['已使用', '剩余'],
            datasets: [
              {
                data: [systemStatus?.storage || 0, 100 - (systemStatus?.storage || 0)],
                backgroundColor: ['#ff4d4f', '#f0f0f0'],
                borderWidth: 0
              }
            ]
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    }
  }

  // 获取系统日志
  const fetchLogs = async () => {
    try {
      setLogsLoading(true)
      const params = {
        level: logLevel || undefined,
        page: 1,
        limit: 100
      }
      
      const response = await systemAPI.getLogs(params)
      if (response.success) {
        setLogs(response.data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
    fetchPerformanceData()
    fetchLogs()
    
    // 模拟系统告警
    setAlerts([
      {
        id: 1,
        type: 'warning',
        title: 'CPU使用率较高',
        message: 'CPU使用率持续超过80%，建议检查服务状态',
        timestamp: dayjs().subtract(5, 'minute').toISOString()
      },
      {
        id: 2,
        type: 'info',
        title: '系统自动备份完成',
        message: '数据库自动备份已完成，备份文件大小: 125MB',
        timestamp: dayjs().subtract(2, 'hour').toISOString()
      }
    ])

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchSystemStatus()
      fetchPerformanceData()
    }, 30000) // 每30秒刷新一次

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [logLevel])

  // 日志表格列定义
  const logColumns: ColumnsType<LogEntry> = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const levelConfig = {
          error: { color: 'red', text: 'ERROR' },
          warn: { color: 'orange', text: 'WARN' },
          info: { color: 'blue', text: 'INFO' },
          debug: { color: 'default', text: 'DEBUG' }
        }
        const config = levelConfig[level as keyof typeof levelConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      render: (message: string) => (
        <Text ellipsis={{ tooltip: message }}>{message}</Text>
      )
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }
  ]

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  }

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          系统监控
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchSystemStatus()
              fetchPerformanceData()
              fetchLogs()
            }}
            loading={loading}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 系统告警 */}
      {alerts.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="系统告警" size="small">
              <Timeline>
                {alerts.map(alert => (
                  <Timeline.Item
                    key={alert.id}
                    dot={
                      alert.type === 'error' ? <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> :
                      alert.type === 'warning' ? <WarningOutlined style={{ color: '#faad14' }} /> :
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    }
                  >
                    <div>
                      <Text strong>{alert.title}</Text>
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        {dayjs(alert.timestamp).fromNow()}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">{alert.message}</Text>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      )}

      {/* 系统状态概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <Statistic
                title="系统运行时间"
                value={systemStatus?.uptime || 0}
                suffix="小时"
                prefix={<DesktopOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div>
                <Text type="secondary">CPU 使用率</Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {systemStatus?.cpu || 0}%
                  </Text>
                </div>
                <Progress 
                  percent={systemStatus?.cpu || 0} 
                  showInfo={false}
                  status={systemStatus && systemStatus.cpu > 80 ? 'exception' : 'normal'}
                  strokeColor={systemStatus && systemStatus.cpu > 80 ? '#ff4d4f' : '#1890ff'}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div>
                <Text type="secondary">内存使用率</Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {systemStatus?.memory || 0}%
                  </Text>
                </div>
                <Progress 
                  percent={systemStatus?.memory || 0} 
                  showInfo={false}
                  status={systemStatus && systemStatus.memory > 85 ? 'exception' : 'normal'}
                  strokeColor={systemStatus && systemStatus.memory > 85 ? '#ff4d4f' : '#52c41a'}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div>
                <Text type="secondary">存储使用率</Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {systemStatus?.storage || 0}%
                  </Text>
                </div>
                <Progress 
                  percent={systemStatus?.storage || 0} 
                  showInfo={false}
                  status={systemStatus && systemStatus.storage > 90 ? 'exception' : 'normal'}
                  strokeColor={systemStatus && systemStatus.storage > 90 ? '#ff4d4f' : '#faad14'}
                />
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 性能图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card title="CPU使用率趋势" loading={loading}>
              <div style={{ height: 200 }}>
                {performanceData?.cpu && (
                  <Line data={performanceData.cpu} options={chartOptions} />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card title="内存使用率趋势" loading={loading}>
              <div style={{ height: 200 }}>
                {performanceData?.memory && (
                  <Line data={performanceData.memory} options={chartOptions} />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card title="存储分布" loading={loading}>
              <div style={{ height: 200 }}>
                {performanceData?.storage && (
                  <Doughnut data={performanceData.storage} options={doughnutOptions} />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 服务状态和系统日志 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card title="服务状态">
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {systemStatus?.services.map((service, index) => (
                  <div
                    key={service.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: index < systemStatus.services.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <Badge 
                          status={service.status === 'running' ? 'success' : service.status === 'stopped' ? 'default' : 'error'}
                          style={{ marginRight: 8 }}
                        />
                        <Text strong>{service.name}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        运行时间: {service.uptime}小时
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        CPU: {service.cpu}%
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        内存: {service.memory}MB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card 
              title="系统日志"
              extra={
                <Select
                  placeholder="日志级别"
                  value={logLevel}
                  onChange={setLogLevel}
                  allowClear
                  style={{ width: 120 }}
                >
                  <Option value="error">ERROR</Option>
                  <Option value="warn">WARN</Option>
                  <Option value="info">INFO</Option>
                  <Option value="debug">DEBUG</Option>
                </Select>
              }
            >
              <Table
                columns={logColumns}
                dataSource={logs}
                rowKey="id"
                loading={logsLoading}
                pagination={{
                  pageSize: 10,
                  size: 'small'
                }}
                scroll={{ y: 300 }}
                size="small"
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 数据库状态 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card title="数据库状态">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="数据库状态"
                    value={systemStatus?.database.status === 'healthy' ? '正常' : '异常'}
                    prefix={<DatabaseOutlined style={{ color: systemStatus?.database.status === 'healthy' ? '#52c41a' : '#ff4d4f' }} />}
                    valueStyle={{ color: systemStatus?.database.status === 'healthy' ? '#52c41a' : '#ff4d4f' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="活跃连接数"
                    value={systemStatus?.database.connections || 0}
                    prefix={<WifiOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="每秒查询数"
                    value={systemStatus?.database.queries || 0}
                    prefix={<MonitorOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  )
}

export default SystemMonitoring
