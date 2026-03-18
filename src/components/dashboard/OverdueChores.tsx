'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChoreCard } from '@/components/chores/ChoreCard'
import { ChoreForm } from '@/components/chores/ChoreForm'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { isOverdue } from '@/lib/chore-utils'
import { Chore } from '@/types'
import { AlertTriangle } from 'lucide-react'

export function OverdueChores() {
  const { chores } = useChoresContext()
  const [editingChore, setEditingChore] = useState<Chore | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const overdueChores = useMemo(() =>
    chores.filter(c => c.isActive && isOverdue(c)),
    [chores]
  )

  if (overdueChores.length === 0) return null

  return (
    <>
      <Card
        className="neon-card border-l-4 overflow-hidden"
        style={{
          borderLeftColor: '#ff0044',
          boxShadow: '0 0 18px rgba(255, 0, 68, 0.15), -3px 0 12px rgba(255, 0, 68, 0.25)',
        }}
      >
        <div className="h-[2px] bg-gradient-to-r from-[#ff0044] to-[#ff6600]" />
        <CardHeader className="pb-3">
          <CardTitle
            className="text-xs font-semibold flex items-center gap-2 uppercase tracking-widest"
            style={{ color: '#ff0044', textShadow: '0 0 8px rgba(255,0,68,0.6)' }}
          >
            <AlertTriangle className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 4px #ff0044)' }} />
            Overdue
            <Badge
              className="text-xs border-0"
              style={{
                background: 'rgba(255,0,68,0.15)',
                color: '#ff0044',
                border: '1px solid rgba(255,0,68,0.35)',
              }}
            >
              {overdueChores.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {overdueChores.map(chore => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                onEdit={(c) => { setEditingChore(c); setFormOpen(true) }}
                compact
              />
            ))}
          </div>
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
