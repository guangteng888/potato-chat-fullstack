import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Server, Globe, Smartphone, Monitor, Settings } from 'lucide-react'

interface Module {
  module: string
  completion: number
  status: 'critical' | 'warning' | 'good'
  description: string
}

interface ModuleCompletionProps {
  data: Module[]
}

const ModuleCompletion = ({ data }: ModuleCompletionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          progress: 'bg-red-500',
          badge: 'bg-red-100 text-red-800'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          progress: 'bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      case 'good':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          progress: 'bg-green-500',
          badge: 'bg-green-100 text-green-800'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          progress: 'bg-gray-500',
          badge: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const getModuleIcon = (moduleName: string) => {
    if (moduleName.includes('后端')) return Server
    if (moduleName.includes('Web')) return Globe
    if (moduleName.includes('移动')) return Smartphone
    if (moduleName.includes('桌面')) return Monitor
    if (moduleName.includes('管理')) return Settings
    return Settings
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return '严重问题'
      case 'warning': return '需要关注'
      case 'good': return '状况良好'
      default: return '未知状态'
    }
  }

  // 准备雷达图数据
  const radarData = data.map(module => ({
    subject: module.module.split(' ')[0],
    completion: module.completion,
    fullMark: 100
  }))

  // 准备条形图数据
  const barData = data.map(module => ({
    name: module.module.split(' ')[0],
    completion: module.completion,
    status: module.status
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
              模块完成度分析
            </h1>
            <p className="text-lg text-gray-600">
              各平台和服务模块的开发进度评估
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/images/progress-chart.jpg" 
              alt="Progress Chart"
              className="w-48 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 gap-6">
        {data.map((module, index) => {
          const colors = getStatusColor(module.status)
          const Icon = getModuleIcon(module.module)
          
          return (
            <motion.div
              key={module.module}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${colors.bg} ${colors.border} border rounded-lg p-6`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-full ${colors.badge}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {module.module}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                        {getStatusLabel(module.status)}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {module.completion}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${module.completion}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                        className={`h-3 rounded-full ${colors.progress}`}
                      />
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    {module.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">模块完成度对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip 
                formatter={(value) => [`${value}%`, '完成度']}
                labelFormatter={(label) => `模块: ${label}`}
              />
              <Bar 
                dataKey="completion" 
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">整体发展雷达图</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" className="text-sm" />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={false}
              />
              <Radar
                name="完成度"
                dataKey="completion"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip formatter={(value) => [`${value}%`, '完成度']} />
            </RadarChart>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">模块状态统计</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical Modules */}
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-red-600">
                {data.filter(m => m.status === 'critical').length}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">严重问题模块</h4>
            <p className="text-sm text-gray-600 mt-1">需要立即关注和修复</p>
          </div>

          {/* Warning Modules */}
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-yellow-600">
                {data.filter(m => m.status === 'warning').length}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">需要改进模块</h4>
            <p className="text-sm text-gray-600 mt-1">存在一些需要优化的问题</p>
          </div>

          {/* Good Modules */}
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">
                {data.filter(m => m.status === 'good').length}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">状况良好模块</h4>
            <p className="text-sm text-gray-600 mt-1">开发进度符合预期</p>
          </div>
        </div>

        {/* Average Completion */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">平均完成度</p>
            <p className="text-4xl font-bold text-gray-900">
              {Math.round(data.reduce((acc, module) => acc + module.completion, 0) / data.length)}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ModuleCompletion
