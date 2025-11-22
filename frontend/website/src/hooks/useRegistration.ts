/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRegistrationStore } from '@/stores/registrationStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const useRegistration = () => {
  const {
    currentStep,
    totalSteps,
    formData,
    isSubmitting,
    error,
    nextStep,
    previousStep,
    updateFormData,
    resetRegistration,
    setSubmitting,
    setError,
  } = useRegistrationStore()

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateStep = (data: any, schema: any): boolean => {
    try {
      schema.parse(data)
      setValidationErrors({})
      return true
    } catch (err: any) {
      const errors: Record<string, string> = {}
      err.errors?.forEach((error: any) => {
        errors[error.path[0]] = error.message
      })
      setValidationErrors(errors)
      return false
    }
  }

  const submitStep = async (
    step: string,
    data: any,
    apiCall: (data: any) => Promise<any>
  ): Promise<boolean> => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await apiCall(data)
      updateFormData(step, data)
      
      if (response.session_id) {
        useRegistrationStore.getState().setSessionId(response.session_id)
      }

      toast.success('Step completed successfully!')
      setSubmitting(false)
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit step'
      setError(errorMessage)
      toast.error(errorMessage)
      setSubmitting(false)
      return false
    }
  }

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      nextStep()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      previousStep()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return {
    currentStep,
    totalSteps,
    formData,
    isSubmitting,
    error,
    validationErrors,
    validateStep,
    submitStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    resetRegistration,
    setValidationErrors,
  }
}