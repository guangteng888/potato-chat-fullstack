import React, { useState, useEffect } from 'react'
import { 
  Smartphone, 
  Shield, 
  Wallet, 
  MessageSquare, 
  Globe, 
  AlertTriangle,
  TrendingDown,
  Star
} from 'lucide-react'

interface AppBasicInfo {
  appName: string
  developer: string
  officialWebsite: string
  platforms: string[]
  appStoreRating: number
  totalRatings: number
  appStoreRank: number
  category: string
  googlePlayStatus: string
  currentUsers: {
    estimated: string
    note: string
  }
  websiteTraffic: {
    monthlyVisits: number
    month: string
  }
  downloadStats: {
    softonic: number
    period: string
  }
}

const OverviewDashboard: React.FC = () => {
  const [appInfo, setAppInfo] = useState<AppBasicInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/app-basic-info.json')
      .then(response => response.json())
      .then(data => {
        setAppInfo(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading app info:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!appInfo) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">无法加载应用信息</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">应用概览仪表板</h2>
        <p className="text-gray-600 text-lg">Potato Chat APP核心信息与关键指标</p>
      </div>

      {/* 基本信息卡片 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Smartphone className="h-6 w-6 mr-3 text-blue-600" />
          基本信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">应用名称</p>
            <p className="text-lg font-semibold text-gray-900">{appInfo.appName}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">开发者</p>
            <p className="text-lg font-semibold text-gray-900">{appInfo.developer}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">分类</p>
            <p className="text-lg font-semibold text-gray-900">{appInfo.category}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">官方网站</p>
            <a href={appInfo.officialWebsite} target="_blank" rel="noopener noreferrer" 
               className="text-lg font-semibold text-blue-600 hover:text-blue-800">
              {appInfo.officialWebsite}
            </a>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">支持平台</p>
            <div className="flex flex-wrap gap-2">
              {appInfo.platforms.map((platform, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 关键指标网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* App Store评分 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <span className="text-3xl font-bold text-gray-900">{appInfo.appStoreRating}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">App Store评分</h3>
          <p className="text-gray-600 text-sm">基于{appInfo.totalRatings}个评分</p>
          <p className="text-gray-500 text-xs mt-1">排名第{appInfo.appStoreRank}位</p>
        </div>

        {/* Google Play状态 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Google Play</h3>
          <p className="text-red-600 font-medium">{appInfo.googlePlayStatus}</p>
          <p className="text-gray-500 text-xs mt-1">严重影响Android用户获取</p>
        </div>

        {/* 估算用户数 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900">{appInfo.currentUsers.estimated}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">当前用户规模</h3>
          <p className="text-gray-600 text-sm">{appInfo.currentUsers.note}</p>
        </div>

        {/* 网站流量 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Globe className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{(appInfo.websiteTraffic.monthlyVisits / 1000).toFixed(0)}K</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">月访问量</h3>
          <p className="text-gray-600 text-sm">官网流量</p>
          <p className="text-gray-500 text-xs mt-1">{appInfo.websiteTraffic.month}</p>
        </div>
      </div>

      {/* 核心特色功能展示 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Shield className="h-6 w-6 mr-3 text-blue-600" />
          核心特色功能
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">即时通讯</h4>
            <p className="text-gray-600 text-sm">无限量消息、20万人大群组、音视频通话</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <Wallet className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">数字钱包</h4>
            <p className="text-gray-600 text-sm">多币种支持、原生集成、交易便捷</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">小程序生态</h4>
            <p className="text-gray-600 text-sm">无需安装、开放平台、对标微信</p>
          </div>
          
          <div className="text-center p-6 bg-orange-50 rounded-lg">
            <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">安全隐私</h4>
            <p className="text-gray-600 text-sm">端到端加密、分布式存储、数据保护</p>
          </div>
        </div>
      </div>

      {/* 下载统计 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">下载渠道表现</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-2">第三方平台下载</h4>
            <p className="text-3xl font-bold mb-2">{(appInfo.downloadStats.softonic / 1000).toFixed(1)}K</p>
            <p className="text-blue-200 text-sm">Softonic {appInfo.downloadStats.period}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-2">主要挑战</h4>
            <p className="text-blue-200 text-sm">
              • Google Play下架影响Android用户获取<br/>
              • 渠道受限导致用户增长放缓<br/>
              • 品牌信任度有待提升
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold mb-2">发展机会</h4>
            <p className="text-blue-200 text-sm">
              • Web3.0和加密货币市场增长<br/>
              • 隐私保护需求上升<br/>
              • 新兴市场数字支付需求
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewDashboard
