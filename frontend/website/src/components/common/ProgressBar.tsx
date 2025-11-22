import React from 'react'
import { cn } from '@lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'navy' | 'tangerine' | 'success'
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'navy',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const variants = {
    navy: 'bg-navy-600',
    tangerine: 'bg-tangerine-500',
    success: 'bg-green-600',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-neutral-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full transition-all duration-300 rounded-full', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showLabel && (
        <p className="text-sm text-neutral-600 mt-1 text-right">
          {percentage.toFixed(0)}%
        </p>
      )}
    </div>
  )
}