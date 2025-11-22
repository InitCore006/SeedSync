/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import type { RegistrationState } from '@/types/user'

interface RegistrationStore extends RegistrationState {
  // Actions
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  updateFormData: (step: string, data: any) => void
  resetRegistration: () => void
  setSessionId: (id: string) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (error: string | null) => void
}

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  currentStep: 1,
  totalSteps: 4,
  formData: {},
  isSubmitting: false,
  error: null,
  sessionId: undefined,

  setCurrentStep: (step: number) => {
    set({ currentStep: step, error: null })
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get()
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1, error: null })
    }
  },

  previousStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1, error: null })
    }
  },

  updateFormData: (step: string, data: any) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [step]: data,
      },
    }))
  },

  resetRegistration: () => {
    set({
      currentStep: 1,
      formData: {},
      isSubmitting: false,
      error: null,
      sessionId: undefined,
    })
  },

  setSessionId: (id: string) => {
    set({ sessionId: id })
  },

  setSubmitting: (isSubmitting: boolean) => {
    set({ isSubmitting })
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))