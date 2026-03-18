'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { Zap } from 'lucide-react'

interface QuickAddProps {
  open: boolean
  onClose: () => void
}

export function QuickAdd({ open, onClose }: QuickAddProps) {
  const { addChore, categories } = useChoresContext()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !category) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    addChore({
      name: name.trim(),
      category,
      priority,
      recurrence,
      nextDue: recurrence !== 'none' ? today.toISOString() : undefined,
    })

    setName('')
    setCategory('')
    setPriority('medium')
    setRecurrence('none')
    onClose()
  }

  const inputClass = "bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] focus:shadow-[0_0_8px_rgba(0,245,255,0.2)] transition-all placeholder:text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        className="max-w-sm"
        style={{
          background: 'linear-gradient(135deg, #0a0a18 0%, #0d0d1a 100%)',
          border: '1px solid #1e1e3f',
          boxShadow: '0 0 40px rgba(0,245,255,0.12), 0 0 80px rgba(0,0,0,0.8)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-lg"
          style={{ background: 'linear-gradient(90deg, #00f5ff, #bf00ff, #00f5ff)' }}
        />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase tracking-widest text-sm font-bold" style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.6)' }}>
            <Zap className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 4px #ffcc00)', color: '#ffcc00' }} />
            Quick Add Chore
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="quick-name" className="text-xs uppercase tracking-wider text-muted-foreground">Chore Name *</Label>
            <Input
              id="quick-name"
              placeholder="e.g. Take out trash"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category *</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Schedule</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-medium transition-all text-muted-foreground hover:text-foreground"
              style={{ border: '1px solid #1e1e3f' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !category}
              className="px-4 py-2 rounded text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
                color: '#0a0a0f',
                boxShadow: '0 0 12px rgba(0,245,255,0.4)',
              }}
              onMouseEnter={e => {
                if (!(!name.trim() || !category)) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,245,255,0.65)'
                }
              }}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,245,255,0.4)')}
            >
              Add Chore
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
