import React, { forwardRef } from 'react'
import { cn } from '@lib/utils'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-neutral-300 text-navy-600',
              'focus:ring-2 focus:ring-navy-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
        </div>
        
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label className="text-sm font-medium text-navy-900 cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-neutral-500">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'