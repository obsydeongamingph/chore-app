'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useChores } from '@/hooks/useChores'
import { Theme } from '@/types'

type ChoresContextType = ReturnType<typeof useChores>

const ChoresContext = createContext<ChoresContextType | null>(null)

export function ChoresProvider({ children }: { children: ReactNode }) {
  const chores = useChores()

  // Apply theme to document
  useEffect(() => {
    if (!chores.isLoaded) return
    const root = document.documentElement
    if (chores.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [chores.theme, chores.isLoaded])

  return (
    <ChoresContext.Provider value={chores}>
      {children}
    </ChoresContext.Provider>
  )
}

export function useChoresContext() {
  const ctx = useContext(ChoresContext)
  if (!ctx) throw new Error('useChoresContext must be used within ChoresProvider')
  return ctx
}
