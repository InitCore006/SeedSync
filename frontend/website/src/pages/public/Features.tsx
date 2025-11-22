import React from 'react'
import { Card, CardContent } from '@components/common/Card'
import {
  Smartphone,
  Shield,
  BarChart3,
  Users,
  Package,
  Truck,
  FileText,
  Bell,
  Zap,
  Lock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Mobile-First Design',
      description: 'Access the platform anytime, anywhere from your smartphone or tablet',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Blockchain Traceability',
      description: 'Complete transparency from farm to shelf with blockchain technology',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Real-Time Analytics',
      description: 'Track inventory, sales, and market trends in real-time',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Member Management',
      description: 'Efficiently manage FPO members, farmers, and stakeholders',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Inventory Control',
      description: 'Track stock levels, quality parameters, and expiry dates',
      color: 'bg-teal-100 text-teal-700',
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Logistics Integration',
      description: 'Seamless integration with logistics partners for efficient delivery',
      color: 'bg-red-100 text-red-700',
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Digital Documentation',
      description: 'Store and manage all documents digitally with secure cloud storage',
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Smart Notifications',
      description: 'Get instant alerts for orders, payments, and important updates',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Quick Transactions',
      description: 'Fast and secure digital payments with multiple payment options',
      color: 'bg-pink-100 text-pink-700',
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Data Security',
      description: 'Bank-grade encryption to keep your data safe and secure',
      color: 'bg-cyan-100 text-cyan-700',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Quality Assurance',
      description: 'Built-in quality checks and certification management',
      color: 'bg-lime-100 text-lime-700',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Market Intelligence',
      description: 'Access to price trends, demand forecasts, and market insights',
      color: 'bg-amber-100 text-amber-700',
    },
  ]

  const keyBenefits = [
    {
      title: 'For FPOs & Cooperatives',
      benefits: [
        'Manage members and their contributions efficiently',
        'Track procurement and sales in real-time',
        'Access to digital payment solutions',
        'Generate automated reports and invoices',
      ],
    },
    {
      title: 'For Processors',
      benefits: [
        'Direct connection with FPOs for raw material sourcing',
        'Quality tracking and batch management',
        'Inventory optimization and waste reduction',
        'Compliance and certification management',
      ],
    },
    {
      title: 'For Retailers',
      benefits: [
        'Complete product traceability from farm to shelf',
        'Real-time inventory updates',
        'Direct ordering from processors',
        'Customer feedback and quality management',
      ],
    },
    {
      title: 'For Farmers',
      benefits: [
        'Fair and transparent pricing',
        'Direct market access through FPOs',
        'Digital payment receipts',
        'Market price information',
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Platform Features</h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Comprehensive tools and features designed specifically for India's oilseed
            supply chain ecosystem
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Powerful features to streamline your operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits by Stakeholder */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Tailored features for each stakeholder in the supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyBenefits.map((stakeholder, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-navy-900 mb-6">
                    {stakeholder.title}
                  </h3>
                  <ul className="space-y-3">
                    {stakeholder.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of organizations already using SeedSync
          </p>
          <button className="bg-tangerine-500 hover:bg-tangerine-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Register Your Organization
          </button>
        </div>
      </section>
    </div>
  )
}