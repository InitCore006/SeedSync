import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@lib/utils'

interface Step {
  number: number
  title: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      {/* Desktop Version */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                  step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : step.number === currentStep
                    ? 'bg-navy-800 text-white ring-4 ring-navy-200'
                    : 'bg-neutral-200 text-neutral-500'
                )}
              >
                {step.number < currentStep ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.number <= currentStep ? 'text-navy-900' : 'text-neutral-500'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-neutral-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-4 transition-all duration-300',
                  step.number < currentStep ? 'bg-green-600' : 'bg-neutral-200'
                )}
                style={{ marginTop: '-2.5rem' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Version */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-navy-900">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-neutral-600">
            {steps.find((s) => s.number === currentStep)?.title}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-navy-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}