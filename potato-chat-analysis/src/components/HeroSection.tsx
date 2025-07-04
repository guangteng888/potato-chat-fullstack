import React from 'react'
import { Star, Download, Users, TrendingDown } from 'lucide-react'

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">P</span>
              </div>
              <span className="text-blue-200">专业分析报告</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Potato Chat APP
              <span className="block text-3xl lg:text-4xl text-blue-200 mt-2">
                全面分析与项目解析
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              深入分析即时通讯应用Potato Chat的技术架构、商业模式、市场表现与竞争地位，
              为您呈现完整的项目洞察与发展趋势预测。
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm text-blue-200">开发者</span>
                <p className="font-semibold">HorseMen Technologies SA</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm text-blue-200">分析时间</span>
                <p className="font-semibold">2025年6月</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Star className="h-8 w-8 text-yellow-400" />
                <span className="text-3xl font-bold">3.1</span>
              </div>
              <h3 className="font-semibold mb-2">App Store评分</h3>
              <p className="text-blue-200 text-sm">基于899个评分</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Download className="h-8 w-8 text-green-400" />
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2">Google Play</h3>
              <p className="text-blue-200 text-sm">已下架</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-purple-400" />
                <span className="text-3xl font-bold">~10M</span>
              </div>
              <h3 className="font-semibold mb-2">估算用户数</h3>
              <p className="text-blue-200 text-sm">相比高峰期大幅下降</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <TrendingDown className="h-8 w-8 text-orange-400" />
                <span className="text-3xl font-bold">169K</span>
              </div>
              <h3 className="font-semibold mb-2">月访问量</h3>
              <p className="text-blue-200 text-sm">官网流量 (2025年5月)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
