import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Store, Factory, Users, ArrowRight, CheckCircle, Shield } from 'lucide-react'


const RegisterPage: React.FC = () => {
  const navigate = useNavigate()


  const registrationTypes = [
    {
      id: 'fpo',
      icon: Users,
      title: 'FPO Registration',
      description: 'Register your Farmer Producer Organization to connect with farmers and markets',
      features: ['Member Management', 'Collective Procurement', 'Government Schemes', 'Market Linkage'],
      
      route: '/register/fpo',
      color: 'primary',
    },
    {
      id: 'retailer',
      icon: Store,
      title: 'Retailer Registration',
      description: 'Register as a buyer/retailer to source quality oilseeds directly from FPOs',
      features: ['Direct Sourcing', 'Quality Assurance', 'Competitive Pricing', 'Blockchain Traceability'],
      route: '/register/retailer',
      color: 'primary',
    },
    {
      id: 'processor',
      icon: Factory,
      title: 'Processor Registration',
      description: 'Register your processing unit to source raw materials and sell finished products',
      features: ['Raw Material Sourcing', 'Production Tracking', 'Quality Control', 'B2B Platform'],
      route: '/register/processor',
      color: 'primary',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 pb-4">
            Choose Registration Type
          </h1>
          <div className="h-1 w-64 bg-primary-500 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Select your role to begin the registration process. All registrations are verified within 24-48 hours.
          </p>
         
        </div>

        {/* Registration Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {registrationTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`bg-${type.color}-50 border-b-2 border-${type.color}-200 p-6`}>
                <div className={`w-16 h-16 bg-${type.color}-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">
                  {type.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-700 mb-2 leading-relaxed">
                  {type.description}
                </p>


                {/* Features */}
                <div className="space-y-3 mb-6">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-900 font-medium block">
                          {feature}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate(type.route)}
                  className={`w-full py-3 bg-${type.color}-500 text-white rounded-lg hover:bg-${type.color}-700 shadow-md hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center gap-2`}
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

  
        
      </div>
    </div>
  )
}

export default RegisterPage