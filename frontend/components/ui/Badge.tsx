import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status';
  status?: string;
  className?: string;
}

export default function Badge({ children, variant = 'default', status, className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  if (variant === 'status' && status) {
    return (
      <span className={cn(baseStyles, getStatusColor(status), className)}>
        {children}
      </span>
    );
  }
  
  return (
    <span className={cn(baseStyles, 'bg-primary-100 text-primary-900 border border-primary-200', className)}>
      {children}
    </span>
  );
}
