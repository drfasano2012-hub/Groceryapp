import { cn } from '@/utils/cn'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl',
        glow && 'ring-1 ring-green-500/30 shadow-lg shadow-green-500/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
