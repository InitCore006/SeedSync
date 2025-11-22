import React from 'react'
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
} from 'lucide-react'

export const Home: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Transparent',
      description: 'End-to-end encryption and blockchain-based traceability for complete transparency',
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Easy to Use',
      description: 'Intuitive interface designed for farmers, processors, and retailers',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Real-time Analytics',
      description: 'Track your inventory, sales, and supply chain in real-time',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Market Insights',
      description: 'Get price trends and market intelligence to make informed decisions',
    },
  ]

  const stakeholders = [
    {
      icon: <Users className="h-12 w-12" />,
      title: 'FPO & Cooperatives',
      description: 'Manage members, procurement, and sales efficiently',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: <Building2 className="h-12 w-12" />,
      title: 'Processors',
      description: 'Streamline procurement and inventory management',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      icon: <Store className="h-12 w-12" />,
      title: 'Retailers',
      description: 'Track products from farm to shelf',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: <Truck className="h-12 w-12" />,
      title: 'Logistics',
      description: 'Optimize routes and manage deliveries',
      color: 'bg-orange-100 text-orange-700',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy-900 via-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Transforming India's
                <span className="text-tangerine-400"> Oilseed Supply Chain</span>
              </h1>
              <p className="text-xl text-neutral-300 mb-8">
                Connect farmers, processors, and retailers on a unified digital platform. 
                Ensure quality, transparency, and fair prices for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => navigate('/register')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Get Started
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/features')}
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-tangerine-400">5000+</p>
                    <p className="text-sm text-neutral-300 mt-2">Registered FPOs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-tangerine-400">₹100Cr+</p>
                    <p className="text-sm text-neutral-300 mt-2">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-tangerine-400">50K+</p>
                    <p className="text-sm text-neutral-300 mt-2">Farmers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-tangerine-400">28</p>
                    <p className="text-sm text-neutral-300 mt-2">States</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Why Choose SeedSync?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Built specifically for India's oilseed supply chain with features that matter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-navy-700">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Who We Serve
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Tailored solutions for every stakeholder in the supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stakeholders.map((stakeholder, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-4 ${stakeholder.color}`}>
                    {stakeholder.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">
                    {stakeholder.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    {stakeholder.description}
                  </p>
                  <button className="text-navy-600 font-medium text-sm hover:text-tangerine-600 flex items-center transition-colors">
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of farmers, FPOs, and businesses already using SeedSync
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Register Now
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/contact')}
              className="border-2 border-white hover:bg-white hover:text-navy-800"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}