import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Target, Clock, TrendingUp, CheckCircle, Calendar, Users, AlertTriangle } from 'lucide-react'

interface Recommendation {
  priority: number
  title: string
  description: string
  estimatedEffort: string
  impact: 'high' | 'medium' | 'low'
}

interface RecommendationsProps {
  data: Recommendation[]
}

const Recommendations = ({ data }: RecommendationsProps) => {
  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case 'high':
        return {
          color: '#dc2626',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          label: '高影响',
          icon: TrendingUp
        }
      case 'medium':
        return {
          color: '#ca8a04',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          label: '中等影响',
          icon: Target
        }
      case 'low':
        return {
          color: '#16a34a',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          label: '低影响',
          icon: CheckCircle
        }
      default:
        return {
          color: '#6b7280',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          label: '未知影响',
          icon: Target
        }
    }
  }

  const getPriorityConfig = (priority: number) => {
    if (priority <= 2) {
      return {
        label: '紧急',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    } else if (priority <= 3) {
      return {
        label: '重要',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    } else {
      return {
        label: '一般',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    }
  }

  // 解析工作量估计（假设格式为"2-3周"）
  const parseEffort = (effort: string) => {
    const weeks = effort.match(/(\d+)-?(\d+)?周/)
    if (weeks) {
      const min = parseInt(weeks[1])
      const max = weeks[2] ? parseInt(weeks[2]) : min
      return (min + max) / 2
    }
    return 1
  }

  // 准备图表数据
  const chartData = data.map(rec => ({
    title: rec.title.length > 10 ? rec.title.substring(0, 10) + '...' : rec.title,
    fullTitle: rec.title,
    priority: rec.priority,
    effort: parseEffort(rec.estimatedEffort),
    impact: rec.impact === 'high' ? 3 : rec.impact === 'medium' ? 2 : 1
  }))

  // 准备时间线数据
  const timelineData = data
    .sort((a, b) => a.priority - b.priority)
    .map((rec, index) => {
      const effort = parseEffort(rec.estimatedEffort)
      const startWeek = index === 0 ? 0 : data.slice(0, index).reduce((sum, r) => sum + parseEffort(r.estimatedEffort), 0)
      return {
        task: rec.title.length > 15 ? rec.title.substring(0, 15) + '...' : rec.title,
        fullTitle: rec.title,
        start: startWeek,
        end: startWeek + effort,
        duration: effort,
        priority: rec.priority
      }
    })

  const totalEffort = data.reduce((sum, rec) => sum + parseEffort(rec.estimatedEffort), 0)

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
              改进建议路线图
            </h1>
            <p className="text-lg text-gray-600">
              基于分析结果的优先级修复建议和开发计划
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/images/team-improvement.webp" 
              alt="Team Improvement"
              className="w-48 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: '总建议数',
            value: data.length,
            icon: Target,
            color: 'blue',
            description: '需要实施的改进项'
          },
          {
            title: '紧急任务',
            value: data.filter(rec => rec.priority <= 2).length,
            icon: AlertTriangle,
            color: 'red',
            description: '需要立即执行'
          },
          {
            title: '预计工期',
            value: `${totalEffort}周`,
            icon: Clock,
            color: 'yellow',
            description: '全部完成时间'
          },
          {
            title: '高影响项',
            value: data.filter(rec => rec.impact === 'high').length,
            icon: TrendingUp,
            color: 'green',
            description: '显著提升项目质量'
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

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 gap-6">
        {data
          .sort((a, b) => a.priority - b.priority)
          .map((recommendation, index) => {
            const priorityConfig = getPriorityConfig(recommendation.priority)
            const impactConfig = getImpactConfig(recommendation.impact)
            const ImpactIcon = impactConfig.icon
            
            return (
              <motion.div
                key={recommendation.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${priorityConfig.bgColor} ${priorityConfig.borderColor} border rounded-lg p-6`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${priorityConfig.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {recommendation.priority}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recommendation.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                          {priorityConfig.label}
                        </span>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium flex items-center"
                          style={{ 
                            backgroundColor: impactConfig.color + '20',
                            color: impactConfig.color 
                          }}
                        >
                          <ImpactIcon className="w-3 h-3 mr-1" />
                          {impactConfig.label}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4">
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>预计工期: {recommendation.estimatedEffort}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>影响程度: {impactConfig.label}</span>
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
        {/* Priority vs Effort Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">优先级与工作量分析</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="title" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'effort' ? `${value}周` : value, 
                  name === 'effort' ? '工作量' : '优先级'
                ]}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.title === label)
                  return item ? item.fullTitle : label
                }}
              />
              <Bar dataKey="effort" fill="#3b82f6" name="工作量" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">实施时间线</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="task"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis domain={[0, totalEffort]} label={{ value: '周', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [`第${value}周`, name === 'start' ? '开始' : '结束']}
                labelFormatter={(label) => {
                  const item = timelineData.find(d => d.task === label)
                  return item ? item.fullTitle : label
                }}
              />
              <Line 
                type="monotone" 
                dataKey="start" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="开始时间"
              />
              <Line 
                type="monotone" 
                dataKey="end" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="结束时间"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Implementation Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">实施路线图</h3>
        
        <div className="space-y-6">
          {data
            .sort((a, b) => a.priority - b.priority)
            .reduce((phases: any[], rec, index) => {
              const phaseIndex = Math.floor(index / 2)
              if (!phases[phaseIndex]) {
                phases[phaseIndex] = {
                  phase: `阶段 ${phaseIndex + 1}`,
                  items: []
                }
              }
              phases[phaseIndex].items.push(rec)
              return phases
            }, [])
            .map((phase, phaseIndex) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + phaseIndex * 0.2 }}
                className="border rounded-lg p-6 bg-gray-50"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {phaseIndex + 1}
                  </div>
                  {phase.phase}
                  <span className="ml-2 text-sm text-gray-600">
                    ({phase.items.reduce((sum: number, item: any) => sum + parseEffort(item.estimatedEffort), 0)}周)
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{item.title}</h5>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {item.estimatedEffort}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Success Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 border border-green-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          预期成果
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">85%</span>
            </div>
            <h4 className="font-semibold text-gray-900">功能完成度</h4>
            <p className="text-sm text-gray-600 mt-1">实施后预期达到</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">90%</span>
            </div>
            <h4 className="font-semibold text-gray-900">代码质量</h4>
            <p className="text-sm text-gray-600 mt-1">技术债务大幅减少</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600">95%</span>
            </div>
            <h4 className="font-semibold text-gray-900">用户体验</h4>
            <p className="text-sm text-gray-600 mt-1">流畅度显著提升</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-600">80%</span>
            </div>
            <h4 className="font-semibold text-gray-900">安全性</h4>
            <p className="text-sm text-gray-600 mt-1">安全问题基本解决</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Recommendations
