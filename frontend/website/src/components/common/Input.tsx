import React, { forwardRef } from 'react'
import { cn } from '@lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-900 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              // Base styles
              'w-full px-4 py-2.5 text-sm font-normal text-slate-900',
              'bg-white border border-slate-300 rounded-lg',
              'placeholder:text-slate-400',
              'transition-all duration-200',
              
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500',
              
              // Hover styles
              'hover:border-slate-400',
              
              // Disabled styles
              'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200',
              
              // Error styles
              error && 'border-error-500 focus:ring-error-500 focus:border-error-500',
              
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input'