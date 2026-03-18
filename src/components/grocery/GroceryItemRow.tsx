'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { GroceryItem } from '@/types'
import { getCategoryColor } from '@/hooks/useGrocery'
import { cn } from '@/lib/utils'

interface GroceryItemRowProps {
  item: GroceryItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (item: GroceryItem) => void
}

export function GroceryItemRow({ item, onToggle, onDelete, onEdit }: GroceryItemRowProps) {
  const [flash, setFlash] = useState(false)
  const color = getCategoryColor(item.category)

  function handleToggle() {
    if (!item.checked) {
      setFlash(true)
      setTimeout(() => setFlash(false), 500)
    }
    onToggle(item.id)
  }

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-lg border-l-[3px] group transition-all duration-200',
        item.checked && 'opacity-40'
      )}
      style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #12121f 100%)',
        border: '1px solid #1e1e3f',
        borderLeftWidth: '3px',
        borderLeftColor: color,
      }}
    >
      {/* Neon flash overlay on check */}
      {flash && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none animate-ping"
          style={{ background: 'rgba(0,255,136,0.08)', animationDuration: '0.4s', animationIterationCount: '1' }}
        />
      )}

      {/* Check button */}
      <button
        onClick={handleToggle}
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
        style={item.checked ? {
          borderColor: '#00ff88',
          background: 'rgba(0,255,136,0.15)',
          boxShadow: '0 0 8px rgba(0,255,136,0.5)',
        } : {
          borderColor: 'rgba(255,255,255,0.2)',
        }}
        onMouseEnter={e => {
          if (!item.checked) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#00ff88'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px rgba(0,255,136,0.4)'
          }
        }}
        onMouseLeave={e => {
          if (!item.checked) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
          }
        }}
        title={item.checked ? 'Uncheck' : 'Check off'}
      >
        {item.checked && <Check className="w-3 h-3" style={{ color: '#00ff88' }} />}
      </button>

      {/* Content */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit(item)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-sm font-medium leading-tight',
              item.checked && 'line-through text-muted-foreground'
            )}
          >
            {item.name}
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: item.checked ? '#555' : color, textShadow: item.checked ? 'none' : `0 0 6px ${color}80` }}
          >
            {item.quantity} {item.unit}
          </span>
        </div>
        {item.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.notes}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-[#ff0044]"
        style={{}}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,0,68,0.12)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 6px rgba(255,0,68,0.3)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
        }}
        title="Delete item"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
