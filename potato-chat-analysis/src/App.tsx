import React, { useState } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import OverviewDashboard from './components/OverviewDashboard'
import FeatureAnalysis from './components/FeatureAnalysis'
import TechnicalAnalysis from './components/TechnicalAnalysis'
import BusinessAnalysis from './components/BusinessAnalysis'
import MarketAnalysis from './components/MarketAnalysis'
import SWOTAnalysis from './components/SWOTAnalysis'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('overview')

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />
      case 'features':
        return <FeatureAnalysis />
      case 'technical':
        return <TechnicalAnalysis />
      case 'business':
        return <BusinessAnalysis />
      case 'market':
        return <MarketAnalysis />
      case 'insights':
        return <SWOTAnalysis />
      default:
        return <OverviewDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        {renderSection()}
      </main>
    </div>
  )
}

export default App
