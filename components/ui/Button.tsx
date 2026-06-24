'use client'

import { cn } from '@/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-lg shadow-green-500/25': variant === 'primary',
            'bg-white/10 hover:bg-white/20 text-white border border-white/20 focus:ring-white/30': variant === 'secondary',
            'bg-transparent hover:bg-white/10 text-white/80 focus:ring-white/30': variant === 'ghost',
            'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500': variant === 'danger',
          },
          {
            'text-sm px-3 py-2': size === 'sm',
            'text-base px-5 py-3': size === 'md',
            'text-lg px-6 py-4': size === 'lg',
            'text-xl px-8 py-5 w-full': size === 'xl',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
