import React from 'react'
import { Card, CardContent } from '@components/common/Card'
import { Users, Target, Award, TrendingUp } from 'lucide-react'

export const About: React.FC = () => {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Farmer-Centric',
      description: 'Empowering farmers with technology and fair market access',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Transparency',
      description: 'Complete visibility across the entire supply chain',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality First',
      description: 'Ensuring the highest quality standards at every step',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology for growth',
    },
  ]

  const milestones = [
    { year: '2023', title: 'Platform Launch', description: 'SeedSync goes live' },
    { year: '2024', title: '5000+ FPOs', description: 'Reached 5000 registered organizations' },
    { year: '2024', title: '₹100Cr+', description: 'Transactions processed' },
    { year: '2025', title: 'Pan-India', description: 'Operations across 28 states' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">About SeedSync</h1>
            <p className="text-xl text-neutral-300 leading-relaxed">
              We are on a mission to transform India's oilseed supply chain by connecting
              farmers, FPOs, processors, and retailers on a unified digital platform that
              ensures transparency, fair pricing, and quality at every step.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Our Mission</h2>
                <p className="text-neutral-700 leading-relaxed">
                  To digitize and streamline India's oilseed supply chain, creating a
                  transparent ecosystem that benefits all stakeholders - from farmers to
                  consumers. We aim to eliminate intermediaries, reduce post-harvest losses,
                  and ensure fair prices for farmers while maintaining quality for consumers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Our Vision</h2>
                <p className="text-neutral-700 leading-relaxed">
                  To become India's leading digital platform for oilseed supply chain
                  management, setting new standards for transparency, efficiency, and
                  sustainability. We envision a future where every stakeholder has access
                  to real-time data, market insights, and growth opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-navy-700">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Our Journey</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Key milestones in our growth story
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="bg-navy-800 text-white p-6 rounded-lg">
                  <div className="text-4xl font-bold text-tangerine-400 mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-neutral-300">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Backed by Experts
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our team combines deep agricultural knowledge with cutting-edge technology
              expertise to deliver the best solutions for India's oilseed sector.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}