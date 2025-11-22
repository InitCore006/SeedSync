import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/common/Button'
import { Card, CardContent } from '@components/common/Card'
import { CheckCircle, Mail, Clock } from 'lucide-react'

export const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              Registration Submitted Successfully!
            </h1>

            <p className="text-lg text-neutral-600 mb-8">
              Thank you for registering with SeedSync. Your application has been received 
              and is now under review by our team.
            </p>

            <div className="bg-neutral-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">
                What happens next?
              </h3>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-navy-700" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Email Confirmation</p>
                    <p className="text-sm text-neutral-600">
                      Check your inbox for a confirmation email with your application details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-navy-700" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Review Process</p>
                    <p className="text-sm text-neutral-600">
                      Our team will review your application within 2-3 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-navy-700" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Account Activation</p>
                    <p className="text-sm text-neutral-600">
                      Once approved, you'll receive login credentials to access your dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
              >
                Go to Homepage
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}