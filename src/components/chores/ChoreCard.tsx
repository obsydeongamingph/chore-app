'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  Clock,
  Flame,
  Pencil,
  Trash2,
  RotateCcw,
  Timer,
  CalendarClock,
} from 'lucide-react'
import { Chore } from '@/types'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { formatDueDate, formatRecurrence, getChoreStatus } from '@/lib/chore-utils'
import { calculatePoints } from '@/lib/points'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PRIORITY_STYLES = {
  low: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    border: 'border-l-green-400',
    dot: 'bg-green-400',
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    border: 'border-l-yellow-400',
    dot: 'bg-yellow-400',
  },
  high: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-l-red-400',
    dot: 'bg-red-400',
  },
}

interface ChoreCardProps {
  chore: Chore
  onEdit: (chore: Chore) => void
  compact?: boolean
}

export function ChoreCard({ chore, onEdit, compact = false }: ChoreCardProps) {
  const { completeChore, deleteChore, undoComplete, isCompletedToday } = useChoresContext()
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const status = getChoreStatus(chore)
  const completed = isCompletedToday(chore.id)
  const priorityStyle = PRIORITY_STYLES[chore.priority]
  const isOverdue = status === 'overdue'

  function handleComplete() {
    if (completed) {
      undoComplete(chore.id)
      toast.info(`Uncompleted "${chore.name}"`)
    } else {
      completeChore(chore.id)
      const pts = calculatePoints(chore.priority, chore.streak + 1)
      const streakMsg = chore.streak > 0 ? ` 🔥 ${chore.streak + 1} streak!` : ''
      toast.success(`"${chore.name}" done! +${pts} XP${streakMsg}`)
    }
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-l-4 transition-all duration-200',
        priorityStyle.border,
        completed && 'opacity-60',
        isOverdue && !completed && 'ring-1 ring-red-300 dark:ring-red-900',
        'hover:shadow-md group'
      )}
    >
      <div className={cn('p-4', compact && 'p-3')}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          <button
            onClick={handleComplete}
            className={cn(
              'flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              completed
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-primary'
            )}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {completed && <CheckCircle2 className="w-3 h-3" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                'font-medium text-sm leading-tight',
                completed && 'line-through text-muted-foreground'
              )}>
                {chore.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onEdit(chore)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                {!showConfirmDelete ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => deleteChore(chore.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setShowConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {chore.description && !compact && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {chore.description}
              </p>
            )}

            {/* Tags row */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', priorityStyle.badge)}>
                {chore.priority}
              </span>
              <Badge variant="outline" className="text-xs h-5 px-1.5 font-normal">
                {chore.category}
              </Badge>
              <Badge variant="secondary" className="text-xs h-5 px-1.5 font-normal">
                {formatRecurrence(chore)}
              </Badge>
              {chore.estimatedMinutes && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Timer className="w-3 h-3" />
                  {chore.estimatedMinutes}m
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer row */}
        {!compact && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-3">
              {chore.streak > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                  <Flame className="w-3 h-3" />
                  {chore.streak} streak
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {chore.totalCompletions} total
              </span>
            </div>
            <span className={cn(
              'text-xs font-medium flex items-center gap-1',
              isOverdue && !completed ? 'text-red-500' : 'text-muted-foreground'
            )}>
              <CalendarClock className="w-3 h-3" />
              {formatDueDate(chore)}
            </span>
          </div>
        )}
      </div>

      {/* Completion overlay */}
      {completed && (
        <div className="absolute inset-0 bg-background/20 pointer-events-none" />
      )}
    </Card>
  )
}
