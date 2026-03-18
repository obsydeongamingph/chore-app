'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

const PRIORITY_NEON = {
  low: {
    color: '#00ff88',
    borderColor: '#00ff88',
    badgeBg: 'rgba(0,255,136,0.12)',
    badgeBorder: 'rgba(0,255,136,0.3)',
  },
  medium: {
    color: '#ffcc00',
    borderColor: '#ffcc00',
    badgeBg: 'rgba(255,204,0,0.12)',
    badgeBorder: 'rgba(255,204,0,0.3)',
  },
  high: {
    color: '#ff0044',
    borderColor: '#ff0044',
    badgeBg: 'rgba(255,0,68,0.12)',
    badgeBorder: 'rgba(255,0,68,0.3)',
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
  const neon = PRIORITY_NEON[chore.priority]
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
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-l-[3px] transition-all duration-200 group',
        completed && 'opacity-50'
      )}
      style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #12121f 100%)',
        border: `1px solid #1e1e3f`,
        borderLeftWidth: '3px',
        borderLeftColor: neon.borderColor,
        boxShadow: isOverdue && !completed
          ? `0 0 14px rgba(255,0,68,0.2), -2px 0 8px rgba(255,0,68,0.3)`
          : 'none',
      }}
      onMouseEnter={e => {
        if (!completed) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 18px rgba(0,245,255,0.12), -2px 0 8px ${neon.color}40`
        }
      }}
      onMouseLeave={e => {
        if (!completed) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = isOverdue
            ? `0 0 14px rgba(255,0,68,0.2), -2px 0 8px rgba(255,0,68,0.3)`
            : 'none'
        }
      }}
    >
      <div className={cn('p-4', compact && 'p-3')}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Complete button */}
          <button
            onClick={handleComplete}
            className={cn(
              'flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200'
            )}
            style={completed ? {
              borderColor: '#00ff88',
              background: 'rgba(0,255,136,0.15)',
              boxShadow: '0 0 8px rgba(0,255,136,0.5)',
            } : {
              borderColor: 'rgba(255,255,255,0.2)',
            }}
            onMouseEnter={e => {
              if (!completed) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#00f5ff'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px rgba(0,245,255,0.4)'
              }
            }}
            onMouseLeave={e => {
              if (!completed) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }
            }}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {completed && <CheckCircle2 className="w-3 h-3" style={{ color: '#00ff88' }} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                'font-medium text-sm leading-tight',
                completed && 'line-through text-muted-foreground'
              )}>
                {chore.name}
              </h3>
              {/* Action buttons - visible on hover */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-[#00f5ff] transition-colors"
                  onClick={() => onEdit(chore)}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                {!showConfirmDelete ? (
                  <button
                    className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-[#ff0044] transition-colors"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      className="h-6 text-xs px-2 rounded font-medium transition-all"
                      style={{
                        background: 'rgba(255,0,68,0.15)',
                        border: '1px solid rgba(255,0,68,0.4)',
                        color: '#ff0044',
                      }}
                      onClick={() => deleteChore(chore.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="h-6 text-xs px-2 rounded text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmDelete(false)}
                    >
                      Cancel
                    </button>
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
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  color: neon.color,
                  background: neon.badgeBg,
                  border: `1px solid ${neon.badgeBorder}`,
                  textShadow: `0 0 6px ${neon.color}80`,
                }}
              >
                {chore.priority}
              </span>
              <Badge
                variant="outline"
                className="text-xs h-5 px-1.5 font-normal"
                style={{ borderColor: '#1e1e3f', color: 'rgb(var(--muted-foreground))' }}
              >
                {chore.category}
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs h-5 px-1.5 font-normal"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(var(--muted-foreground))' }}
              >
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
          <div
            className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              {chore.streak > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#ff6600', textShadow: '0 0 6px rgba(255,102,0,0.6)' }}>
                  <Flame className="w-3 h-3" style={{ filter: 'drop-shadow(0 0 3px #ff6600)' }} />
                  {chore.streak} streak
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {chore.totalCompletions} total
              </span>
            </div>
            <span
              className="text-xs font-medium flex items-center gap-1"
              style={isOverdue && !completed ? { color: '#ff0044', textShadow: '0 0 6px rgba(255,0,68,0.5)' } : { color: 'rgb(var(--muted-foreground))' }}
            >
              <CalendarClock className="w-3 h-3" />
              {formatDueDate(chore)}
            </span>
          </div>
        )}
      </div>

      {/* Completion overlay */}
      {completed && (
        <div className="absolute inset-0 bg-background/10 pointer-events-none" />
      )}
    </div>
  )
}
