'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { GroceryItem } from '@/types'
import { GROCERY_CATEGORIES, GROCERY_UNITS, getCategoryColor } from '@/hooks/useGrocery'

interface GroceryFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<GroceryItem, 'id' | 'checked' | 'addedAt'>) => void
  editingItem?: GroceryItem | null
}

const inputClass =
  'bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] focus:shadow-[0_0_8px_rgba(0,245,255,0.2)] transition-all placeholder:text-muted-foreground'

export function GroceryForm({ open, onClose, onSave, editingItem }: GroceryFormProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('pcs')
  const [category, setCategory] = useState('Other')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name)
      setQuantity(String(editingItem.quantity))
      setUnit(editingItem.unit)
      setCategory(editingItem.category)
      setNotes(editingItem.notes ?? '')
    } else {
      resetForm()
    }
  }, [editingItem, open])

  function resetForm() {
    setName('')
    setQuantity('1')
    setUnit('pcs')
    setCategory('Other')
    setNotes('')
    setErrors({})
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) errs.quantity = 'Enter a valid quantity'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave({
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      category,
      notes: notes.trim() || undefined,
    })
    onClose()
    resetForm()
  }

  const catColor = getCategoryColor(category)

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, #0a0a18 0%, #0d0d1a 100%)',
          border: '1px solid #1e1e3f',
          boxShadow: '0 0 40px rgba(0,245,255,0.12), 0 0 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Top neon bar */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-lg"
          style={{ background: 'linear-gradient(90deg, #00f5ff, #00ff88, #00f5ff)' }}
        />

        <DialogHeader>
          <DialogTitle
            className="uppercase tracking-widest text-sm font-bold"
            style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.6)' }}
          >
            {editingItem ? 'Edit Item' : 'Add Grocery Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Item Name *</Label>
            <Input
              placeholder="e.g. Whole milk"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              className={`${inputClass} ${errors.name ? 'border-[#ff0044]' : ''}`}
            />
            {errors.name && <p className="text-xs" style={{ color: '#ff0044' }}>{errors.name}</p>}
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quantity *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className={`${inputClass} ${errors.quantity ? 'border-[#ff0044]' : ''}`}
              />
              {errors.quantity && <p className="text-xs" style={{ color: '#ff0044' }}>{errors.quantity}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Unit</Label>
              <Select value={unit} onValueChange={v => v && setUnit(v)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                  {GROCERY_UNITS.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={v => v && setCategory(v)}>
              <SelectTrigger
                className={inputClass}
                style={{ borderLeftColor: catColor, borderLeftWidth: '2px' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                {GROCERY_CATEGORIES.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: cat.color, boxShadow: `0 0 4px ${cat.color}` }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
            <Textarea
              placeholder="Optional notes (brand preference, etc.)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => { onClose(); resetForm() }}
            className="px-4 py-2 rounded text-sm font-medium transition-all text-muted-foreground hover:text-foreground"
            style={{ border: '1px solid #1e1e3f' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded text-sm font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
              color: '#0a0a0f',
              boxShadow: '0 0 12px rgba(0,245,255,0.4)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,245,255,0.65)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,245,255,0.4)')}
          >
            {editingItem ? 'Save Changes' : 'Add Item'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
