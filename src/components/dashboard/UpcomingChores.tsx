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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            Upcoming This Week
            {upcomingChores.length > 0 && (
              <Badge variant="secondary" className="text-xs">{upcomingChores.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingChores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm">Nothing scheduled for this week.</p>
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
