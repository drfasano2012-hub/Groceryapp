import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nutrition Autopilot',
  description: 'AI-powered nutrition coaching. Know exactly what to eat next.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#050505] text-white antialiased">{children}</body>
    </html>
  )
}
