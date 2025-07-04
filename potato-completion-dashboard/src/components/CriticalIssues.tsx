import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Shield, Bug, Users, Database, Lock, Clock, Zap } from 'lucide-react'

interface CriticalIssue {
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  description: string
  affectedModules: string[]
}

interface CriticalIssuesProps {
  data: CriticalIssue[]
}

const CriticalIssues = ({ data }: CriticalIssuesProps) => {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: '#dc2626',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          label: '严重'
        }
      case 'high':
        return {
          color: '#ea580c',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          badgeColor: 'bg-orange-100 text-orange-800',
          icon: Shield,
          label: '高危'
        }
      case 'medium':
        return {
          color: '#ca8a04',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          icon: Bug,
          label: '中等'
        }
      case 'low':
        return {
          color: '#16a34a',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-800',
          icon: Users,
          label: '较低'
        }
      default:
        return {
          color: '#6b7280',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: Bug,
          label: '未知'
        }
    }
  }

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case 'high':
        return { color: '#dc2626', label: '高影响', icon: Zap }
      case 'medium':
        return { color: '#ca8a04', label: '中等影响', icon: Clock }
      case 'low':
        return { color: '#16a34a', label: '低影响', icon: Users }
      default:
        return { color: '#6b7280', label: '未知影响', icon: Users }
    }
  }

  const getIssueIcon = (title: string) => {
    if (title.includes('数据') || title.includes('持久化')) return Database
    if (title.includes('安全') || title.includes('认证')) return Lock
    if (title.includes('功能')) return Bug
    return AlertTriangle
  }

  // 准备饼图数据 - 按严重程度分布
  const severityData = [
    {
      name: '严重',
      value: data.filter(issue => issue.severity === 'critical').length,
      color: '#dc2626'
    },
    {
      name: '高危',
      value: data.filter(issue => issue.severity === 'high').length,
      color: '#ea580c'
    },
    {
      name: '中等',
      value: data.filter(issue => issue.severity === 'medium').length,
      color: '#ca8a04'
    },
    {
      name: '较低',
      value: data.filter(issue => issue.severity === 'low').length,
      color: '#16a34a'
    }
  ].filter(item => item.value > 0)

  // 准备影响程度数据
  const impactData = [
    {
      name: '高影响',
      value: data.filter(issue => issue.impact === 'high').length,
      color: '#dc2626'
    },
    {
      name: '中等影响',
      value: data.filter(issue => issue.impact === 'medium').length,
      color: '#ca8a04'
    },
    {
      name: '低影响',
      value: data.filter(issue => issue.impact === 'low').length,
      color: '#16a34a'
    }
  ].filter(item => item.value > 0)

  // 准备柱状图数据 - 受影响模块统计
  const moduleImpactData = data.reduce((acc: Record<string, number>, issue) => {
    issue.affectedModules.forEach(module => {
      acc[module] = (acc[module] || 0) + 1
    })
    return acc
  }, {})

  const moduleChartData = Object.entries(moduleImpactData).map(([module, count]) => ({
    module: module.replace('服务', '').replace('功能', ''),
    count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              关键问题发现
            </h1>
            <p className="text-lg text-gray-600">
              项目中发现的Bug、安全问题和用户体验问题
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/images/security-issues.png" 
              alt="Security Issues"
              className="w-48 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: '总问题数',
            value: data.length,
            icon: Bug,
            color: 'blue',
            description: '发现的所有问题'
          },
          {
            title: '严重问题',
            value: data.filter(issue => issue.severity === 'critical').length,
            icon: AlertTriangle,
            color: 'red',
            description: '需要立即修复'
          },
          {
            title: '高影响问题',
            value: data.filter(issue => issue.impact === 'high').length,
            icon: Zap,
            color: 'orange',
            description: '严重影响用户体验'
          },
          {
            title: '受影响模块',
            value: new Set(data.flatMap(issue => issue.affectedModules)).size,
            icon: Shield,
            color: 'purple',
            description: '涉及的功能模块'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Issue Cards */}
      <div className="grid grid-cols-1 gap-6">
        {data.map((issue, index) => {
          const severityConfig = getSeverityConfig(issue.severity)
          const impactConfig = getImpactConfig(issue.impact)
          const IssueIcon = getIssueIcon(issue.title)
          const SeverityIcon = severityConfig.icon
          
          return (
            <motion.div
              key={issue.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${severityConfig.bgColor} ${severityConfig.borderColor} border rounded-lg p-6`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-sm">
                  <IssueIcon className="w-6 h-6 text-red-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <SeverityIcon className={`w-5 h-5 mr-2 ${severityConfig.textColor}`} />
                      {issue.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={severityConfig.badgeColor + ' px-3 py-1 rounded-full text-xs font-medium'}>
                        {severityConfig.label}
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: impactConfig.color + '20',
                          color: impactConfig.color 
                        }}
                      >
                        {impactConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4">
                    {issue.description}
                  </p>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">受影响模块:</h4>
                    <div className="flex flex-wrap gap-2">
                      {issue.affectedModules.map((module, moduleIndex) => (
                        <span 
                          key={moduleIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">问题严重程度分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Impact Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">问题影响程度分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={impactData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {impactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Module Impact Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">各模块受影响问题数量</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={moduleChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="module" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value, '问题数量']}
              labelFormatter={(label) => `模块: ${label}`}
            />
            <Bar dataKey="count" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Priority Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-lg p-6 border border-red-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          优先修复建议
        </h3>
        
        <div className="space-y-4">
          {data
            .filter(issue => issue.severity === 'critical' || issue.impact === 'high')
            .map((issue, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{issue.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                      {getSeverityConfig(issue.severity).label}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      {getImpactConfig(issue.impact).label}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{issue.description}</p>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}

export default CriticalIssues
