'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

  const inputClass = "bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] focus:shadow-[0_0_8px_rgba(0,245,255,0.2)] transition-all placeholder:text-muted-foreground"
  const selectClass = "bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] transition-all"

  return (
    <div className="space-y-4">
      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`pl-9 ${inputClass}`}
          />
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 transition-all"
          style={{
            background: 'rgba(0,245,255,0.08)',
            border: '1px solid rgba(0,245,255,0.3)',
            color: '#00f5ff',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.15)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,245,255,0.3)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.08)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
          }}
        >
          <Plus className="w-4 h-4" />
          Add Chore
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className={`w-[140px] h-8 text-xs ${selectClass}`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={(v) => v && setFilterPriority(v)}>
          <SelectTrigger className={`w-[120px] h-8 text-xs ${selectClass}`}>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className={`w-[120px] h-8 text-xs ${selectClass}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Due Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
          <SelectTrigger className={`w-[120px] h-8 text-xs ${selectClass}`}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent style={{ background: '#0d0d1a', border: '1px solid #1e1e3f' }}>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="streak">Streak</SelectItem>
            <SelectItem value="created">Created</SelectItem>
          </SelectContent>
        </Select>

        {activeFilters > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-[#00f5ff] underline transition-colors uppercase tracking-wider"
            onClick={() => { setFilterCategory('all'); setFilterPriority('all'); setFilterStatus('all') }}
          >
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {filtered.length} chore{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chore list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🧹</div>
          <p className="font-medium uppercase tracking-widest">No chores found</p>
          <p className="text-sm mt-1">
            {search || activeFilters > 0 ? 'Try adjusting your filters' : 'Add your first chore to get started'}
          </p>
          {!search && !activeFilters && (
            <button
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold mx-auto transition-all"
              onClick={() => setFormOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
                color: '#0a0a0f',
                boxShadow: '0 0 12px rgba(0,245,255,0.4)',
              }}
            >
              <Plus className="w-4 h-4" />
              Add Chore
            </button>
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
