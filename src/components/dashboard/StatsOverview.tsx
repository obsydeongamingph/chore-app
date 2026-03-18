'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { getChoreStatus } from '@/lib/chore-utils'
import { getXPLevel } from '@/lib/points'
import { Progress } from '@/components/ui/progress'
import {
  CheckSquare,
  AlertTriangle,
  Flame,
  Zap,
  CalendarCheck,
  Trophy,
} from 'lucide-react'
import { startOfDay } from 'date-fns'

export function StatsOverview() {
  const { chores, completionLog, totalPoints, getBestStreak, getCompletedTodayCount } = useChoresContext()

  const activeChores = chores.filter(c => c.isActive)
  const overdueCount = activeChores.filter(c => getChoreStatus(c) === 'overdue').length
  const dueTodayCount = activeChores.filter(c => getChoreStatus(c) === 'today').length
  const completedToday = getCompletedTodayCount()
  const bestStreak = getBestStreak()
  const xp = getXPLevel(totalPoints)

  const todayProgress = dueTodayCount > 0 ? Math.round((completedToday / (dueTodayCount + completedToday)) * 100) : completedToday > 0 ? 100 : 0

  const stats = [
    {
      label: 'Due Today',
      value: dueTodayCount,
      sub: `${completedToday} completed`,
      icon: CalendarCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      sub: overdueCount === 0 ? 'All caught up!' : 'Need attention',
      icon: AlertTriangle,
      color: overdueCount > 0 ? 'text-red-500' : 'text-green-500',
      bg: overdueCount > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Best Streak',
      value: bestStreak,
      sub: bestStreak === 1 ? '1 day' : `${bestStreak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'Total XP',
      value: totalPoints,
      sub: `Level ${xp.level} · ${xp.title}`,
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={`${stat.bg} border-0 shadow-sm`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-background/50`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Today's progress bar */}
      {(dueTodayCount > 0 || completedToday > 0) && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Today's Progress</span>
              </div>
              <span className="text-sm font-bold">{completedToday}/{dueTodayCount + completedToday}</span>
            </div>
            <Progress value={todayProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {todayProgress === 100 ? '🎉 All done for today!' : `${todayProgress}% complete`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
