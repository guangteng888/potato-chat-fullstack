import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Wallet, 
  Smartphone, 
  Shield, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Feature {
  category: string
  features: string[]
  score: number
}

interface SecurityAnalysis {
  advantages: string[]
  disadvantages: string[]
  overallScore: number
}

interface FeaturesData {
  coreFeatures: Feature[]
  securityAnalysis: SecurityAnalysis
}

const FeatureAnalysis: React.FC = () => {
  const [featuresData, setFeaturesData] = useState<FeaturesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/features-analysis.json')
      .then(response => response.json())
      .then(data => {
        setFeaturesData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading features data:', error)
        setLoading(false)
      })
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '即时通讯':
        return <MessageCircle className="h-6 w-6" />
      case '数字钱包':
        return <Wallet className="h-6 w-6" />
      case '小程序生态':
        return <Smartphone className="h-6 w-6" />
      case '安全隐私':
        return <Shield className="h-6 w-6" />
      case '社交功能':
        return <Users className="h-6 w-6" />
      default:
        return <MessageCircle className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!featuresData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">无法加载功能分析数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">功能分析板块</h2>
        <p className="text-gray-600 text-lg">深入解析Potato Chat各项核心功能与特性</p>
      </div>

      {/* 功能评分总览 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">功能模块评分</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 评分条形图 */}
          <div className="space-y-6">
            {featuresData.coreFeatures.map((feature, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getScoreBgColor(feature.score)}`}>
                      <div className={getScoreColor(feature.score)}>
                        {getCategoryIcon(feature.category)}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">{feature.category}</span>
                  </div>
                  <span className={`font-bold text-lg ${getScoreColor(feature.score)}`}>
                    {feature.score}分
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      feature.score >= 80 ? 'bg-green-500' :
                      feature.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${feature.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 总体功能雷达图区域 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">功能完整度分析</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">整体功能丰富度</span>
                <span className="font-semibold text-blue-600">较高</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">创新性特色</span>
                <span className="font-semibold text-green-600">中等</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">用户体验</span>
                <span className="font-semibold text-yellow-600">有待提升</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">市场竞争力</span>
                <span className="font-semibold text-red-600">相对较弱</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能详细分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuresData.coreFeatures.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getScoreBgColor(feature.score)}`}>
                  <div className={getScoreColor(feature.score)}>
                    {getCategoryIcon(feature.category)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.category}</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(feature.score)} ${getScoreColor(feature.score)}`}>
                {feature.score}分
              </div>
            </div>
            
            <div className="space-y-3">
              {feature.features.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 安全架构专项分析 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">安全架构深度评估</h3>
          <div className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreBgColor(featuresData.securityAnalysis.overallScore)} ${getScoreColor(featuresData.securityAnalysis.overallScore)}`}>
            {featuresData.securityAnalysis.overallScore}分
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 安全优势 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h4 className="text-lg font-semibold text-gray-900">安全优势</h4>
            </div>
            {featuresData.securityAnalysis.advantages.map((advantage, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{advantage}</span>
              </div>
            ))}
          </div>

          {/* 安全劣势 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h4 className="text-lg font-semibold text-gray-900">安全风险</h4>
            </div>
            {featuresData.securityAnalysis.disadvantages.map((disadvantage, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{disadvantage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 安全建议 */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">安全改进建议</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>• 默认启用端到端加密</div>
            <div>• 加强本地数据保护</div>
            <div>• 增加技术透明度</div>
            <div>• 进行第三方安全审计</div>
            <div>• 发布安全白皮书</div>
            <div>• 开源关键组件</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureAnalysis
