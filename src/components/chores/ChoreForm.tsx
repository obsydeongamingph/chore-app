'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
import { Chore } from '@/types'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { format } from 'date-fns'

interface ChoreFormProps {
  open: boolean
  onClose: () => void
  editingChore?: Chore | null
}

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const RECURRENCES = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom interval' },
]

export function ChoreForm({ open, onClose, editingChore }: ChoreFormProps) {
  const { addChore, updateChore, categories, addCategory } = useChoresContext()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>('none')
  const [customIntervalDays, setCustomIntervalDays] = useState('7')
  const [dueDate, setDueDate] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingChore) {
      setName(editingChore.name)
      setDescription(editingChore.description ?? '')
      setCategory(editingChore.category)
      setPriority(editingChore.priority)
      setEstimatedMinutes(editingChore.estimatedMinutes?.toString() ?? '')
      setRecurrence(editingChore.recurrence)
      setCustomIntervalDays(editingChore.customIntervalDays?.toString() ?? '7')
      setDueDate(editingChore.dueDate ? format(new Date(editingChore.dueDate), 'yyyy-MM-dd') : '')
    } else {
      resetForm()
    }
  }, [editingChore, open])

  function resetForm() {
    setName('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setEstimatedMinutes('')
    setRecurrence('none')
    setCustomIntervalDays('7')
    setDueDate('')
    setNewCategory('')
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!category) newErrors.category = 'Category is required'
    if (recurrence === 'custom' && (!customIntervalDays || parseInt(customIntervalDays) < 1)) {
      newErrors.customIntervalDays = 'Must be at least 1 day'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const choreData = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      recurrence,
      customIntervalDays: recurrence === 'custom' ? parseInt(customIntervalDays) : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      nextDue: dueDate ? new Date(dueDate).toISOString() : recurrence !== 'none' ? today.toISOString() : undefined,
      lastCompleted: editingChore?.lastCompleted,
    }

    if (editingChore) {
      updateChore(editingChore.id, choreData)
    } else {
      addChore(choreData)
    }

    onClose()
    resetForm()
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    addCategory(trimmed)
    setCategory(trimmed)
    setNewCategory('')
  }

  const inputClass = "bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] focus:shadow-[0_0_8px_rgba(0,245,255,0.2)] transition-all placeholder:text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
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
          <DialogTitle
            className="uppercase tracking-widest text-sm font-bold"
            style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.6)' }}
          >
            {editingChore ? 'Edit Chore' : 'Add New Chore'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Chore Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Wash the dishes"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`${inputClass} ${errors.name ? 'border-[#ff0044]' : ''}`}
            />
            {errors.name && <p className="text-xs" style={{ color: '#ff0044' }}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes or details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category *</Label>
            <div className="flex gap-2">
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className={`flex-1 ${inputClass} ${errors.category ? 'border-[#ff0044]' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.category && <p className="text-xs" style={{ color: '#ff0044' }}>{errors.category}</p>}
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="New category..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
                className={`flex-1 h-8 text-sm ${inputClass}`}
              />
              <button
                onClick={handleAddCategory}
                className="h-8 px-3 rounded text-xs font-medium transition-all"
                style={{
                  background: 'rgba(0,245,255,0.1)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  color: '#00f5ff',
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Priority & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-xs uppercase tracking-wider text-muted-foreground">Est. Duration (mins)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(e.target.value)}
                min={1}
                className={inputClass}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Recurrence</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
                {RECURRENCES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom interval */}
          {recurrence === 'custom' && (
            <div className="space-y-1.5">
              <Label htmlFor="interval" className="text-xs uppercase tracking-wider text-muted-foreground">Repeat every (days)</Label>
              <Input
                id="interval"
                type="number"
                value={customIntervalDays}
                onChange={e => setCustomIntervalDays(e.target.value)}
                min={1}
                className={`${inputClass} ${errors.customIntervalDays ? 'border-[#ff0044]' : ''}`}
              />
              {errors.customIntervalDays && <p className="text-xs" style={{ color: '#ff0044' }}>{errors.customIntervalDays}</p>}
            </div>
          )}

          {/* Due date */}
          {recurrence === 'none' && (
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs uppercase tracking-wider text-muted-foreground">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
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
            {editingChore ? 'Save Changes' : 'Add Chore'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
