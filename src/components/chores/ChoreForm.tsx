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

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingChore ? 'Edit Chore' : 'Add New Chore'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Chore Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Wash the dishes"
              value={name}
              onChange={e => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes or details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <div className="flex gap-2">
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className={`flex-1 ${errors.category ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            {/* Add new category */}
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="New category..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
                className="flex-1 h-8 text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleAddCategory} className="h-8">
                Add
              </Button>
            </div>
          </div>

          {/* Priority & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration">Est. Duration (mins)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(e.target.value)}
                min={1}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-1.5">
            <Label>Recurrence</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom interval */}
          {recurrence === 'custom' && (
            <div className="space-y-1.5">
              <Label htmlFor="interval">Repeat every (days)</Label>
              <Input
                id="interval"
                type="number"
                value={customIntervalDays}
                onChange={e => setCustomIntervalDays(e.target.value)}
                min={1}
                className={errors.customIntervalDays ? 'border-destructive' : ''}
              />
              {errors.customIntervalDays && <p className="text-xs text-destructive">{errors.customIntervalDays}</p>}
            </div>
          )}

          {/* Due date (for one-time or as start date) */}
          {recurrence === 'none' && (
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onClose(); resetForm() }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingChore ? 'Save Changes' : 'Add Chore'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
