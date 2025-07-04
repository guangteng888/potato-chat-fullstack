import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Activity, BarChart3, Shield, Settings, Target, TrendingUp } from 'lucide-react'
import ProjectOverview from './components/ProjectOverview'
import ModuleCompletion from './components/ModuleCompletion'
import CoreFeatures from './components/CoreFeatures'
import CriticalIssues from './components/CriticalIssues'
import TechArchitecture from './components/TechArchitecture'
import Recommendations from './components/Recommendations'
import './App.css'

type TabType = 'overview' | 'modules' | 'features' | 'issues' | 'architecture' | 'recommendations'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/completion-analysis.json')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [])

  const tabs = [
    { id: 'overview', label: '项目概览', icon: Activity },
    { id: 'modules', label: '模块分析', icon: BarChart3 },
    { id: 'features', label: '功能评估', icon: Target },
    { id: 'issues', label: '问题发现', icon: Shield },
    { id: 'architecture', label: '技术架构', icon: Settings },
    { id: 'recommendations', label: '改进建议', icon: TrendingUp },
  ]

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!data) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-red-600">加载数据失败</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return <ProjectOverview data={data.projectOverview} />
      case 'modules':
        return <ModuleCompletion data={data.moduleCompletion} />
      case 'features':
        return <CoreFeatures data={data.coreFeatures} />
      case 'issues':
        return <CriticalIssues data={data.criticalIssues} />
      case 'architecture':
        return <TechArchitecture data={data.techArchitecture} />
      case 'recommendations':
        return <Recommendations data={data.recommendations} />
      default:
        return <ProjectOverview data={data.projectOverview} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Potato Chat 功能完成度评估
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-gray-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as TabType)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-6 sm:px-0"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
