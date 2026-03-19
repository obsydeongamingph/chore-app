'use client'

import { useChoresContext } from '@/components/providers/ChoresProvider'
import { getXPLevel } from '@/lib/points'
import { getChoreStatus } from '@/lib/chore-utils'
import { Zap, Flame, CheckCircle2 } from 'lucide-react'

export function HeroSection() {
  const { chores, totalPoints, getBestStreak, getCompletedTodayCount } = useChoresContext()
  const xp = getXPLevel(totalPoints)
  const bestStreak = getBestStreak()
  const completedToday = getCompletedTodayCount()

  const activeChores = chores.filter(c => c.isActive)
  const dueTodayCount = activeChores.filter(c => getChoreStatus(c) === 'today').length
  const totalTodayPossible = dueTodayCount + completedToday
  const allDoneToday = completedToday > 0 && completedToday >= totalTodayPossible

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: 'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(191,0,255,0.06) 100%)',
        border: '1px solid rgba(0,245,255,0.2)',
        boxShadow: '0 0 30px rgba(0,245,255,0.08)',
      }}
    >
      {/* Level + XP */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Level badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
              boxShadow: '0 0 20px rgba(0,245,255,0.5)',
              color: '#0a0a0f',
            }}
          >
            {xp.level}
          </div>
          <div>
            <p
              className="font-bold text-xl tracking-widest uppercase leading-none"
              style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.7)' }}
            >
              {xp.title}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
              Level {xp.level}
            </p>
          </div>
        </div>

        {/* Total XP pill */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 flex-shrink-0"
          style={{
            background: 'rgba(255,204,0,0.08)',
            border: '1px solid rgba(255,204,0,0.25)',
          }}
        >
          <Zap className="w-4 h-4" style={{ color: '#ffcc00', filter: 'drop-shadow(0 0 4px #ffcc00)' }} />
          <span
            className="font-bold text-base"
            style={{ color: '#ffcc00', textShadow: '0 0 8px rgba(255,204,0,0.7)' }}
          >
            {totalPoints.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider">
          <span>Progress to Level {xp.level + 1}</span>
          <span style={{ color: '#00f5ff' }}>{xp.progress}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1e1e3f' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${xp.progress}%`,
              background: 'linear-gradient(90deg, #00f5ff 0%, #bf00ff 100%)',
              boxShadow: '0 0 10px rgba(0,245,255,0.6)',
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {totalPoints.toLocaleString()} / {xp.nextLevelPoints.toLocaleString()} XP
        </p>
      </div>

      {/* Stat chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: 'rgba(255,102,0,0.1)',
            border: '1px solid rgba(255,102,0,0.25)',
          }}
        >
          <Flame className="w-3.5 h-3.5" style={{ color: '#ff6600', filter: 'drop-shadow(0 0 4px #ff6600)' }} />
          <span className="text-sm font-semibold" style={{ color: '#ff6600' }}>
            {bestStreak} day streak
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: allDoneToday ? 'rgba(0,255,136,0.1)' : 'rgba(0,245,255,0.08)',
            border: allDoneToday ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(0,245,255,0.2)',
          }}
        >
          <CheckCircle2
            className="w-3.5 h-3.5"
            style={{
              color: allDoneToday ? '#00ff88' : '#00f5ff',
              filter: `drop-shadow(0 0 4px ${allDoneToday ? '#00ff88' : '#00f5ff'})`,
            }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: allDoneToday ? '#00ff88' : '#00f5ff' }}
          >
            {allDoneToday ? 'All done today!' : `${completedToday} done today`}
          </span>
        </div>
      </div>
    </div>
  )
}
