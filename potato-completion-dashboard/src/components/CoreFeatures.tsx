import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { User, MessageSquare, Wallet, Layers, Settings, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface CoreFeature {
  feature: string
  frontend: number
  backend: number
  completion: number
  status: 'critical' | 'warning' | 'good'
  description: string
  issues: string[]
}

interface CoreFeaturesProps {
  data: CoreFeature[]
}

const CoreFeatures = ({ data }: CoreFeaturesProps) => {
  const getFeatureIcon = (featureName: string) => {
    if (featureName.includes('认证')) return User
    if (featureName.includes('聊天')) return MessageSquare
    if (featureName.includes('钱包')) return Wallet
    if (featureName.includes('小程序')) return Layers
    if (featureName.includes('设置')) return Settings
    return Settings
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500'
        }
      case 'good':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle,
          iconColor: 'text-gray-500'
        }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return '严重缺失'
      case 'warning': return '部分缺失'
      case 'good': return '基本完成'
      default: return '未知状态'
    }
  }

  // 准备前后端对比数据
  const comparisonData = data.map(feature => ({
    name: feature.feature.replace('系统', '').replace('功能', ''),
    frontend: feature.frontend,
    backend: feature.backend,
    completion: feature.completion
  }))

  // 准备整体完成度趋势数据（模拟数据，显示各功能的完成度）
  const trendData = data.map((feature, index) => ({
    step: index + 1,
    feature: feature.feature.replace('系统', '').replace('功能', ''),
    completion: feature.completion
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
              核心功能评估
            </h1>
            <p className="text-lg text-gray-600">
              用户核心功能模块的前后端实现状况分析
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/images/web-development.png" 
              alt="Web Development"
              className="w-48 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 gap-6">
        {data.map((feature, index) => {
          const colors = getStatusColor(feature.status)
          const FeatureIcon = getFeatureIcon(feature.feature)
          const StatusIcon = colors.icon
          
          return (
            <motion.div
              key={feature.feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${colors.bg} ${colors.border} border rounded-lg p-6`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-sm">
                  <FeatureIcon className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.feature}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${colors.iconColor}`} />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                        {getStatusLabel(feature.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">前端实现</span>
                        <span className="text-sm text-gray-500">{feature.frontend}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${feature.frontend}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                          className="h-2 rounded-full bg-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">后端实现</span>
                        <span className="text-sm text-gray-500">{feature.backend}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${feature.backend}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                          className="h-2 rounded-full bg-green-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">整体完成度</span>
                        <span className="text-sm font-bold text-gray-900">{feature.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${feature.completion}%` }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 1 }}
                          className={`h-3 rounded-full ${
                            feature.completion >= 70 ? 'bg-green-500' :
                            feature.completion >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">
                    {feature.description}
                  </p>
                  
                  {/* Issues */}
                  {feature.issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">发现的问题:</h4>
                      <ul className="space-y-1">
                        {feature.issues.map((issue, issueIndex) => (
                          <li key={issueIndex} className="flex items-start space-x-2">
                            <span className="text-red-500 text-xs mt-1">●</span>
                            <span className="text-sm text-gray-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frontend vs Backend Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">前后端实现对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, name === 'frontend' ? '前端' : '后端']}
                labelFormatter={(label) => `功能: ${label}`}
              />
              <Bar dataKey="frontend" fill="#3b82f6" name="前端" />
              <Bar dataKey="backend" fill="#10b981" name="后端" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Overall Completion Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">功能完成度趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="feature"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, '完成度']}
                labelFormatter={(label) => `功能: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">功能状态统计</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Critical Features */}
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-red-600">
                {data.filter(f => f.status === 'critical').length}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">严重缺失</h4>
            <p className="text-sm text-gray-600 mt-1">需要立即开发</p>
          </div>

          {/* Warning Features */}
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-yellow-600">
                {data.filter(f => f.status === 'warning').length}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">部分缺失</h4>
            <p className="text-sm text-gray-600 mt-1">需要完善实现</p>
          </div>

          {/* Good Features */}
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">
                {data.filter(f => f.status === 'good').length}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">基本完成</h4>
            <p className="text-sm text-gray-600 mt-1">功能可用</p>
          </div>

          {/* Average Completion */}
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(data.reduce((acc, feature) => acc + feature.completion, 0) / data.length)}%
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">平均完成度</h4>
            <p className="text-sm text-gray-600 mt-1">整体进度</p>
          </div>
        </div>

        {/* Frontend vs Backend Average */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">前端平均完成度</p>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(data.reduce((acc, feature) => acc + feature.frontend, 0) / data.length)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">后端平均完成度</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(data.reduce((acc, feature) => acc + feature.backend, 0) / data.length)}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CoreFeatures
