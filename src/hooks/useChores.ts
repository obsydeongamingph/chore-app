'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppState, Chore, CompletionLog, Theme } from '@/types'
import { loadState, saveState, generateId, isFreshInstall, seedSampleData } from '@/lib/storage'
import { calculateNextDue } from '@/lib/chore-utils'
import { calculatePoints } from '@/lib/points'
import { startOfDay } from 'date-fns'

export function useChores() {
  const [state, setState] = useState<AppState>(() => ({
    chores: [],
    completionLog: [],
    totalPoints: 0,
    categories: [],
    theme: 'dark',
  }))
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (isFreshInstall()) {
      const seeded = seedSampleData()
      setState(seeded)
    } else {
      const loaded = loadState()
      setState(loaded)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  const addChore = useCallback((choreData: Omit<Chore, 'id' | 'streak' | 'totalCompletions' | 'createdAt' | 'isActive'>) => {
    const newChore: Chore = {
      ...choreData,
      id: generateId(),
      streak: 0,
      totalCompletions: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    setState(prev => ({ ...prev, chores: [...prev.chores, newChore] }))
    return newChore
  }, [])

  const updateChore = useCallback((id: string, updates: Partial<Chore>) => {
    setState(prev => ({
      ...prev,
      chores: prev.chores.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }, [])

  const deleteChore = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      chores: prev.chores.filter(c => c.id !== id),
    }))
  }, [])

  const completeChore = useCallback((id: string) => {
    setState(prev => {
      const chore = prev.chores.find(c => c.id === id)
      if (!chore) return prev

      const now = new Date()
      const today = startOfDay(now)

      // Check if already completed today
      const alreadyCompletedToday = prev.completionLog.some(log => {
        if (log.choreId !== id) return false
        const logDate = startOfDay(new Date(log.completedAt))
        return logDate.getTime() === today.getTime()
      })

      if (alreadyCompletedToday) return prev

      const newStreak = chore.streak + 1
      const points = calculatePoints(chore.priority, newStreak)

      const nextDue = chore.recurrence !== 'none'
        ? calculateNextDue(chore, now)
        : chore.dueDate

      const updatedChore: Chore = {
        ...chore,
        streak: newStreak,
        totalCompletions: chore.totalCompletions + 1,
        lastCompleted: now.toISOString(),
        nextDue,
      }

      const logEntry: CompletionLog = {
        id: generateId(),
        choreId: id,
        choreName: chore.name,
        completedAt: now.toISOString(),
        pointsEarned: points,
        category: chore.category,
        priority: chore.priority,
      }

      return {
        ...prev,
        chores: prev.chores.map(c => c.id === id ? updatedChore : c),
        completionLog: [logEntry, ...prev.completionLog],
        totalPoints: prev.totalPoints + points,
      }
    })
  }, [])

  const undoComplete = useCallback((choreId: string) => {
    setState(prev => {
      const lastLog = prev.completionLog.find(log => log.choreId === choreId)
      if (!lastLog) return prev

      const chore = prev.chores.find(c => c.id === choreId)
      if (!chore) return prev

      const updatedChore: Chore = {
        ...chore,
        streak: Math.max(0, chore.streak - 1),
        totalCompletions: Math.max(0, chore.totalCompletions - 1),
        lastCompleted: undefined,
        nextDue: chore.dueDate,
      }

      return {
        ...prev,
        chores: prev.chores.map(c => c.id === choreId ? updatedChore : c),
        completionLog: prev.completionLog.filter(log => log.id !== lastLog.id),
        totalPoints: Math.max(0, prev.totalPoints - lastLog.pointsEarned),
      }
    })
  }, [])

  const addCategory = useCallback((category: string) => {
    setState(prev => {
      if (prev.categories.includes(category)) return prev
      return { ...prev, categories: [...prev.categories, category] }
    })
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }))
  }, [])

  const isCompletedToday = useCallback((choreId: string): boolean => {
    const today = startOfDay(new Date())
    return state.completionLog.some(log => {
      if (log.choreId !== choreId) return false
      const logDate = startOfDay(new Date(log.completedAt))
      return logDate.getTime() === today.getTime()
    })
  }, [state.completionLog])

  const getBestStreak = useCallback((): number => {
    return state.chores.reduce((max, c) => Math.max(max, c.streak), 0)
  }, [state.chores])

  const getCompletedTodayCount = useCallback((): number => {
    const today = startOfDay(new Date())
    const ids = new Set(
      state.completionLog
        .filter(log => startOfDay(new Date(log.completedAt)).getTime() === today.getTime())
        .map(log => log.choreId)
    )
    return ids.size
  }, [state.completionLog])

  return {
    chores: state.chores,
    completionLog: state.completionLog,
    totalPoints: state.totalPoints,
    categories: state.categories,
    theme: state.theme,
    isLoaded,
    addChore,
    updateChore,
    deleteChore,
    completeChore,
    undoComplete,
    addCategory,
    setTheme,
    isCompletedToday,
    getBestStreak,
    getCompletedTodayCount,
  }
}
