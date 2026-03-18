'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { getXPLevel } from '@/lib/points'
import { getChoreStatus } from '@/lib/chore-utils'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  subWeeks,
  startOfDay,
} from 'date-fns'
import {
  BarChart3,
  Zap,
  Flame,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Target,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITY_COLORS = {
  low: 'bg-green-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-400',
}

export default function StatsPage() {
  const { chores, completionLog, totalPoints, getBestStreak } = useChoresContext()

  const xp = getXPLevel(totalPoints)
  const bestStreak = getBestStreak()
  const activeChores = chores.filter(c => c.isActive)

  const now = new Date()
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })

  const weekCompletions = completionLog.filter(log =>
    isWithinInterval(new Date(log.completedAt), { start: thisWeekStart, end: thisWeekEnd })
  )
  const monthCompletions = completionLog.filter(log =>
    isWithinInterval(new Date(log.completedAt), { start: thisMonthStart, end: thisMonthEnd })
  )
  const lastWeekCompletions = completionLog.filter(log =>
    isWithinInterval(new Date(log.completedAt), { start: lastWeekStart, end: lastWeekEnd })
  )

  const weekPoints = weekCompletions.reduce((sum, log) => sum + log.pointsEarned, 0)
  const monthPoints = monthCompletions.reduce((sum, log) => sum + log.pointsEarned, 0)

  // Category breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    for (const log of completionLog) {
      if (!counts[log.category]) counts[log.category] = { total: 0, completed: 0 }
      counts[log.category].completed++
      counts[log.category].total++
    }
    for (const chore of activeChores) {
      if (!counts[chore.category]) counts[chore.category] = { total: 0, completed: 0 }
      counts[chore.category].total++
    }
    return Object.entries(counts)
      .map(([cat, data]) => ({ category: cat, ...data }))
      .sort((a, b) => b.completed - a.completed)
  }, [completionLog, activeChores])

  // Priority breakdown
  const priorityStats = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 }
    for (const log of completionLog) {
      if (log.priority) counts[log.priority]++
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    return Object.entries(counts).map(([p, count]) => ({
      priority: p as 'low' | 'medium' | 'high',
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
  }, [completionLog])

  // Top chores
  const topChores = useMemo(() =>
    [...activeChores]
      .sort((a, b) => b.totalCompletions - a.totalCompletions)
      .slice(0, 5),
    [activeChores]
  )

  // Streak leaders
  const streakLeaders = useMemo(() =>
    [...activeChores]
      .filter(c => c.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5),
    [activeChores]
  )

  // Weekly activity (last 7 days)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(thisWeekStart)
      d.setDate(d.getDate() + i)
      const dayStart = startOfDay(d)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      const count = completionLog.filter(log => {
        const logDate = new Date(log.completedAt)
        return logDate >= dayStart && logDate <= dayEnd
      }).length
      return { day: format(d, 'EEE'), count, date: d }
    })
  }, [completionLog, thisWeekStart])

  const maxDayCount = Math.max(...weekDays.map(d => d.count), 1)

  const weekVsLastWeek = weekCompletions.length - lastWeekCompletions.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Statistics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your performance overview and insights
        </p>
      </div>

      {/* XP Level Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Level</p>
                <p className="text-xl font-bold">Level {xp.level} · {xp.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {xp.level + 1}</span>
              <span>{xp.progress}% · {xp.nextLevelPoints - totalPoints} XP to go</span>
            </div>
            <Progress value={xp.progress} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
            <p className="text-2xl font-bold">{weekCompletions.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {weekVsLastWeek > 0
                ? <span className="text-green-500">+{weekVsLastWeek} vs last week</span>
                : weekVsLastWeek < 0
                  ? <span className="text-red-500">{weekVsLastWeek} vs last week</span>
                  : 'Same as last week'
              }
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <p className="text-2xl font-bold">{monthCompletions.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">+{monthPoints} XP earned</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
            <p className="text-2xl font-bold">{bestStreak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">consecutive days</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Total Completions</p>
            </div>
            <p className="text-2xl font-bold">{completionLog.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly activity chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            This Week's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-28">
            {weekDays.map(({ day, count, date }) => {
              const height = count === 0 ? 4 : Math.max(16, Math.round((count / maxDayCount) * 100))
              const isCurrentDay = startOfDay(date).getTime() === startOfDay(now).getTime()
              return (
                <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs font-medium text-muted-foreground">{count > 0 ? count : ''}</span>
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all',
                      isCurrentDay ? 'bg-primary' : 'bg-primary/30',
                    )}
                    style={{ height: `${height}px` }}
                  />
                  <span className={cn('text-xs', isCurrentDay ? 'font-bold text-primary' : 'text-muted-foreground')}>
                    {day}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {categoryStats.slice(0, 6).map(({ category, completed }) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate">{category}</span>
                      <span className="text-muted-foreground flex-shrink-0 ml-2">{completed} completions</span>
                    </div>
                    <Progress
                      value={Math.round((completed / Math.max(categoryStats[0].completed, 1)) * 100)}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {completionLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completions yet</p>
            ) : (
              <div className="space-y-3">
                {priorityStats.map(({ priority, count, pct }) => (
                  <div key={priority} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', PRIORITY_COLORS[priority])} />
                        <span className="font-medium capitalize">{priority}</span>
                      </div>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top chores */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Most Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topChores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completions yet</p>
            ) : (
              <div className="space-y-2">
                {topChores.map((chore, idx) => (
                  <div key={chore.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chore.name}</p>
                      <p className="text-xs text-muted-foreground">{chore.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {chore.totalCompletions}x
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak leaders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Streak Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streakLeaders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No streaks yet — complete recurring chores daily!</p>
            ) : (
              <div className="space-y-2">
                {streakLeaders.map((chore, idx) => (
                  <div key={chore.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chore.name}</p>
                      <p className="text-xs text-muted-foreground">{chore.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500 flex-shrink-0">
                      <Flame className="w-3 h-3" />
                      <span className="text-sm font-bold">{chore.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
