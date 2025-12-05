import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  className?: string;
}

export default function Alert({ type = 'info', title, message, className }: AlertProps) {
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
  };
  
  const { bg, border, text, icon: Icon, iconColor } = config[type];
  
  return (
    <div className={cn('rounded-lg border p-4', bg, border, className)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 shrink-0', iconColor)} />
        <div className="flex-1">
          {title && (
            <h3 className={cn('font-medium mb-1', text)}>{title}</h3>
          )}
          <p className={cn('text-sm', text)}>{message}</p>
        </div>
      </div>
    </div>
  );
}
