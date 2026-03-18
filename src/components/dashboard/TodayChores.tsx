'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChoreCard } from '@/components/chores/ChoreCard'
import { ChoreForm } from '@/components/chores/ChoreForm'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { isDueToday } from '@/lib/chore-utils'
import { Chore } from '@/types'
import { Sun, Plus } from 'lucide-react'

export function TodayChores() {
  const { chores } = useChoresContext()
  const [editingChore, setEditingChore] = useState<Chore | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const todayChores = useMemo(() =>
    chores.filter(c => c.isActive && isDueToday(c)),
    [chores]
  )

  return (
    <>
      <Card className="neon-card border overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-[#ffcc00] to-[#ff6600]" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <Sun className="w-4 h-4" style={{ color: '#ffcc00', filter: 'drop-shadow(0 0 4px #ffcc00)' }} />
              Due Today
              {todayChores.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: 'rgba(255,204,0,0.12)',
                    border: '1px solid rgba(255,204,0,0.3)',
                    color: '#ffcc00',
                  }}
                >
                  {todayChores.length}
                </Badge>
              )}
            </CardTitle>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-[#00f5ff] transition-colors"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {todayChores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-medium uppercase tracking-wide">Nothing due today!</p>
              <p className="text-xs mt-1">Enjoy your free time or add a chore.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayChores.map(chore => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  onEdit={(c) => { setEditingChore(c); setFormOpen(true) }}
                  compact
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ChoreForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingChore(null) }}
        editingChore={editingChore}
      />
    </>
  )
}
