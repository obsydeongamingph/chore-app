'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListTodo,
  History,
  BarChart3,
  Zap,
  X,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chores', label: 'All Chores', icon: ListTodo },
  { href: '/history', label: 'History', icon: History },
  { href: '/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/grocery', label: 'Grocery', icon: ShoppingCart },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ open, onClose, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-30 flex flex-col w-64',
          'transition-all duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:relative lg:z-auto',
          collapsed ? 'lg:w-16' : 'lg:w-64',
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(8,8,18,0.72) 0%, rgba(10,10,24,0.72) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid #1e1e3f',
          boxShadow: '2px 0 20px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center h-16 shrink-0',
            collapsed ? 'lg:justify-center px-3' : 'justify-between px-5'
          )}
          style={{ borderBottom: '1px solid #1e1e3f' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
                boxShadow: '0 0 14px rgba(0,245,255,0.6)',
              }}
            >
              <Zap className="w-4 h-4 text-[#0a0a0f]" />
            </div>
            <span
              className={cn(
                'font-bold text-lg tracking-widest uppercase transition-all duration-200',
                collapsed && 'lg:hidden'
              )}
              style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.7)' }}
            >
              ChoreApp
            </span>
          </div>
          <button
            onClick={onClose}
            className={cn('p-1 rounded-md text-muted-foreground hover:text-[#00f5ff] transition-colors lg:hidden')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className={cn('flex-1 space-y-1', collapsed ? 'lg:p-2 p-4' : 'p-4')}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 uppercase tracking-wider',
                  collapsed && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'text-[#0a0a0f]'
                    : 'text-muted-foreground hover:text-[#00f5ff]'
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 100%)',
                  boxShadow: '0 0 14px rgba(0,245,255,0.45)',
                } : {}}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={cn('transition-all duration-200', collapsed && 'lg:hidden')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop toggle button */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center p-3 text-muted-foreground hover:text-[#00f5ff] transition-colors shrink-0"
          style={{ borderTop: '1px solid #1e1e3f' }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>

        {/* Footer (expanded only) */}
        <div
          className={cn('p-4 shrink-0', collapsed && 'lg:hidden')}
          style={{ borderTop: collapsed ? undefined : '1px solid #1e1e3f' }}
        >
          <p className="text-xs text-muted-foreground text-center uppercase tracking-widest">
            Level up your space
          </p>
          <div
            className="mt-3 h-[1px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #00f5ff66, transparent)' }}
          />
        </div>
      </aside>
    </>
  )
}
