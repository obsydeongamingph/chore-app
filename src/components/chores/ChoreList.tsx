'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChoreCard } from './ChoreCard'
import { ChoreForm } from './ChoreForm'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { filterChores, sortChores } from '@/lib/chore-utils'
import { Chore } from '@/types'
import { SlidersHorizontal, Search, Plus } from 'lucide-react'

export function ChoreList() {
  const { chores, categories } = useChoresContext()
  const [editingChore, setEditingChore] = useState<Chore | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  const filtered = useMemo(() => {
    let result = chores.filter(c => c.isActive)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }

    result = filterChores(result, { category: filterCategory, priority: filterPriority, status: filterStatus })
    result = sortChores(result, sortBy)
    return result
  }, [chores, search, filterCategory, filterPriority, filterStatus, sortBy])

  function handleEdit(chore: Chore) {
    setEditingChore(chore)
    setFormOpen(true)
  }

  const activeFilters = [filterCategory, filterPriority, filterStatus].filter(f => f !== 'all').length

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormOpen(true)}
          className="gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Chore
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={(v) => v && setFilterPriority(v)}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Due Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="streak">Streak</SelectItem>
            <SelectItem value="created">Created</SelectItem>
          </SelectContent>
        </Select>

        {activeFilters > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline"
            onClick={() => { setFilterCategory('all'); setFilterPriority('all'); setFilterStatus('all') }}
          >
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} chore{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chore list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🧹</div>
          <p className="font-medium">No chores found</p>
          <p className="text-sm mt-1">
            {search || activeFilters > 0 ? 'Try adjusting your filters' : 'Add your first chore to get started'}
          </p>
          {!search && !activeFilters && (
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Chore
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(chore => (
            <ChoreCard key={chore.id} chore={chore} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ChoreForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingChore(null) }}
        editingChore={editingChore}
      />
    </div>
  )
}
