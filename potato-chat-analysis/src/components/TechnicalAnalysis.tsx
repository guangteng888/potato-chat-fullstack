import React, { useState, useEffect } from 'react'
import { 
  Server, 
  Database, 
  Shield, 
  Code, 
  Layers, 
  Lock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface TechnicalData {
  protocolAnalysis: {
    name: string
    similarity: string
    advantages: string[]
    implementation: string
  }
  clientDevelopment: {
    approach: string
    platforms: string[]
    reasoning: string
  }
  databaseStructure: {
    coreDatabase: string
    type: string
    features: string[]
    securityLevel: string
  }
  dataEncoding: {
    format: string
    structure: string
    purpose: string
  }
  securityArchitecture: {
    encryptionLevels: Array<{
      type: string
      method: string
      security: string
    }>
    infrastructure: string
  }
  technicalTransparency: {
    codeTransparency: string
    documentation: string
    auditStatus: string
    score: number
  }
}

const TechnicalAnalysis: React.FC = () => {
  const [techData, setTechData] = useState<TechnicalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/technical-architecture.json')
      .then(response => response.json())
      .then(data => {
        setTechData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading technical data:', error)
        setLoading(false)
      })
  }, [])

  const getSecurityLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case '高':
        return 'text-green-600 bg-green-100'
      case '中':
      case '中等':
        return 'text-yellow-600 bg-yellow-100'
      case '低':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!techData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">无法加载技术架构数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">技术架构解析</h2>
        <p className="text-gray-600 text-lg">深度分析Potato Chat的技术实现与架构设计</p>
      </div>

      {/* 技术概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Server className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">协议</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{techData.protocolAnalysis.name}</h3>
          <p className="text-gray-600 text-sm">{techData.protocolAnalysis.similarity}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Code className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">客户端</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{techData.clientDevelopment.approach}</h3>
          <p className="text-gray-600 text-sm">{techData.clientDevelopment.platforms.length}个平台支持</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Database className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">数据库</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{techData.databaseStructure.type}</h3>
          <p className="text-gray-600 text-sm">{techData.databaseStructure.coreDatabase}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Shield className="h-8 w-8 text-orange-600" />
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              techData.technicalTransparency.score >= 70 ? 'text-green-600 bg-green-100' :
              techData.technicalTransparency.score >= 40 ? 'text-yellow-600 bg-yellow-100' :
              'text-red-600 bg-red-100'
            }`}>
              透明度
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{techData.technicalTransparency.score}分</h3>
          <p className="text-gray-600 text-sm">{techData.technicalTransparency.codeTransparency}</p>
        </div>
      </div>

      {/* MTProto协议分析 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Server className="h-8 w-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">MTProto协议分析</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">协议特点</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">协议名称: {techData.protocolAnalysis.name}</p>
                  <p className="text-gray-600 text-sm">{techData.protocolAnalysis.similarity}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">实现方式</p>
                  <p className="text-gray-600 text-sm">{techData.protocolAnalysis.implementation}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">技术优势</h4>
            <div className="space-y-3">
              {techData.protocolAnalysis.advantages.map((advantage, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 客户端开发架构 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Code className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">客户端开发架构</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">技术选型</h4>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                开发方式: {techData.clientDevelopment.approach}
              </p>
              <p className="text-gray-600">{techData.clientDevelopment.reasoning}</p>
            </div>
            
            <div className="space-y-3">
              {techData.clientDevelopment.platforms.map((platform, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">{platform}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">平台覆盖</h4>
            <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {techData.clientDevelopment.platforms.length}
              </div>
              <p className="text-gray-700 font-medium">支持平台</p>
              <p className="text-sm text-gray-600 mt-2">全平台覆盖</p>
            </div>
          </div>
        </div>
      </div>

      {/* 数据库与存储结构 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-8 w-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">数据库与存储结构</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">核心数据库</h4>
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-900">{techData.databaseStructure.coreDatabase}</h5>
                  <span className="text-sm font-medium text-purple-600 bg-white px-2 py-1 rounded">
                    {techData.databaseStructure.type}
                  </span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSecurityLevelColor(techData.databaseStructure.securityLevel)}`}>
                  {techData.databaseStructure.securityLevel}
                </div>
              </div>
              
              <div className="space-y-2">
                <h6 className="font-medium text-gray-900">数据库特性:</h6>
                {techData.databaseStructure.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">数据编码格式</h4>
            <div className="bg-blue-50 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-3">{techData.dataEncoding.format}</h5>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">结构格式:</span>
                  <p className="text-sm font-mono bg-white p-2 rounded mt-1 text-gray-800">
                    {techData.dataEncoding.structure}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">设计目的:</span>
                  <p className="text-sm text-gray-700 mt-1">{techData.dataEncoding.purpose}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 安全架构分层 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-8 w-8 text-orange-600" />
          <h3 className="text-2xl font-bold text-gray-900">安全架构分层</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techData.securityArchitecture.encryptionLevels.map((level, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h4 className="font-semibold text-gray-900 mb-3">{level.type}</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">加密方式:</span>
                    <p className="text-sm text-gray-800">{level.method}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">安全等级:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSecurityLevelColor(level.security)}`}>
                      {level.security}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">基础设施</h4>
            <p className="text-blue-800">{techData.securityArchitecture.infrastructure}</p>
          </div>
        </div>
      </div>

      {/* 技术透明度评估 */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">技术透明度评估</h3>
          <div className="text-right">
            <div className="text-4xl font-bold">{techData.technicalTransparency.score}</div>
            <div className="text-red-200">分 / 100</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-2">代码透明度</h4>
            <p className="text-red-200">{techData.technicalTransparency.codeTransparency}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-2">技术文档</h4>
            <p className="text-red-200">{techData.technicalTransparency.documentation}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-2">安全审计</h4>
            <p className="text-red-200">{techData.technicalTransparency.auditStatus}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <h4 className="font-semibold mb-2">改进建议</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>• 开源关键客户端代码</div>
            <div>• 发布详细技术文档</div>
            <div>• 进行第三方安全审计</div>
            <div>• 提供API文档和SDK</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalAnalysis
