import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Leaf,
  CheckCircle,
  Globe,
  Smartphone,
  Cloud,
  Lock,
  Building2,
  Truck,
  DollarSign,
  Package,
  MapPin,
  Target,
  Brain,
  Network,
} from 'lucide-react'

const LandingPage: React.FC = () => {
  const stats = [
    { value: '12,450', label: 'Active Farmers', suffix: '+', icon: Users },
    { value: '245', label: 'Registered FPOs', suffix: '', icon: Building2 },
    { value: '4,589', label: 'Daily Transactions', suffix: '', icon: TrendingUp },
    { value: '15', label: 'States Covered', suffix: '', icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23438602' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Content - 3 columns */}
            <div className="lg:col-span-3 space-y-10">
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-[1.1] pb-4">
                  Oilseed Value Chain
                  <span className="block text-primary-500 mt-3">AI-Enabled Digital Platform</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl">
                  A comprehensive digital infrastructure connecting farmers, FPOs, processors, and
                  markets with blockchain traceability and AI-powered insights for achieving India's
                  oilseed self-reliance under NMEO-OP mission.
                </p>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: 'Blockchain Traceability', color: 'primary' },
                  { icon: Brain, text: 'AI-Powered Advisories', color: 'primary' },
                  { icon: Network, text: 'FPO Integration', color: 'primary' },
                  { icon: TrendingUp, text: 'Market Intelligence', color: 'primary' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-4 bg-${feature.color}-50 border-2 border-${feature.color}-200 rounded-lg hover:shadow-md transition-all duration-300`}
                  >
                    <div
                      className={`w-10 h-10 bg-${feature.color}-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-bold text-${feature.color}-900`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-300 font-bold text-base"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-all duration-300 font-bold text-base"
                >
                  <span>Portal Login</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Side - Stats Dashboard - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Platform Stats */}
              <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                    Live Statistics
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 border border-success-200 rounded-full">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-success-800 font-bold uppercase">Real-time</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="p-4 bg-primary-50 to-white rounded-lg border-2 border-primary-200 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                        {stat.suffix}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 border-2 border-primary-200 rounded-full text-sm font-semibold mb-4">
              <Leaf className="w-4 h-4" />
              Platform Capabilities
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Value Chain Solutions
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              End-to-end digital infrastructure supporting every stage of the oilseed value chain
              from farm to market
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Advisories',
                description:
                  'Machine learning models for pest detection, yield prediction, weather forecasting, and price trend analysis',
                color: 'primary',
                features: ['Crop Planning', 'Pest Detection', 'Yield Forecasting', 'Price Prediction'],
              },
              {
                icon: Shield,
                title: 'Blockchain Traceability',
                description:
                  'Immutable farm-to-fork tracking with QR code verification ensuring complete transparency and food safety',
                color: 'primary',
                features: ['Batch Tracking', 'QR Verification', 'Smart Contracts', 'Audit Trail'],
              },
              {
                icon: Building2,
                title: 'FPO Management',
                description:
                  'Comprehensive tools for Farmer Producer Organizations including member management and collective marketing',
                color: 'primary',
                features: ['Member Portal', 'Procurement', 'Payments', 'Governance'],
              },
              {
                icon: TrendingUp,
                title: 'Market Intelligence',
                description:
                  'Real-time mandi prices, demand-supply analytics, and direct buyer connections for better price realization',
                color: 'primary',
                features: ['Price Trends', 'Demand Forecast', 'Market Access', 'Negotiations'],
              },
              {
                icon: Truck,
                title: 'Logistics & Supply Chain',
                description:
                  'GPS-enabled shipment tracking, route optimization, and warehouse management reducing post-harvest losses',
                color: 'primary',
                features: ['Fleet Tracking', 'Route Planning', 'Warehouse Maps', 'Delivery Status'],
              },
              {
                icon: DollarSign,
                title: 'Financial Services',
                description:
                  'Credit scoring, loan facilitation, insurance integration, and performance-based incentive calculations',
                color: 'primary',
                features: ['Credit Score', 'Loan Portal', 'Insurance', 'Subsidies'],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 bg-${feature.color}-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>

                <p className="text-gray-700 leading-relaxed mb-4">{feature.description}</p>

                <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-gray-100">
                  {feature.features.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 bg-${feature.color}-50 text-${feature.color}-700 border-2 border-${feature.color}-200 text-sm rounded-full font-semibold`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Tech Stack */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 border-2 border-primary-200 rounded-full text-sm font-semibold mb-6">
                <Cloud className="w-4 h-4" />
                Technology Infrastructure
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built on Enterprise-Grade Technology
              </h2>

              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Leveraging cutting-edge technologies to deliver scalable, secure, and reliable
                services to millions of stakeholders across India
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Brain,
                    title: 'Artificial Intelligence & ML',
                    desc: 'TensorFlow, PyTorch for pest detection, yield prediction, and price forecasting models',
                    color: 'primary',
                  },
                  {
                    icon: Shield,
                    title: 'Blockchain Integration',
                    desc: 'Hyperledger Fabric for immutable traceability and smart contract automation',
                    color: 'primary',
                  },
                  {
                    icon: Cloud,
                    title: 'Cloud Infrastructure',
                    desc: 'AWS/Azure with auto-scaling, ensuring 99.9% uptime and data redundancy',
                    color: 'primary',
                  },
                  {
                    icon: Lock,
                    title: 'Security Standards',
                    desc: 'ISO 27001, GDPR compliant, with end-to-end encryption and multi-factor authentication',
                    color: 'primary',
                  },
                  {
                    icon: Smartphone,
                    title: 'Mobile-First Design',
                    desc: 'Progressive Web Apps and native mobile support for field-level access',
                    color: 'primary',
                  },
                  {
                    icon: Globe,
                    title: 'API Integrations',
                    desc: 'Connected with Agri-Stack, eNAM, IMD Weather, ISRO Bhuvan satellite data',
                    color: 'primary',
                  },
                ].map((tech, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="shrink-0">
                      <div
                        className={`w-12 h-12 bg-${tech.color}-500 rounded-lg flex items-center justify-center shadow-md`}
                      >
                        <tech.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{tech.title}</h4>
                      <p className="text-sm text-gray-700">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Integration Diagram */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                System Architecture
              </h3>

              {/* Central Hub */}
              <div className="relative">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-32 h-32 bg-primary-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <div className="text-center text-white">
                      <Brain className="w-12 h-12 mx-auto mb-2" />
                      <div className="font-bold text-sm">SeedSync</div>
                      <div className="text-xs opacity-90">Core Platform</div>
                    </div>
                  </div>
                </div>

                {/* Connected Services */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      icon: Users,
                      label: 'Farmers & FPOs',
                      color: 'bg-primary-100 border-primary-200 text-primary-700',
                    },
                    {
                      icon: Building2,
                      label: 'Processors',
                      color: 'bg-primary-100 border-primary-200 text-primary-700',
                    },
                    {
                      icon: Package,
                      label: 'Retailers',
                      color: 'bg-primary-100 border-primary-200 text-primary-700',
                    },
                    {
                      icon: Globe,
                      label: 'Agri-Stack',
                      color: 'bg-primary-100 border-primary-200 text-primary-700',
                    },
                    {
                      icon: Cloud,
                      label: 'Weather APIs',
                      color: 'bg-primary-100 border-primary-200 text-primary-700',
                    },
                    {
                      icon: BarChart3,
                      label: 'Analytics',
                      color: 'bg-primary-100 border-primary-200 text-primary-700',
                    },
                  ].map((service, index) => (
                    <div
                      key={index}
                      className={`${service.color} p-4 rounded-xl text-center border-2 shadow-sm`}
                    >
                      <service.icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-xs font-bold">{service.label}</div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t-2 border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">15+</div>
                    <div className="text-xs text-gray-600 font-semibold">Integrations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">99.9%</div>
                    <div className="text-xs text-gray-600 font-semibold">Uptime SLA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">245ms</div>
                    <div className="text-xs text-gray-600 font-semibold">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section id="stakeholders" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 border-2 border-primary-200 rounded-full text-sm font-semibold mb-4">
              <Network className="w-4 h-4" />
              Multi-Stakeholder Platform
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Empowering Every Stakeholder
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Tailored dashboards and features for farmers, FPOs, processors, retailers, and
              government officials
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                role: 'Farmers',
                icon: Users,
                count: '12,450+',
                color: 'primary',
                features: [
                  'Mobile app with regional languages',
                  'AI crop advisories & pest alerts',
                  'Direct market access',
                  'Credit scoring & loans',
                  'FPO membership portal',
                ],
              },
              {
                role: 'FPO Members',
                icon: Building2,
                count: '245',
                color: 'primary',
                features: [
                  'Member management dashboard',
                  'Collective procurement tools',
                  'Quality grading system',
                  'Payment processing',
                  'Performance analytics',
                ],
              },
              {
                role: 'Processors',
                icon: Package,
                count: '89',
                color: 'primary',
                features: [
                  'Raw material marketplace',
                  'Quality verification',
                  'Production batch tracking',
                  'Blockchain traceability',
                  'Supplier management',
                ],
              },
              {
                role: 'Retailers & Buyers',
                icon: Truck,
                count: '340',
                color: 'primary',
                features: [
                  'Product catalog browsing',
                  'Order management',
                  'Shipment tracking',
                  'Quality certificates',
                  'Payment gateway',
                ],
              },
              {
                role: 'Government Officials',
                icon: Target,
                count: '45',
                color: 'primary',
                features: [
                  'Real-time policy dashboard',
                  'Production analytics',
                  'AI decision support',
                  'FPO performance monitoring',
                  'NMEO-OP target tracking',
                ],
              },
              {
                role: 'System Administrators',
                icon: Lock,
                count: '12',
                color: 'primary',
                features: [
                  'User management',
                  'Security monitoring',
                  'System health dashboard',
                  'API analytics',
                  'Audit logs',
                ],
              },
            ].map((stakeholder, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`p-6 bg-${stakeholder.color}-500 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <stakeholder.icon className="w-12 h-12" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stakeholder.count}</div>
                      <div className="text-sm opacity-90">Active</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{stakeholder.role}</h3>
                </div>

                <div className="p-6">
                  <ul className="space-y-3">
                    {stakeholder.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section id="impact" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 border-2 border-primary-200 rounded-full text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Measurable Impact
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Driving India's Oilseed Self-Reliance
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Contributing to the National Mission on Edible Oils - Oil Palm (NMEO-OP) goals and
              farmer prosperity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                label: 'Production Increase',
                value: '27.51 MT',
                target: '42.61 MT',
                growth: '+55%',
                period: '2014-15 to 2024-25',
                icon: TrendingUp,
                color: 'primary',
              },
              {
                label: 'Import Reduction Target',
                value: '57%',
                target: '30%',
                growth: '-27%',
                period: 'By 2030-31',
                icon: Target,
                color: 'primary',
              },
              {
                label: 'Farmer Income Boost',
                value: '₹12.4 Cr',
                target: 'Via FPOs',
                growth: '+35%',
                period: 'FY 2024-25',
                icon: DollarSign,
                color: 'primary',
              },
              {
                label: 'Post-Harvest Loss',
                value: '8.2%',
                target: '5%',
                growth: '-3.2%',
                period: 'Target Achievement',
                icon: Package,
                color: 'primary',
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 bg-${metric.color}-500 rounded-lg flex items-center justify-center mb-4 shadow-md`}
                >
                  <metric.icon className="w-6 h-6 text-white" />
                </div>

                <div className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide">
                  {metric.label}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-semibold">{metric.target}</span>
                  <span
                    className={`text-sm font-bold ${
                      metric.growth.startsWith('+') ? 'text-success-600' : 'text-warning-600'
                    }`}
                  >
                    {metric.growth}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium">{metric.period}</div>
              </div>
            ))}
          </div>

          {/* Key Achievements */}
          <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
              Platform Achievements & Milestones
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Market Efficiency',
                  stats: [
                    '15% reduction in transaction time',
                    '₹450/qtl better price realization',
                    '3,200+ verified buyer connections',
                    '89% payment cycle improvement',
                  ],
                },
                {
                  title: 'Transparency & Trust',
                  stats: [
                    '100% blockchain-verified batches',
                    '12,450+ QR codes generated',
                    'Zero tampering incidents',
                    '98% customer satisfaction',
                  ],
                },
                {
                  title: 'Operational Excellence',
                  stats: [
                    '24x7 multilingual support',
                    '99.9% platform uptime',
                    '245ms avg API response',
                    'ISO 27001 certified security',
                  ],
                },
              ].map((achievement, index) => (
                <div key={index} className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">{achievement.title}</h4>
                  <ul className="space-y-3">
                    {achievement.stats.map((stat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">{stat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Join India's Oilseed Revolution</h2>
          <p className="text-xl text-primary-100 mb-10 leading-relaxed">
            Be part of the digital transformation empowering millions of farmers and building a
            self-reliant India
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-500 rounded-lg hover:bg-primary-50 transition-all duration-300 font-bold text-lg shadow-2xl"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg hover:bg-white/20 transition-all duration-300 font-bold text-lg"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage