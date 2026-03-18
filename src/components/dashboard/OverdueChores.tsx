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
      <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Overdue
            <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
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
