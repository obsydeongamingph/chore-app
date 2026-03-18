'use client'

import { Moon, Sun, Plus, Menu, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
      <header className="sticky top-0 z-10 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center gap-3 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* XP display */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="hidden sm:flex items-center gap-2 bg-accent/50 rounded-full px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-foreground">{totalPoints.toLocaleString()} XP</span>
          </div>
          <div className="hidden md:flex flex-col gap-0.5 min-w-0 flex-1 max-w-48">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground truncate">Lvl {xp.level} · {xp.title}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 flex-shrink-0">
                {xp.progress}%
              </Badge>
            </div>
            <Progress value={xp.progress} className="h-1.5" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setQuickAddOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Chore</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-muted-foreground"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  )
}
