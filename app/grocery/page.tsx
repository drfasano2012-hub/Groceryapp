'use client'

import { useEffect, useState, useCallback } from 'react'
import { BottomNav } from '@/components/ui/BottomNav'
import { Card } from '@/components/ui/Card'
import type { GroceryItem, GroceryCategory } from '@/types'
import { ShoppingCart, Check } from 'lucide-react'

const CATEGORY_CONFIG: Record<GroceryCategory, { label: string; emoji: string; color: string }> = {
  produce: { label: 'Produce', emoji: '🥦', color: 'text-green-400' },
  protein: { label: 'Protein', emoji: '🥩', color: 'text-red-400' },
  dairy: { label: 'Dairy', emoji: '🥛', color: 'text-blue-300' },
  frozen: { label: 'Frozen', emoji: '🧊', color: 'text-cyan-400' },
  pantry: { label: 'Pantry', emoji: '🫙', color: 'text-amber-400' },
}

const CATEGORY_ORDER: GroceryCategory[] = ['produce', 'protein', 'dairy', 'frozen', 'pantry']

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async (profileId: string) => {
    const res = await fetch(`/api/grocery?profileId=${profileId}`)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const profileId = localStorage.getItem('profileId')
    if (profileId) fetchItems(profileId)
  }, [fetchItems])

  const toggleItem = async (item: GroceryItem) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i))
    )
    await fetch('/api/grocery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, checked: !item.checked }),
    })
  }

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat)
      return acc
    },
    {} as Record<GroceryCategory, GroceryItem[]>
  )

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] page-bottom">
      <div className="max-w-md mx-auto px-4 pt-12 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Grocery List</h1>
            <p className="text-white/40 text-sm mt-1">This week&apos;s ingredients</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">{checkedCount}/{totalCount}</div>
            <div className="text-xs text-white/40">checked</div>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {totalCount === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Your grocery list will appear here</p>
            <p className="text-white/25 text-sm mt-1">after your meal plan is generated.</p>
          </div>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const catItems = grouped[cat]
            if (catItems.length === 0) return null
            const config = CATEGORY_CONFIG[cat]

            return (
              <Card key={cat} className="overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.emoji}</span>
                    <span className={`font-semibold ${config.color}`}>{config.label}</span>
                    <span className="ml-auto text-xs text-white/40">
                      {catItems.filter((i) => i.checked).length}/{catItems.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {catItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.checked
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/30'
                        }`}
                      >
                        {item.checked && <Check size={12} className="text-white" />}
                      </div>
                      <span
                        className={`flex-1 text-sm transition-all ${
                          item.checked ? 'line-through text-white/30' : 'text-white/80'
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-white/30">{item.quantity}</span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
