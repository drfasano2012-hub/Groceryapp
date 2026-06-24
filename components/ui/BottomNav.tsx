'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ShoppingCart, MessageCircle, BarChart2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/timeline', icon: Calendar, label: 'Today' },
  { href: '/grocery', icon: ShoppingCart, label: 'Grocery' },
  { href: '/coach', icon: MessageCircle, label: 'Coach' },
  { href: '/dashboard', icon: BarChart2, label: 'Stats' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200',
                active ? 'text-green-400' : 'text-white/40 hover:text-white/70'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
