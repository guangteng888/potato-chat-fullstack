import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Briefcase,
  PieChart
} from 'lucide-react'

interface RevenueStream {
  name: string
  percentage: number
  description: string
  color: string
}

interface MonetizationStrategy {
  approach: string
  description: string
  challenges: string[]
  opportunities: string[]
}

interface SustainabilityAnalysis {
  strengths: string[]
  weaknesses: string[]
  score: number
}

interface BusinessData {
  revenueStreams: RevenueStream[]
  monetizationStrategy: MonetizationStrategy
  sustainabilityAnalysis: SustainabilityAnalysis
}

const BusinessAnalysis: React.FC = () => {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/business-model.json')
      .then(response => response.json())
      .then(data => {
        setBusinessData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading business data:', error)
        setLoading(false)
      })
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!businessData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">无法加载商业模式数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">商业模式分析</h2>
        <p className="text-gray-600 text-lg">深入解析Potato Chat的盈利模式与商业可持续性</p>
      </div>

      {/* 收入来源分析 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <PieChart className="h-8 w-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">收入来源构成</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 收入饼图区域 */}
          <div className="space-y-6">
            {businessData.revenueStreams.map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stream.color }}
                  ></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{stream.name}</h4>
                    <p className="text-sm text-gray-600">{stream.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stream.percentage}%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${stream.percentage}%`,
                        backgroundColor: stream.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 收入分析总结 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">收入模式特点</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">多元化盈利</p>
                  <p className="text-sm text-gray-600">会员服务与数字钱包为主要收入来源</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">早期商业化</p>
                  <p className="text-sm text-gray-600">相比竞品更激进的变现策略</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">用户规模依赖</p>
                  <p className="text-sm text-gray-600">商业模式成功高度依赖用户基础</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 商业化策略 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Briefcase className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">商业化策略</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-green-900 mb-3">
                策略定位: {businessData.monetizationStrategy.approach}
              </h4>
              <p className="text-green-800">{businessData.monetizationStrategy.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 机会 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  发展机会
                </h4>
                <div className="space-y-3">
                  {businessData.monetizationStrategy.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 挑战 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  面临挑战
                </h4>
                <div className="space-y-3">
                  {businessData.monetizationStrategy.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 策略评分 */}
          <div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">策略评估</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">创新性</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">75%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">可执行性</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">60%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">风险控制</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">40%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 可持续性分析 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <h3 className="text-2xl font-bold text-gray-900">商业可持续性评估</h3>
          </div>
          <div className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreBgColor(businessData.sustainabilityAnalysis.score)} ${getScoreColor(businessData.sustainabilityAnalysis.score)}`}>
            {businessData.sustainabilityAnalysis.score}分
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 优势 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              商业优势
            </h4>
            <div className="space-y-3">
              {businessData.sustainabilityAnalysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 劣势 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              商业挑战
            </h4>
            <div className="space-y-3">
              {businessData.sustainabilityAnalysis.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 与竞品商业模式对比 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">与主要竞品商业模式对比</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-3">Potato Chat</h4>
            <p className="text-purple-200 text-sm mb-3">
              <strong>策略:</strong> 功能驱动，早期商业化
            </p>
            <div className="space-y-2 text-sm">
              <div>• 会员服务 ($4.99/月)</div>
              <div>• 数字钱包手续费</div>
              <div>• 小程序平台分成</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-3">Telegram</h4>
            <p className="text-purple-200 text-sm mb-3">
              <strong>策略:</strong> 用户驱动，稳健商业化
            </p>
            <div className="space-y-2 text-sm">
              <div>• Telegram Premium</div>
              <div>• 广告平台</div>
              <div>• TON区块链生态</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-3">WhatsApp</h4>
            <p className="text-purple-200 text-sm mb-3">
              <strong>策略:</strong> 生态整合，B2B导向
            </p>
            <div className="space-y-2 text-sm">
              <div>• 商业API服务</div>
              <div>• WhatsApp Business</div>
              <div>• Meta生态协同</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <h4 className="font-semibold mb-2">对比总结</h4>
          <p className="text-purple-200 text-sm">
            Potato Chat采用更激进的商业化策略，试图通过早期功能变现来建立竞争优势，
            但这种模式对用户规模和信任度有极高要求，与Telegram的稳健路径形成鲜明对比。
          </p>
        </div>
      </div>

      {/* 商业建议 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">商业改进建议</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">短期策略 (6-12个月)</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">专注核心通讯功能优化，提升用户体验</span>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">降低会员服务价格，扩大用户基础</span>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">加强品牌信任建设和透明度</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">长期策略 (1-3年)</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">深耕特定区域市场，建立本地化优势</span>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">构建Web3.0生态，抓住去中心化趋势</span>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">寻求合规运营，降低监管风险</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessAnalysis
