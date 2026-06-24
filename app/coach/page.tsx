'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { BottomNav } from '@/components/ui/BottomNav'
import { Button } from '@/components/ui/Button'
import { Send } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const STARTER_PROMPTS = [
  'What should I eat for lunch?',
  'I need 40g more protein today',
  "What can I order at Chipotle?",
  "I'm traveling tomorrow",
  'What should I eat pre-workout?',
  'I skipped breakfast',
]

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const profileId = localStorage.getItem('profileId')
    if (!profileId) return

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, message: text, history: messages }),
    })
    const data = await res.json()
    setLoading(false)

    const assistantMsg: Message = {
      role: 'assistant',
      content: data.reply,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMsg])
  }

  const isEmpty = messages.length === 0

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <div className="max-w-md mx-auto w-full px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">
            🥗
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Coach Alex</h1>
            <p className="text-xs text-green-400">● Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 pb-40">
        {isEmpty ? (
          <div className="space-y-6 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm p-4 max-w-[85%]">
              <p className="text-white text-sm leading-relaxed">
                Hey! I&apos;m Coach Alex, your personal nutrition coach. I know your goals, your meal plan, and where you are today.
                <br /><br />
                Ask me anything — I give specific, actionable advice. Not generic tips.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-sm px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl text-white/70 hover:text-white transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                    🥗
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-500 text-white rounded-tr-sm'
                      : 'bg-white/8 border border-white/10 text-white rounded-tl-sm'
                  }`}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1.5' : ''}>{line}</p>
                  ))}
                  <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-green-200/60' : 'text-white/30'}`}>
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  🥗
                </div>
                <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-3xl rounded-tl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
            placeholder="Ask Coach Alex..."
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            loading={loading}
            disabled={!input.trim()}
            className="px-4 py-3 rounded-2xl"
          >
            <Send size={18} />
          </Button>
        </div>
        {/* Bottom nav spacing */}
        <div className="max-w-md mx-auto">
          <div className="h-[64px]" />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
