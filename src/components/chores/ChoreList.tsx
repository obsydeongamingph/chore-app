'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChoreCard } from './ChoreCard'
import { ChoreForm } from './ChoreForm'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { filterChores, sortChores, getChoreStatus } from '@/lib/chore-utils'
import { Chore } from '@/types'
import { SlidersHorizontal, Search, Plus } from 'lucide-react'

type TabKey = 'today' | 'all' | 'overdue' | 'upcoming'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'upcoming', label: 'Upcoming' },
]

function getEmptyMessage(tab: TabKey, hasFilters: boolean): string {
  if (hasFilters) return 'Try adjusting your filters'
  switch (tab) {
    case 'today': return 'Nothing due today — enjoy your day!'
    case 'overdue': return 'All caught up — no overdue chores!'
    case 'upcoming': return 'Nothing due this week'
    case 'all': return 'Add your first chore to get started'
  }
}

export function ChoreList() {
  const { chores, categories } = useChoresContext()
  const [editingChore, setEditingChore] = useState<Chore | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [activeTab, setActiveTab] = useState<TabKey>('today')

  const activeChores = useMemo(() => chores.filter(c => c.isActive), [chores])

  const counts = useMemo(() => ({
    today: activeChores.filter(c => getChoreStatus(c) === 'today').length,
    all: activeChores.length,
    overdue: activeChores.filter(c => getChoreStatus(c) === 'overdue').length,
    upcoming: activeChores.filter(c => getChoreStatus(c) === 'upcoming').length,
  }), [activeChores])

  const filtered = useMemo(() => {
    let result = activeChores

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(c => getChoreStatus(c) === activeTab)
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }

    // Category + Priority filters
    result = filterChores(result, { category: filterCategory, priority: filterPriority, status: 'all' })

    // Sort
    result = sortChores(result, sortBy)
    return result
  }, [activeChores, activeTab, search, filterCategory, filterPriority, sortBy])

  function handleEdit(chore: Chore) {
    setEditingChore(chore)
    setFormOpen(true)
  }

  const activeFilters = [filterCategory, filterPriority].filter(f => f !== 'all').length
  const hasFilters = !!(search || activeFilters)

  const inputClass = "bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] focus:shadow-[0_0_8px_rgba(0,245,255,0.2)] transition-all placeholder:text-muted-foreground"
  const selectClass = "bg-[#0d0d1a] border-[#1e1e3f] text-foreground focus:border-[#00f5ff] transition-all"

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabKey)}>
        <TabsList
          className="h-auto p-1 gap-1 w-full sm:w-auto"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #1e1e3f' }}
        >
          {TABS.map(tab => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="text-xs uppercase tracking-wider font-medium px-3 py-1.5 data-[state=active]:text-[#0a0a0f] data-[state=active]:shadow-none"
              style={activeTab === tab.key ? {
                background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
                boxShadow: '0 0 10px rgba(0,245,255,0.4)',
              } : {}}
            >
              {tab.label}
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: activeTab === tab.key ? 'rgba(10,10,15,0.3)' : 'rgba(0,245,255,0.1)',
                  color: activeTab === tab.key ? '#0a0a0f' : '#00f5ff',
                }}
              >
                {counts[tab.key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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

        {activeTab === 'all' && (
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
        )}

        {activeFilters > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-[#00f5ff] underline transition-colors uppercase tracking-wider"
            onClick={() => { setFilterCategory('all'); setFilterPriority('all') }}
          >
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground uppercase tracking-widest">
        {filtered.length} chore{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Chore list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🧹</div>
          <p className="font-medium uppercase tracking-widest">No chores found</p>
          <p className="text-sm mt-1">{getEmptyMessage(activeTab, hasFilters)}</p>
          {!hasFilters && activeTab === 'all' && (
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
