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

const PRIORITY_NEON_COLORS = {
  low: 'bg-[#00ff88]',
  medium: 'bg-[#ffcc00]',
  high: 'bg-[#ff0044]',
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

  const topChores = useMemo(() =>
    [...activeChores]
      .sort((a, b) => b.totalCompletions - a.totalCompletions)
      .slice(0, 5),
    [activeChores]
  )

  const streakLeaders = useMemo(() =>
    [...activeChores]
      .filter(c => c.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5),
    [activeChores]
  )

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
        <h1 className="text-2xl font-bold tracking-widest uppercase neon-text-cyan flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Statistics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5 tracking-wide">
          Your performance overview and insights
        </p>
      </div>

      {/* XP Level Card */}
      <Card className="neon-card border neon-glow-purple overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#00f5ff] via-[#bf00ff] to-[#00f5ff]" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ffcc0015] border border-[#ffcc0040] flex items-center justify-center">
                <Trophy className="w-6 h-6 neon-text-yellow" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Level</p>
                <p className="text-xl font-bold tracking-wide">Level {xp.level} · {xp.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold neon-text-yellow">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total XP</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-wider">Progress to Level {xp.level + 1}</span>
              <span>{xp.progress}% · {xp.nextLevelPoints - totalPoints} XP to go</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#1e1e3f] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${xp.progress}%`,
                  background: 'linear-gradient(90deg, #00f5ff 0%, #bf00ff 100%)',
                  boxShadow: '0 0 8px rgba(0,245,255,0.6)',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: CheckCircle2,
            label: 'This Week',
            value: weekCompletions.length,
            sub: weekVsLastWeek > 0
              ? <span className="neon-text-green">+{weekVsLastWeek} vs last week</span>
              : weekVsLastWeek < 0
                ? <span className="neon-text-red">{weekVsLastWeek} vs last week</span>
                : <span>Same as last week</span>,
            iconClass: 'text-[#00f5ff]',
            topBorder: 'from-[#00f5ff] to-[#0080ff]',
          },
          {
            icon: Target,
            label: 'This Month',
            value: monthCompletions.length,
            sub: <span>+{monthPoints} XP earned</span>,
            iconClass: 'text-[#bf00ff]',
            topBorder: 'from-[#bf00ff] to-[#ff00ff]',
          },
          {
            icon: Flame,
            label: 'Best Streak',
            value: bestStreak,
            sub: <span>consecutive days</span>,
            iconClass: 'text-[#ff6600]',
            topBorder: 'from-[#ff6600] to-[#ffcc00]',
          },
          {
            icon: Star,
            label: 'Total Completions',
            value: completionLog.length,
            sub: <span>all time</span>,
            iconClass: 'text-[#ffcc00]',
            topBorder: 'from-[#ffcc00] to-[#ff6600]',
          },
        ].map(({ icon: Icon, label, value, sub, iconClass, topBorder }) => (
          <Card key={label} className="neon-card border overflow-hidden">
            <div className={`h-[2px] bg-gradient-to-r ${topBorder}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-4 h-4', iconClass)} />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly activity chart */}
      <Card className="neon-card border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-[#00f5ff]" />
            This Week&apos;s Activity
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
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${height}px`,
                      background: isCurrentDay
                        ? 'linear-gradient(180deg, #00f5ff 0%, #0080ff 100%)'
                        : 'rgba(0, 245, 255, 0.18)',
                      boxShadow: isCurrentDay ? '0 0 10px rgba(0,245,255,0.5)' : 'none',
                    }}
                  />
                  <span className={cn(
                    'text-xs',
                    isCurrentDay ? 'font-bold neon-text-cyan' : 'text-muted-foreground'
                  )}>
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
        <Card className="neon-card border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">By Category</CardTitle>
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
                    <div className="h-1.5 rounded-full bg-[#1e1e3f] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((completed / Math.max(categoryStats[0].completed, 1)) * 100)}%`,
                          background: 'linear-gradient(90deg, #00f5ff 0%, #bf00ff 100%)',
                          boxShadow: '0 0 6px rgba(0,245,255,0.4)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority breakdown */}
        <Card className="neon-card border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {completionLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completions yet</p>
            ) : (
              <div className="space-y-3">
                {priorityStats.map(({ priority, count, pct }) => {
                  const barColor = priority === 'high' ? '#ff0044' : priority === 'medium' ? '#ffcc00' : '#00ff88'
                  return (
                    <div key={priority} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: barColor, boxShadow: `0 0 6px ${barColor}` }}
                          />
                          <span className="font-medium capitalize">{priority}</span>
                        </div>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1e1e3f] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: barColor,
                            boxShadow: `0 0 6px ${barColor}88`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top chores */}
        <Card className="neon-card border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-4 h-4 neon-text-yellow" />
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
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0 bg-[#00f5ff15] text-[#00f5ff] border border-[#00f5ff30]"
                    >
                      {chore.totalCompletions}x
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak leaders */}
        <Card className="neon-card border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <Flame className="w-4 h-4 neon-text-orange" />
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
                    <div className="flex items-center gap-1 neon-text-orange flex-shrink-0">
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
