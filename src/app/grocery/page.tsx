'use client'

import { useState, useRef, useMemo } from 'react'
import { ShoppingCart, Plus, Trash2, ScanLine } from 'lucide-react'
import { useGrocery, GROCERY_CATEGORIES, getCategoryColor } from '@/hooks/useGrocery'
import { GroceryItemRow } from '@/components/grocery/GroceryItemRow'
import { GroceryForm } from '@/components/grocery/GroceryForm'
import { GroceryItem } from '@/types'
import { toast } from 'sonner'

export default function GroceryPage() {
  const { items, isLoaded, addItem, updateItem, deleteItem, toggleCheck, clearChecked } = useGrocery()
  const [quickAdd, setQuickAdd] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)
  const quickAddRef = useRef<HTMLInputElement>(null)

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length

  // Group items by category, sorted by category order
  const grouped = useMemo(() => {
    const order = GROCERY_CATEGORIES.map(c => c.name)
    const map: Record<string, GroceryItem[]> = {}
    items.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    return order
      .filter(cat => map[cat]?.length > 0)
      .map(cat => ({ category: cat, items: map[cat], color: getCategoryColor(cat) }))
  }, [items])

  function handleQuickAdd() {
    const name = quickAdd.trim()
    if (!name) return
    addItem({ name, quantity: 1, unit: 'pcs', category: 'Other' })
    setQuickAdd('')
    toast.success(`Added "${name}" to grocery list`)
    quickAddRef.current?.focus()
  }

  function handleQuickAddKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleQuickAdd()
  }

  function handleFormSave(data: Omit<GroceryItem, 'id' | 'checked' | 'addedAt'>) {
    if (editingItem) {
      updateItem(editingItem.id, data)
      toast.success(`Updated "${data.name}"`)
    } else {
      addItem(data)
      toast.success(`Added "${data.name}" to grocery list`)
    }
    setEditingItem(null)
  }

  function openEdit(item: GroceryItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  function openAdd() {
    setEditingItem(null)
    setFormOpen(true)
  }

  function handleClearChecked() {
    if (checkedCount === 0) return
    clearChecked()
    toast.success(`Cleared ${checkedCount} checked item${checkedCount > 1 ? 's' : ''}`)
  }

  function handleDelete(id: string) {
    const item = items.find(i => i.id === id)
    deleteItem(id)
    if (item) toast.info(`Removed "${item.name}"`)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
              boxShadow: '0 0 16px rgba(0,245,255,0.5)',
            }}
          >
            <ShoppingCart className="w-5 h-5 text-[#0a0a0f]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold uppercase tracking-widest"
              style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.7)' }}
            >
              Grocery List
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
              Plan your next shopping trip
            </p>
          </div>
        </div>

        {/* Stats + clear */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono" style={{ color: '#00f5ff', textShadow: '0 0 6px rgba(0,245,255,0.5)' }}>
            {checkedCount} <span className="text-muted-foreground font-normal">/ {totalCount} items</span>
          </span>
          {checkedCount > 0 && (
            <button
              onClick={handleClearChecked}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(255,102,0,0.12)',
                border: '1px solid rgba(255,102,0,0.35)',
                color: '#ff6600',
                textShadow: '0 0 6px rgba(255,102,0,0.5)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,102,0,0.2)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(255,102,0,0.35)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,102,0,0.12)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear checked
            </button>
          )}
        </div>
      </div>

      {/* Quick add bar */}
      <div
        className="flex gap-2 p-3 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #12121f 100%)',
          border: '1px solid #1e1e3f',
        }}
      >
        <input
          ref={quickAddRef}
          type="text"
          placeholder="Quick add — type an item and press Enter..."
          value={quickAdd}
          onChange={e => setQuickAdd(e.target.value)}
          onKeyDown={handleQuickAddKey}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-1"
        />
        <button
          onClick={handleQuickAdd}
          disabled={!quickAdd.trim()}
          className="px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
            color: '#0a0a0f',
            boxShadow: '0 0 10px rgba(0,245,255,0.35)',
          }}
          onMouseEnter={e => {
            if (quickAdd.trim())
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(0,245,255,0.6)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 10px rgba(0,245,255,0.35)'
          }}
        >
          Add
        </button>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium uppercase tracking-wider transition-all text-muted-foreground hover:text-[#00f5ff]"
          style={{ border: '1px solid #1e1e3f' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,245,255,0.35)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px rgba(0,245,255,0.15)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e3f'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
          }}
          title="Add item with details"
        >
          <ScanLine className="w-3.5 h-3.5" />
          Details
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-4"
          style={{
            background: 'linear-gradient(135deg, #0d0d1a 0%, #12121f 100%)',
            border: '1px dashed #1e1e3f',
          }}
        >
          <ShoppingCart
            className="w-12 h-12"
            style={{ color: '#1e1e3f', filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.1))' }}
          />
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Your list is empty
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Type an item above or click Details to get started
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: '#00f5ff',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.18)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 14px rgba(0,245,255,0.25)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.1)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <Plus className="w-4 h-4" />
            Add first item
          </button>
        </div>
      )}

      {/* Grouped list */}
      {grouped.length > 0 && (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.category} className="space-y-2">
              {/* Category header */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: group.color, boxShadow: `0 0 6px ${group.color}` }}
                />
                <h2
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: group.color, textShadow: `0 0 8px ${group.color}80` }}
                >
                  {group.category}
                </h2>
                <span className="text-xs text-muted-foreground/60 font-mono">
                  ({group.items.length})
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: `linear-gradient(90deg, ${group.color}40, transparent)` }}
                />
              </div>

              {/* Items */}
              <div className="space-y-1.5 pl-1">
                {group.items.map(item => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggle={toggleCheck}
                    onDelete={handleDelete}
                    onEdit={openEdit}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Bottom add button */}
          <button
            onClick={openAdd}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-all text-muted-foreground hover:text-[#00f5ff]"
            style={{ border: '1px dashed #1e1e3f' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,245,255,0.3)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.04)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e3f'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <Plus className="w-4 h-4" />
            Add another item
          </button>
        </div>
      )}

      {/* Form dialog */}
      <GroceryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null) }}
        onSave={handleFormSave}
        editingItem={editingItem}
      />
    </div>
  )
}
