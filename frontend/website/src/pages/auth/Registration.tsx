/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { StepIndicator } from '@components/shared/StepIndicator'
import { Step1 } from '@components/registration/FPORegistration/Step1'
import { Step2 } from '@components/registration/FPORegistration/Step2'
import { Step3 } from '@components/registration/FPORegistration/Step3'
import { Step4 } from '@components/registration/FPORegistration/Step4'
import { useRegistration } from '@hooks/useRegistration'
import { fpoRegistrationAPI } from '@lib/api'
import toast from 'react-hot-toast'
import { RegistrationTypeSelector } from '@components/auth/RegistrationTypeSelector'

const steps = [
  { number: 1, title: 'Organization', description: 'Basic details' },
  { number: 2, title: 'Location', description: 'Coverage area' },
  { number: 3, title: 'Infrastructure', description: 'Storage & transport' },
  { number: 4, title: 'Verification', description: 'Documents & account' },
]

export const Registration: React.FC = () => {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const {
    currentStep,
    formData,
    isSubmitting,
    submitStep,
    goToNextStep,
    goToPreviousStep,
    resetRegistration,
  } = useRegistration()

  // If no registration type is selected, show type selector
  if (!type) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <RegistrationTypeSelector />
        </div>
      </div>
    )
  }

  // FPO Registration Flow
  if (type === 'fpo') {
    const handleStep1Submit = async (data: any) => {
      const success = await submitStep('step1', data, fpoRegistrationAPI.submitStep1)
      if (success) goToNextStep()
    }

    const handleStep2Submit = async (data: any) => {
      const success = await submitStep('step2', data, fpoRegistrationAPI.submitStep2)
      if (success) goToNextStep()
    }

    const handleStep3Submit = async (data: any) => {
      const success = await submitStep('step3', data, fpoRegistrationAPI.submitStep3)
      if (success) goToNextStep()
    }

    const handleStep4Submit = async (data: any) => {
      try {
        const formData = new FormData()
        
        // Add all form fields
        Object.keys(data).forEach((key) => {
          if (data[key] instanceof File) {
            formData.append(key, data[key])
          } else {
            formData.append(key, data[key])
          }
        })

        await fpoRegistrationAPI.submitStep4(formData)
        
        toast.success('Registration submitted successfully! You will receive a confirmation email.')
        resetRegistration()
        navigate('/registration-success')
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Registration failed')
      }
    }

    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              FPO Registration
            </h1>
            <p className="text-neutral-600">
              Complete all steps to register your organization
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Forms */}
          <div>
            {currentStep === 1 && (
              <Step1
                onNext={handleStep1Submit}
                initialData={formData.step1}
              />
            )}

            {currentStep === 2 && (
              <Step2
                onNext={handleStep2Submit}
                onBack={goToPreviousStep}
                initialData={formData.step2}
              />
            )}

            {currentStep === 3 && (
              <Step3
                onNext={handleStep3Submit}
                onBack={goToPreviousStep}
                initialData={formData.step3}
              />
            )}

            {currentStep === 4 && (
              <Step4
                onSubmit={handleStep4Submit}
                onBack={goToPreviousStep}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Other registration types can be added here
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">
          Registration Type: {type}
        </h2>
        <p className="text-neutral-600 mb-8">
          This registration flow is under development
        </p>
        <button
          onClick={() => navigate('/register')}
          className="text-navy-600 hover:text-navy-800 font-medium"
        >
          ← Back to registration types
        </button>
      </div>
    </div>
  )
}