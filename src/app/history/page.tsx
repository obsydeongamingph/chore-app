'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { format, isToday, isYesterday, startOfDay } from 'date-fns'
import { History, Search, Zap, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITY_STYLES = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function groupByDate(logs: ReturnType<typeof useChoresContext>['completionLog']) {
  const groups: Record<string, typeof logs> = {}
  for (const log of logs) {
    const key = startOfDay(new Date(log.completedAt)).toISOString()
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

function formatGroupLabel(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d, yyyy')
}

export default function HistoryPage() {
  const { completionLog, totalPoints } = useChoresContext()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return completionLog
    const q = search.toLowerCase()
    return completionLog.filter(log =>
      log.choreName.toLowerCase().includes(q) ||
      log.category?.toLowerCase().includes(q)
    )
  }, [completionLog, search])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-6 h-6" />
            History
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your completion log — {completionLog.length} total completions
          </p>
        </div>

        {/* Total points */}
        <Card className="border-0 shadow-sm bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="flex items-center gap-2 px-4 py-3">
            <Zap className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total XP Earned</p>
              <p className="text-lg font-bold">{totalPoints.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grouped logs */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No history yet</p>
          <p className="text-sm mt-1">Complete your first chore to see it here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, logs]) => {
            const dayTotal = logs.reduce((sum, log) => sum + log.pointsEarned, 0)
            return (
              <div key={dateKey}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {formatGroupLabel(dateKey)}
                  </h2>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />+{dayTotal} XP
                  </span>
                </div>
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className="divide-y divide-border">
                    {logs.map((log, idx) => (
                      <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">✓</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{log.choreName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {log.category && (
                              <Badge variant="outline" className="text-xs h-4 px-1 font-normal">{log.category}</Badge>
                            )}
                            {log.priority && (
                              <span className={cn('text-xs px-1.5 py-0 rounded-full font-medium', PRIORITY_STYLES[log.priority])}>
                                {log.priority}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.completedAt), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                          <Zap className="w-3 h-3" />
                          <span className="text-sm font-semibold">+{log.pointsEarned}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
