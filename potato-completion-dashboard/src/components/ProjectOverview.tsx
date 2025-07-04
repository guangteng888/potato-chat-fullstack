import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import CountUp from 'react-countup'
import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react'

interface ProjectOverviewProps {
  data: {
    totalFeatures: number
    completedFeatures: number
    partiallyCompleted: number
    notStarted: number
    overallScore: number
    lastUpdated: string
  }
}

const ProjectOverview = ({ data }: ProjectOverviewProps) => {
  const pieData = [
    { name: '已完成', value: data.completedFeatures, color: '#10b981' },
    { name: '部分完成', value: data.partiallyCompleted, color: '#f59e0b' },
    { name: '未开始', value: data.notStarted, color: '#ef4444' },
  ]

  const progressData = [
    { category: '已完成', count: data.completedFeatures, percentage: (data.completedFeatures / data.totalFeatures) * 100 },
    { category: '部分完成', count: data.partiallyCompleted, percentage: (data.partiallyCompleted / data.totalFeatures) * 100 },
    { category: '未开始', count: data.notStarted, percentage: (data.notStarted / data.totalFeatures) * 100 },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              项目整体完成度评估
            </h1>
            <p className="text-xl text-gray-600">
              Potato Chat 多平台聊天应用开发状况报告
            </p>
            <p className="text-sm text-gray-500 mt-2">
              最后更新: {data.lastUpdated}
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/images/dashboard-analytics.jpg" 
              alt="Analytics Dashboard"
              className="w-48 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">项目整体评分</h2>
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(data.overallScore)} mb-4`}>
            <span className={`text-4xl font-bold ${getScoreColor(data.overallScore)}`}>
              <CountUp end={data.overallScore} duration={2} />%
            </span>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            基于功能完成度、代码质量、架构设计和用户体验等多维度评估的综合得分
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: '总功能数',
            value: data.totalFeatures,
            icon: Clock,
            color: 'blue',
            description: '项目规划的功能总数'
          },
          {
            title: '已完成',
            value: data.completedFeatures,
            icon: CheckCircle,
            color: 'green',
            description: '功能完整且可用'
          },
          {
            title: '部分完成',
            value: data.partiallyCompleted,
            icon: AlertTriangle,
            color: 'yellow',
            description: '有基础实现但不完整'
          },
          {
            title: '未开始',
            value: data.notStarted,
            icon: XCircle,
            color: 'red',
            description: '尚未开始开发'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-full bg-${metric.color}-100`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  <CountUp end={metric.value} duration={2} />
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">功能完成度分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">功能数量对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, '数量']}
                labelFormatter={(label) => `状态: ${label}`}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">进度总结</h3>
        <div className="space-y-4">
          {progressData.map((item, index) => (
            <div key={item.category} className="flex items-center">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm text-gray-500">{item.count} / {data.totalFeatures}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 1 + index * 0.2, duration: 1 }}
                    className={`h-2 rounded-full ${
                      item.category === '已完成' ? 'bg-green-600' :
                      item.category === '部分完成' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <span className="text-sm font-medium text-gray-900">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ProjectOverview
