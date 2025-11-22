import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Building2, 
  Store, 
  Truck, 
  Sprout,
  ArrowRight 
} from 'lucide-react'
import { Card, CardContent } from '@components/common/Card'

interface RegistrationType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  path: string
}

const registrationTypes: RegistrationType[] = [
  {
    id: 'FPO',
    title: 'FPO / Cooperative',
    description: 'Farmer Producer Organizations and Cooperatives',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-blue-100 text-blue-700',
    path: '/register/fpo',
  },
  {
    id: 'PROCESSOR',
    title: 'Processor / Mill',
    description: 'Oil processing units and extraction mills',
    icon: <Building2 className="h-8 w-8" />,
    color: 'bg-purple-100 text-purple-700',
    path: '/register/processor',
  },
  {
    id: 'RETAILER',
    title: 'Retailer / Distributor',
    description: 'Retail outlets and distribution networks',
    icon: <Store className="h-8 w-8" />,
    color: 'bg-green-100 text-green-700',
    path: '/register/retailer',
  },
  {
    id: 'LOGISTICS',
    title: 'Logistics Partner',
    description: 'Transportation and logistics services',
    icon: <Truck className="h-8 w-8" />,
    color: 'bg-orange-100 text-orange-700',
    path: '/register/logistics',
  },
  {
    id: 'FARMER',
    title: 'Individual Farmer',
    description: 'Independent farmers and growers',
    icon: <Sprout className="h-8 w-8" />,
    color: 'bg-teal-100 text-teal-700',
    path: '/register/farmer',
  },
]

export const RegistrationTypeSelector: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-navy-900 mb-3">
          Choose Your Registration Type
        </h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Select the type that best describes your role in the oilseed supply chain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {registrationTypes.map((type) => (
          <Card
            key={type.id}
            hover
            onClick={() => navigate(type.path)}
            className="cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className={`w-16 h-16 rounded-xl ${type.color} flex items-center justify-center mb-4`}>
                {type.icon}
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                {type.title}
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                {type.description}
              </p>
              <div className="flex items-center text-navy-600 font-medium group-hover:text-tangerine-600 transition-colors">
                <span className="text-sm">Register now</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-neutral-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-navy-600 hover:text-navy-800 font-medium"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  )
}