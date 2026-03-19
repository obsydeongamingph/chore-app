'use client'

import { Moon, Sun, Plus, Menu } from 'lucide-react'
import { useChoresContext } from '@/components/providers/ChoresProvider'
import { QuickAdd } from '@/components/chores/QuickAdd'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/chores': 'All Chores',
  '/history': 'History',
  '/stats': 'Statistics',
  '/grocery': 'Grocery',
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useChoresContext()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'ChoreApp'

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

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.5)' }}
          >
            {title}
          </span>
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
