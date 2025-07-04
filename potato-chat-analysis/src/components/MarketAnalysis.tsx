import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Globe, 
  BarChart3, 
  Target,
  ArrowDown,
  ArrowUp,
  Minus,
  Crown,
  Award
} from 'lucide-react'

interface Competitor {
  name: string
  userBase: number
  security: number
  features: number
  marketShare: number
  usability: number
  monetization: number
  color: string
}

interface ComparisonItem {
  feature: string
  potatoChat: string
  telegram: string
  whatsapp: string
  signal: string
  wechat: string
}

interface MarketTrend {
  year: string
  users: number
  activeUsers: number
  note: string
}

interface MarketData {
  competitors: Competitor[]
  comparisonTable: ComparisonItem[]
}

interface SWOTData {
  marketTrends: MarketTrend[]
}

const MarketAnalysis: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [trendsData, setTrendsData] = useState<SWOTData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/competitor-analysis.json').then(res => res.json()),
      fetch('/data/swot-analysis.json').then(res => res.json())
    ])
      .then(([market, trends]) => {
        setMarketData(market)
        setTrendsData(trends)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading market data:', error)
        setLoading(false)
      })
  }, [])

  const getMarketPosition = (competitor: Competitor) => {
    const avgScore = (competitor.userBase + competitor.security + competitor.features + 
                     competitor.marketShare + competitor.usability + competitor.monetization) / 6
    if (avgScore >= 80) return { label: '市场领导者', color: 'text-green-600 bg-green-100', icon: Crown }
    if (avgScore >= 60) return { label: '强有力竞争者', color: 'text-blue-600 bg-blue-100', icon: Award }
    if (avgScore >= 40) return { label: '挑战者', color: 'text-yellow-600 bg-yellow-100', icon: Target }
    return { label: '小众玩家', color: 'text-red-600 bg-red-100', icon: Minus }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!marketData || !trendsData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">无法加载市场分析数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">市场分析</h2>
        <p className="text-gray-600 text-lg">竞品对比、市场定位与发展趋势深度解析</p>
      </div>

      {/* 竞品总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {marketData.competitors.map((competitor, index) => {
          const position = getMarketPosition(competitor)
          const PositionIcon = position.icon
          const avgScore = Math.round((competitor.userBase + competitor.security + competitor.features + 
                                     competitor.marketShare + competitor.usability + competitor.monetization) / 6)
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: competitor.color + '20' }}>
                  <PositionIcon className="h-8 w-8" style={{ color: competitor.color }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{competitor.name}</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${position.color} mb-3`}>
                  {position.label}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{avgScore}分</div>
                <p className="text-sm text-gray-600">综合得分</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 竞品雷达图对比 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">竞品能力雷达图</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 指标对比表 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">各维度得分对比</h4>
            {['userBase', 'security', 'features', 'marketShare', 'usability', 'monetization'].map((metric) => {
              const metricNames = {
                userBase: '用户基础',
                security: '安全性',
                features: '功能丰富度',
                marketShare: '市场份额',
                usability: '易用性',
                monetization: '商业化'
              }
              
              return (
                <div key={metric} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{metricNames[metric as keyof typeof metricNames]}</span>
                  </div>
                  <div className="space-y-1">
                    {marketData.competitors.map((competitor, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-20 text-sm text-gray-600">{competitor.name}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${competitor[metric as keyof Competitor]}%`,
                              backgroundColor: competitor.color
                            }}
                          ></div>
                        </div>
                        <div className="w-8 text-sm font-medium text-gray-700">
                          {competitor[metric as keyof Competitor]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 雷达图区域说明 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">竞争态势分析</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">市场领导者</p>
                  <p className="text-sm text-gray-600">WhatsApp、WeChat、Telegram</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">挑战者</p>
                  <p className="text-sm text-gray-600">Signal (专注安全)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Minus className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">小众玩家</p>
                  <p className="text-sm text-gray-600">Potato Chat (待突破)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/70 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Potato Chat定位</h5>
              <p className="text-sm text-gray-700">
                在激烈的市场竞争中，Potato Chat需要找到差异化定位，
                目前在加密货币集成方面有一定特色，但整体竞争力有待提升。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 用户趋势分析 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">用户规模发展趋势</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 趋势图数据 */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {trendsData.marketTrends.map((trend, index) => {
                const prevTrend = index > 0 ? trendsData.marketTrends[index - 1] : null
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 text-center">
                        <div className="font-bold text-gray-900">{trend.year}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {prevTrend && getTrendIcon(trend.users, prevTrend.users)}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {trend.users}M 用户
                          </div>
                          <div className="text-sm text-gray-600">
                            活跃: {trend.activeUsers}M
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{trend.note}</div>
                      {prevTrend && (
                        <div className={`text-xs font-medium ${
                          trend.users > prevTrend.users ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend.users > prevTrend.users ? '+' : ''}
                          {((trend.users - prevTrend.users) / prevTrend.users * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 趋势总结 */}
          <div>
            <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">趋势总结</h4>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">-83%</div>
                  <p className="text-sm text-gray-600">2020-2025用户下降</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">Google Play下架影响</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">竞争激烈</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">信任度下降</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">扭转建议</h5>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• 重建渠道分发</div>
                <div>• 提升产品质量</div>
                <div>• 加强品牌建设</div>
                <div>• 聚焦特定市场</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能对比表 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="h-8 w-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">关键特性对比</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">对比维度</th>
                <th className="text-center py-4 px-4 font-semibold text-blue-600">Potato Chat</th>
                <th className="text-center py-4 px-4 font-semibold text-cyan-600">Telegram</th>
                <th className="text-center py-4 px-4 font-semibold text-green-600">WhatsApp</th>
                <th className="text-center py-4 px-4 font-semibold text-purple-600">Signal</th>
                <th className="text-center py-4 px-4 font-semibold text-yellow-600">WeChat</th>
              </tr>
            </thead>
            <tbody>
              {marketData.comparisonTable.map((item, index) => (
                <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="py-4 px-4 font-medium text-gray-900">{item.feature}</td>
                  <td className="py-4 px-4 text-sm text-center text-gray-700">{item.potatoChat}</td>
                  <td className="py-4 px-4 text-sm text-center text-gray-700">{item.telegram}</td>
                  <td className="py-4 px-4 text-sm text-center text-gray-700">{item.whatsapp}</td>
                  <td className="py-4 px-4 text-sm text-center text-gray-700">{item.signal}</td>
                  <td className="py-4 px-4 text-sm text-center text-gray-700">{item.wechat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 市场机会与威胁 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 市场机会 */}
        <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="h-8 w-8" />
            <h3 className="text-2xl font-bold">市场机会</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">Web3.0趋势</h4>
              <p className="text-green-200 text-sm">
                去中心化应用和加密货币市场快速发展，为数字钱包集成创造机会
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">隐私需求增长</h4>
              <p className="text-green-200 text-sm">
                用户对隐私保护的关注度持续提升，为安全通讯应用提供市场空间
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">新兴市场机会</h4>
              <p className="text-green-200 text-sm">
                在传统金融服务不发达的地区，数字钱包功能可能成为差异化优势
              </p>
            </div>
          </div>
        </div>

        {/* 市场威胁 */}
        <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-8 w-8" />
            <h3 className="text-2xl font-bold">市场威胁</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">巨头垄断</h4>
              <p className="text-red-200 text-sm">
                WhatsApp、Telegram等巨头占据主要市场份额，新进入者难以突破
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">监管风险</h4>
              <p className="text-red-200 text-sm">
                加密货币业务面临严格监管审查，政策不确定性增加运营风险
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">技术债务</h4>
              <p className="text-red-200 text-sm">
                过度依赖Telegram架构可能存在技术风险，创新能力受限
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketAnalysis
