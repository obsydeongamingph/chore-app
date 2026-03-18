'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              Due Today
              {todayChores.length > 0 && (
                <Badge variant="secondary" className="text-xs">{todayChores.length}</Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {todayChores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-medium">Nothing due today!</p>
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
