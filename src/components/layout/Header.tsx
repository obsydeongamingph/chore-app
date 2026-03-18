'use client'

import { Moon, Sun, Plus, Menu, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { getXPLevel } from '@/lib/points'
import { QuickAdd } from '@/components/chores/QuickAdd'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { totalPoints, theme, setTheme } = useChoresContext()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const xp = getXPLevel(totalPoints)

  return (
    <>
      <header
        className="sticky top-0 z-10 h-16 flex items-center gap-3 px-4 lg:px-6"
        style={{
          background: 'rgba(8, 8, 18, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e1e3f',
          boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-[#00f5ff] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* XP display */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* XP pill */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 cursor-default"
            style={{
              background: 'rgba(255, 204, 0, 0.08)',
              border: '1px solid rgba(255, 204, 0, 0.25)',
            }}
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ffcc00', filter: 'drop-shadow(0 0 4px #ffcc00)' }} />
            <span
              className="text-xs font-bold"
              style={{ color: '#ffcc00', textShadow: '0 0 8px rgba(255,204,0,0.7)' }}
            >
              {totalPoints.toLocaleString()} XP
            </span>
          </div>

          {/* Level + progress */}
          <div className="hidden md:flex flex-col gap-0.5 min-w-0 flex-1 max-w-48">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground truncate uppercase tracking-wider">
                Lvl {xp.level} · {xp.title}
              </span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-4 flex-shrink-0"
                style={{
                  background: 'rgba(0,245,255,0.1)',
                  border: '1px solid rgba(0,245,255,0.25)',
                  color: '#00f5ff',
                }}
              >
                {xp.progress}%
              </Badge>
            </div>
            {/* Custom neon progress bar */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: '#1e1e3f' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${xp.progress}%`,
                  background: 'linear-gradient(90deg, #00f5ff 0%, #bf00ff 100%)',
                  boxShadow: '0 0 6px rgba(0,245,255,0.6)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#0a0a0f] transition-all"
            style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
              boxShadow: '0 0 12px rgba(0,245,255,0.45)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 22px rgba(0,245,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 12px rgba(0,245,255,0.45)')}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Chore</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-md text-muted-foreground hover:text-[#00f5ff] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  )
}
