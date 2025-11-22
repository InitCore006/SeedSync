import React from 'react'
import { cn } from '@lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'navy' | 'tangerine' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const variants = {
    navy: 'badge-navy',
    tangerine: 'badge-tangerine',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    neutral: 'badge-neutral',
  }
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span
      className={cn('badge', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  )
}