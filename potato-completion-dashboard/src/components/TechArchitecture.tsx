import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Code, Server, Smartphone, Check, X, Star, AlertTriangle } from 'lucide-react'

interface TechStackItem {
  technology: string[]
  score: number
  pros: string[]
  cons: string[]
}

interface TechArchitectureData {
  frontend: TechStackItem
  backend: TechStackItem
  crossPlatform: TechStackItem
}

interface TechArchitectureProps {
  data: TechArchitectureData
}

const TechArchitecture = ({ data }: TechArchitectureProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600'
    if (score >= 60) return 'from-yellow-500 to-yellow-600'
    if (score >= 40) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }

  // 准备雷达图数据
  const radarData = [
    {
      subject: '前端',
      score: data.frontend.score,
      fullMark: 100
    },
    {
      subject: '后端',
      score: data.backend.score,
      fullMark: 100
    },
    {
      subject: '跨平台',
      score: data.crossPlatform.score,
      fullMark: 100
    }
  ]

  // 准备条形图数据
  const barData = [
    { name: '前端', score: data.frontend.score, category: 'frontend' },
    { name: '后端', score: data.backend.score, category: 'backend' },
    { name: '跨平台', score: data.crossPlatform.score, category: 'crossPlatform' }
  ]

  const architectureComponents = [
    {
      title: '前端架构',
      icon: Code,
      data: data.frontend,
      color: 'blue',
      description: 'Web前端技术栈和实现质量'
    },
    {
      title: '后端架构',
      icon: Server,
      data: data.backend,
      color: 'green',
      description: '服务端技术栈和API设计'
    },
    {
      title: '跨平台架构',
      icon: Smartphone,
      data: data.crossPlatform,
      color: 'purple',
      description: '移动端和桌面端实现方案'
    }
  ]

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
              技术架构分析
            </h1>
            <p className="text-lg text-gray-600">
              前端、后端和跨平台技术栈的评估与优化建议
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/images/tech-architecture.jpeg" 
              alt="Technical Architecture"
              className="w-48 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* Architecture Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {architectureComponents.map((component, index) => (
          <motion.div
            key={component.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${component.color}-100`}>
                  <component.icon className={`w-6 h-6 text-${component.color}-600`} />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{component.title}</h3>
                  <p className="text-sm text-gray-600">{component.description}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(component.data.score)}`}>
                <span className={`text-2xl font-bold ${getScoreColor(component.data.score)}`}>
                  {component.data.score}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${component.data.score}%` }}
                transition={{ delay: 0.5 + index * 0.2, duration: 1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(component.data.score)}`}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">技术栈:</p>
              <div className="flex flex-wrap gap-1">
                {component.data.technology.map((tech, techIndex) => (
                  <span 
                    key={techIndex}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${component.color}-100 text-${component.color}-800`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 gap-6">
        {architectureComponents.map((component, index) => (
          <motion.div
            key={`${component.title}-detail`}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-full bg-${component.color}-100 mr-4`}>
                <component.icon className={`w-6 h-6 text-${component.color}-600`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{component.title}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600 mr-2">评分:</span>
                  <span className={`text-lg font-bold ${getScoreColor(component.data.score)}`}>
                    {component.data.score}/100
                  </span>
                  <div className="ml-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(component.data.score / 20) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pros */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  优势
                </h4>
                <ul className="space-y-2">
                  {component.data.pros.map((pro, proIndex) => (
                    <li key={proIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-sm text-gray-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Cons */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <X className="w-5 h-5 text-red-600 mr-2" />
                  问题
                </h4>
                <ul className="space-y-2">
                  {component.data.cons.map((con, conIndex) => (
                    <li key={conIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-sm text-gray-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">技术架构雷达图</h3>
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
                name="技术评分"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip formatter={(value) => [`${value}分`, '技术评分']} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">技术评分对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}分`, '技术评分']}
                labelFormatter={(label) => `架构: ${label}`}
              />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Architecture Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
          架构优化建议
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Code className="w-4 h-4 text-blue-600 mr-2" />
              前端优化
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 减少对演示数据的依赖</li>
              <li>• 改善与后端的集成</li>
              <li>• 增加错误处理机制</li>
              <li>• 优化组件可复用性</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Server className="w-4 h-4 text-green-600 mr-2" />
              后端重构
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 引入数据库和ORM</li>
              <li>• 实现模块化架构</li>
              <li>• 增强安全性措施</li>
              <li>• 完善API文档</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Smartphone className="w-4 h-4 text-purple-600 mr-2" />
              跨平台增强
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 深化原生功能集成</li>
              <li>• 优化性能表现</li>
              <li>• 实现推送通知</li>
              <li>• 增加平台特定功能</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Overall Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">整体技术评估</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">技术栈现状</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">前端现代化程度</span>
                <span className="text-sm font-medium text-green-600">优秀</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">后端成熟度</span>
                <span className="text-sm font-medium text-red-600">不足</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">跨平台方案</span>
                <span className="text-sm font-medium text-yellow-600">一般</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">整体架构</span>
                <span className="text-sm font-medium text-orange-600">需改进</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">关键指标</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">技术债务等级</span>
                <span className="text-sm font-medium text-red-600">高</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">可维护性</span>
                <span className="text-sm font-medium text-yellow-600">中等</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">扩展性</span>
                <span className="text-sm font-medium text-yellow-600">中等</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">安全性</span>
                <span className="text-sm font-medium text-red-600">不足</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TechArchitecture
