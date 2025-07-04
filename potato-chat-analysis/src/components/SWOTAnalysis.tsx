import React, { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Zap,
  Shield,
  Users,
  Star
} from 'lucide-react'

interface SWOTItem {
  title: string
  description: string
}

interface SWOTData {
  swot: {
    strengths: SWOTItem[]
    weaknesses: SWOTItem[]
    opportunities: SWOTItem[]
    threats: SWOTItem[]
  }
  marketTrends: Array<{
    year: string
    users: number
    activeUsers: number
    note: string
  }>
}

const SWOTAnalysis: React.FC = () => {
  const [swotData, setSWOTData] = useState<SWOTData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/swot-analysis.json')
      .then(response => response.json())
      .then(data => {
        setSWOTData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading SWOT data:', error)
        setLoading(false)
      })
  }, [])

  const swotSections = [
    {
      title: '优势 (Strengths)',
      key: 'strengths' as const,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'from-green-500 to-emerald-600',
      lightBg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      title: '劣势 (Weaknesses)',
      key: 'weaknesses' as const,
      icon: XCircle,
      color: 'red',
      bgColor: 'from-red-500 to-rose-600',
      lightBg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      title: '机会 (Opportunities)',
      key: 'opportunities' as const,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'from-blue-500 to-cyan-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: '威胁 (Threats)',
      key: 'threats' as const,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'from-orange-500 to-amber-600',
      lightBg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!swotData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">无法加载SWOT分析数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">项目洞察</h2>
        <p className="text-gray-600 text-lg">SWOT分析、发展挑战与改进建议</p>
      </div>

      {/* SWOT矩阵 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {swotSections.map((section) => {
          const Icon = section.icon
          const items = swotData.swot[section.key]
          
          return (
            <div key={section.key} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${section.bgColor} text-white p-6`}>
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">{section.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className={`p-4 ${section.lightBg} rounded-lg border ${section.border}`}>
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-700 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* SWOT策略矩阵 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="h-8 w-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">SWOT战略矩阵</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SO策略 */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 text-green-600 mr-2" />
              SO策略 (优势+机会)
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  利用数字钱包优势，抓住Web3.0市场机会，打造加密货币生态平台
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  发挥多平台支持特色，在新兴市场建立先发优势
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  结合小程序生态与隐私需求增长，构建差异化竞争优势
                </span>
              </div>
            </div>
          </div>

          {/* WO策略 */}
          <div className="bg-gradient-to-br from-red-50 to-blue-50 rounded-lg p-6 border border-red-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              WO策略 (劣势+机会)
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  通过增加透明度和安全审计，重建用户信任，抓住隐私市场机会
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  改善用户体验，利用Web3.0趋势吸引新用户群体
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  建立多元化分发渠道，减少对单一应用商店的依赖
                </span>
              </div>
            </div>
          </div>

          {/* ST策略 */}
          <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-lg p-6 border border-orange-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-orange-600 mr-2" />
              ST策略 (优势+威胁)
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  强化安全特性，应对监管风险，确保合规运营
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  聚焦小众市场，避免与巨头直接竞争
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  利用技术优势，建立自主创新能力，减少技术依赖
                </span>
              </div>
            </div>
          </div>

          {/* WT策略 */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-gray-300">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-gray-600 mr-2" />
              WT策略 (劣势+威胁)
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  考虑战略重组或合作，寻求更强大的技术和资源支持
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  专注核心功能，避免过度扩张导致资源分散
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  建立风险管理机制，应对监管和技术风险
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 发展阶段与建议 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Star className="h-8 w-8 text-yellow-600" />
          <h3 className="text-2xl font-bold text-gray-900">分阶段发展建议</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 短期建议 */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">短期目标 (6-12个月)</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">
                  修复核心bug，提升App Store评分至4.0+
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">
                  发布技术白皮书，增加透明度
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">
                  建立多渠道分发策略
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">
                  优化数字钱包用户体验
                </span>
              </div>
            </div>
          </div>

          {/* 中期建议 */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-green-900 mb-4">中期目标 (1-2年)</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800">
                  建立小程序开发者生态
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800">
                  进行第三方安全审计
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800">
                  拓展目标区域市场
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800">
                  实现用户规模突破（达到50M）
                </span>
              </div>
            </div>
          </div>

          {/* 长期建议 */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-900 mb-4">长期愿景 (3-5年)</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-800">
                  成为Web3.0通讯领域领先平台
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-800">
                  建立自主区块链生态
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-800">
                  实现全球合规运营
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-800">
                  达到可持续盈利模式
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 总结评估 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-4">综合评估总结</h3>
          <p className="text-indigo-200 text-lg">基于SWOT分析的项目整体评价</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">6.5</div>
            <div className="text-indigo-200 mb-2">综合得分</div>
            <div className="text-sm text-indigo-300">满分10分</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 text-yellow-400">中等</div>
            <div className="text-indigo-200 mb-2">发展潜力</div>
            <div className="text-sm text-indigo-300">需要战略调整</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 text-red-400">高</div>
            <div className="text-indigo-200 mb-2">风险等级</div>
            <div className="text-sm text-indigo-300">需要谨慎管理</div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg">
          <h4 className="text-xl font-semibold mb-4">关键结论</h4>
          <p className="text-indigo-100 leading-relaxed">
            Potato Chat具有创新的产品理念和一定的技术基础，但面临激烈的市场竞争和信任危机。
            通过聚焦特定市场、提升产品质量、增加透明度和合规运营，仍有机会在细分领域获得成功。
            但需要现实地评估市场挑战，制定合理的发展预期和风险管理策略。
          </p>
        </div>
      </div>
    </div>
  )
}

export default SWOTAnalysis
