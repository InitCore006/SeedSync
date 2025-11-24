import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/common/Button'
import { Card, CardContent } from '@components/common/Card'
import {
  Users,
  Building2,
  Store,
  Truck,
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  ArrowRight,
  Package,
  Factory,
  Wheat,
} from 'lucide-react'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  
  // Live counter animation
  const [counters, setCounters] = useState({
    production: 42.61,
    fpos: 1247,
    processors: 589,
    lots: 12456,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        production: prev.production + (Math.random() * 0.01),
        fpos: prev.fpos + Math.floor(Math.random() * 2),
        processors: prev.processors + Math.floor(Math.random() * 2),
        lots: prev.lots + Math.floor(Math.random() * 5),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Transparent',
      description: 'End-to-end encryption and blockchain traceability',
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Easy to Use',
      description: 'Intuitive interface for all stakeholders',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Real-time Analytics',
      description: 'Track inventory and supply chain metrics',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Market Insights',
      description: 'Price trends and market intelligence',
    },
  ]

  const stakeholders = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'FPO & Cooperatives',
      description: 'Manage members, procurement, and sales',
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: 'Processors',
      description: 'Procurement and inventory management',
    },
    {
      icon: <Store className="h-8 w-8" />,
      title: 'Retailers',
      description: 'Track products from farm to shelf',
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Logistics',
      description: 'Route optimization and deliveries',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Headlines */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white/90 leading-tight">
                  आत्मनिर्भर भारत का तिलहन मिशन
                </h1>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Empowering India's
                  <br />
                  <span className="text-tangerine-400">Oilseed Self-Reliance</span>
                </h2>
              </div>

              {/* Subheadline */}
              <p className="text-lg text-slate-200">
                Seamless Farm-to-Fork Integration with AI & Blockchain Technology
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-white text-navy-800 hover:bg-slate-100 font-semibold"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-tangerine-500 text-white hover:bg-tangerine-600 font-semibold"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Register Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Additional Info */}
              <p className="text-sm text-slate-400">
                For FPO, Processor, Retailer & Logistics Partners
              </p>
            </div>

            {/* Right Content - Live Stats */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white">Live Dashboard</h3>
                  <p className="text-xs text-slate-300">Real-time mission statistics</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Production */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Wheat className="h-5 w-5 text-tangerine-400" />
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {counters.production.toFixed(2)} MT
                    </p>
                    <p className="text-xs text-slate-300 uppercase tracking-wide">
                      Production
                    </p>
                  </div>

                  {/* Registered FPOs */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {counters.fpos.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-300 uppercase tracking-wide">
                      FPOs
                    </p>
                  </div>

                  {/* Active Processors */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Factory className="h-5 w-5 text-purple-400" />
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {counters.processors.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-300 uppercase tracking-wide">
                      Processors
                    </p>
                  </div>

                  {/* Traceable Lots */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-emerald-400" />
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {counters.lots.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-300 uppercase tracking-wide">
                      Lots
                    </p>
                  </div>
                </div>

                {/* Blockchain Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Shield className="h-3 w-3" />
                  <span>Secured with Blockchain</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Live Stats */}
          <div className="lg:hidden mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-tangerine-400">{counters.production.toFixed(2)} MT</p>
                  <p className="text-xs text-slate-300">Production</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-400">{counters.fpos.toLocaleString()}</p>
                  <p className="text-xs text-slate-300">FPOs</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-400">{counters.processors.toLocaleString()}</p>
                  <p className="text-xs text-slate-300">Processors</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-400">{counters.lots.toLocaleString()}</p>
                  <p className="text-xs text-slate-300">Lots</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Why Choose SeedSync?
            </h2>
            <p className="text-base text-neutral-600 max-w-2xl mx-auto">
              Built specifically for India's oilseed supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:border-navy-300 transition-colors">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-navy-50 rounded-lg flex items-center justify-center mb-3 text-navy-700">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-navy-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Who We Serve
            </h2>
            <p className="text-base text-neutral-600 max-w-2xl mx-auto">
              Tailored solutions for every stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stakeholders.map((stakeholder, index) => (
              <Card key={index} className="border-slate-200 hover:border-navy-300 hover:shadow-md transition-all group">
                <CardContent className="p-5">
                  <div className="w-14 h-14 bg-navy-50 text-navy-700 rounded-lg flex items-center justify-center mb-3">
                    {stakeholder.icon}
                  </div>
                  <h3 className="text-base font-semibold text-navy-900 mb-1">
                    {stakeholder.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                    {stakeholder.description}
                  </p>
                  <button className="text-navy-700 font-medium text-sm hover:text-tangerine-600 flex items-center transition-colors">
                    Learn more
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base text-slate-300 mb-6">
            Join thousands of farmers, FPOs, and businesses using SeedSync
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/register')}
              className="bg-tangerine-500 hover:bg-tangerine-600 text-white font-semibold"
            >
              Register Now
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy-800 font-semibold"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}