import React, { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-900 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              // Base styles
              'w-full px-4 py-2.5 text-sm font-normal text-slate-900',
              'bg-white border border-slate-300 rounded-lg',
              'appearance-none cursor-pointer',
              'transition-all duration-200',
              
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500',
              
              // Hover styles
              'hover:border-slate-400',
              
              // Disabled styles
              'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200',
              
              // Error styles
              error && 'border-error-500 focus:ring-error-500 focus:border-error-500',
              
              // Padding for icon
              'pr-10',
              
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown className="size-5" />
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-600">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'