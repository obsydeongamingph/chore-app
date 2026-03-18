import {
  addDays,
  addWeeks,
  addMonths,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  format,
  parseISO,
  differenceInDays,
} from 'date-fns'
import { Chore } from '@/types'

export function calculateNextDue(chore: Chore, completedAt: Date): string {
  const base = startOfDay(completedAt)

  switch (chore.recurrence) {
    case 'daily':
      return addDays(base, 1).toISOString()
    case 'weekly':
      return addWeeks(base, 1).toISOString()
    case 'monthly':
      return addMonths(base, 1).toISOString()
    case 'custom':
      return addDays(base, chore.customIntervalDays ?? 1).toISOString()
    case 'none':
    default:
      return chore.dueDate ?? base.toISOString()
  }
}

export function isOverdue(chore: Chore): boolean {
  if (!chore.isActive) return false
  if (!chore.nextDue && !chore.dueDate) return false

  const dueDateStr = chore.nextDue ?? chore.dueDate
  if (!dueDateStr) return false

  const due = startOfDay(parseISO(dueDateStr))
  const today = startOfDay(new Date())
  return isBefore(due, today)
}

export function isDueToday(chore: Chore): boolean {
  if (!chore.isActive) return false
  const dueDateStr = chore.nextDue ?? chore.dueDate
  if (!dueDateStr) return false

  return isToday(parseISO(dueDateStr))
}

export function isDueThisWeek(chore: Chore): boolean {
  if (!chore.isActive) return false
  const dueDateStr = chore.nextDue ?? chore.dueDate
  if (!dueDateStr) return false

  const due = startOfDay(parseISO(dueDateStr))
  const today = startOfDay(new Date())
  const weekFromNow = addDays(today, 7)

  return isAfter(due, endOfDay(new Date())) && isBefore(due, weekFromNow)
}

export function getChoreStatus(chore: Chore): 'overdue' | 'today' | 'upcoming' | 'future' | 'no-schedule' {
  if (!chore.nextDue && !chore.dueDate) return 'no-schedule'
  if (isOverdue(chore)) return 'overdue'
  if (isDueToday(chore)) return 'today'
  if (isDueThisWeek(chore)) return 'upcoming'
  return 'future'
}

export function getDaysUntilDue(chore: Chore): number | null {
  const dueDateStr = chore.nextDue ?? chore.dueDate
  if (!dueDateStr) return null
  const due = startOfDay(parseISO(dueDateStr))
  const today = startOfDay(new Date())
  return differenceInDays(due, today)
}

export function formatDueDate(chore: Chore): string {
  const dueDateStr = chore.nextDue ?? chore.dueDate
  if (!dueDateStr) return 'No due date'

  const days = getDaysUntilDue(chore)

  if (days === null) return 'No due date'
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7) return `Due in ${days} days`

  return `Due ${format(parseISO(dueDateStr), 'MMM d, yyyy')}`
}

export function formatRecurrence(chore: Chore): string {
  switch (chore.recurrence) {
    case 'daily': return 'Daily'
    case 'weekly': return 'Weekly'
    case 'monthly': return 'Monthly'
    case 'custom': return `Every ${chore.customIntervalDays} days`
    case 'none': return 'One-time'
    default: return 'Unknown'
  }
}

export function sortChores(chores: Chore[], sortBy: string): Chore[] {
  return [...chores].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }
      case 'name':
        return a.name.localeCompare(b.name)
      case 'dueDate': {
        const aDate = a.nextDue ?? a.dueDate ?? ''
        const bDate = b.nextDue ?? b.dueDate ?? ''
        if (!aDate && !bDate) return 0
        if (!aDate) return 1
        if (!bDate) return -1
        return aDate.localeCompare(bDate)
      }
      case 'streak':
        return b.streak - a.streak
      case 'created':
        return b.createdAt.localeCompare(a.createdAt)
      default:
        return 0
    }
  })
}

export function filterChores(chores: Chore[], filters: { category: string; priority: string; status: string }): Chore[] {
  return chores.filter(chore => {
    if (filters.category && filters.category !== 'all' && chore.category !== filters.category) return false
    if (filters.priority && filters.priority !== 'all' && chore.priority !== filters.priority) return false
    if (filters.status && filters.status !== 'all') {
      const status = getChoreStatus(chore)
      if (filters.status === 'overdue' && status !== 'overdue') return false
      if (filters.status === 'today' && status !== 'today') return false
      if (filters.status === 'upcoming' && status !== 'upcoming') return false
      if (filters.status === 'active' && !chore.isActive) return false
    }
    return true
  })
}
