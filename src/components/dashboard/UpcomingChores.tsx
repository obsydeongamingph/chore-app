'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChoreCard } from '@/components/chores/ChoreCard'
import { ChoreForm } from '@/components/chores/ChoreForm'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { isDueThisWeek, getDaysUntilDue } from '@/lib/chore-utils'
import { Chore } from '@/types'
import { CalendarDays } from 'lucide-react'

export function UpcomingChores() {
  const { chores } = useChoresContext()
  const [editingChore, setEditingChore] = useState<Chore | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const upcomingChores = useMemo(() => {
    return chores
      .filter(c => c.isActive && isDueThisWeek(c))
      .sort((a, b) => {
        const da = getDaysUntilDue(a) ?? 999
        const db = getDaysUntilDue(b) ?? 999
        return da - db
      })
  }, [chores])

  return (
    <>
      <Card className="neon-card border overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-[#00f5ff] to-[#bf00ff]" />
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
            <CalendarDays className="w-4 h-4" style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
            Upcoming This Week
            {upcomingChores.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  background: 'rgba(0,245,255,0.1)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  color: '#00f5ff',
                }}
              >
                {upcomingChores.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingChores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm uppercase tracking-wide">Nothing scheduled for this week.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingChores.map(chore => (
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
