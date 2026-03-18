'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { getChoreStatus } from '@/lib/chore-utils'
import { getXPLevel } from '@/lib/points'
import {
  CheckSquare,
  AlertTriangle,
  Flame,
  Zap,
  CalendarCheck,
  Trophy,
} from 'lucide-react'
import { startOfDay } from 'date-fns'

const STAT_CONFIG = [
  {
    key: 'dueToday',
    label: 'Due Today',
    icon: CalendarCheck,
    neonColor: '#00f5ff',
    topGradient: 'from-[#00f5ff] to-[#0080ff]',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertTriangle,
    neonColor: '#ff0044',
    neonColorGood: '#00ff88',
    topGradient: 'from-[#ff0044] to-[#ff6600]',
    topGradientGood: 'from-[#00ff88] to-[#00f5ff]',
  },
  {
    key: 'streak',
    label: 'Best Streak',
    icon: Flame,
    neonColor: '#ff6600',
    topGradient: 'from-[#ff6600] to-[#ffcc00]',
  },
  {
    key: 'xp',
    label: 'Total XP',
    icon: Zap,
    neonColor: '#ffcc00',
    topGradient: 'from-[#ffcc00] to-[#ff6600]',
  },
]

export function StatsOverview() {
  const { chores, completionLog, totalPoints, getBestStreak, getCompletedTodayCount } = useChoresContext()

  const activeChores = chores.filter(c => c.isActive)
  const overdueCount = activeChores.filter(c => getChoreStatus(c) === 'overdue').length
  const dueTodayCount = activeChores.filter(c => getChoreStatus(c) === 'today').length
  const completedToday = getCompletedTodayCount()
  const bestStreak = getBestStreak()
  const xp = getXPLevel(totalPoints)

  const todayProgress = dueTodayCount > 0
    ? Math.round((completedToday / (dueTodayCount + completedToday)) * 100)
    : completedToday > 0 ? 100 : 0

  const statsValues = [
    { key: 'dueToday', value: dueTodayCount, sub: `${completedToday} completed` },
    { key: 'overdue', value: overdueCount, sub: overdueCount === 0 ? 'All caught up!' : 'Need attention' },
    { key: 'streak', value: bestStreak, sub: bestStreak === 1 ? '1 day' : `${bestStreak} days` },
    { key: 'xp', value: totalPoints, sub: `Level ${xp.level} · ${xp.title}` },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsValues.map((stat) => {
          const config = STAT_CONFIG.find(c => c.key === stat.key)!
          const Icon = config.icon
          const isOverdueGood = stat.key === 'overdue' && overdueCount === 0
          const neonColor = isOverdueGood && config.neonColorGood ? config.neonColorGood : config.neonColor
          const topGradient = isOverdueGood && config.topGradientGood ? config.topGradientGood : config.topGradient

          return (
            <Card key={stat.key} className="neon-card border overflow-hidden">
              <div className={`h-[2px] bg-gradient-to-r ${topGradient}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      {config.label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: neonColor,
                        textShadow: `0 0 10px ${neonColor}88`,
                      }}
                    >
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: `${neonColor}12`,
                      border: `1px solid ${neonColor}30`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: neonColor, filter: `drop-shadow(0 0 4px ${neonColor})` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Today's progress bar */}
      {(dueTodayCount > 0 || completedToday > 0) && (
        <Card className="neon-card border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
                <span className="text-sm font-medium uppercase tracking-wider">Today&apos;s Progress</span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: '#00f5ff', textShadow: '0 0 8px rgba(0,245,255,0.7)' }}
              >
                {completedToday}/{dueTodayCount + completedToday}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e3f' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${todayProgress}%`,
                  background: todayProgress === 100
                    ? 'linear-gradient(90deg, #00ff88 0%, #00f5ff 100%)'
                    : 'linear-gradient(90deg, #00f5ff 0%, #bf00ff 100%)',
                  boxShadow: todayProgress === 100
                    ? '0 0 8px rgba(0,255,136,0.6)'
                    : '0 0 8px rgba(0,245,255,0.6)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {todayProgress === 100
                ? <span className="neon-text-green font-medium">All done for today!</span>
                : `${todayProgress}% complete`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
