import { Priority } from '@/types'

const BASE_POINTS: Record<Priority, number> = {
  low: 5,
  medium: 10,
  high: 20,
}

const MAX_STREAK_BONUS = 20
const STREAK_BONUS_PER_LEVEL = 2

export function calculatePoints(priority: Priority, streak: number): number {
  const base = BASE_POINTS[priority]
  const streakBonus = Math.min(streak * STREAK_BONUS_PER_LEVEL, MAX_STREAK_BONUS)
  return base + streakBonus
}

export function getXPLevel(totalPoints: number): { level: number; title: string; nextLevelPoints: number; progress: number } {
  const levels = [
    { threshold: 0, title: 'Novice' },
    { threshold: 50, title: 'Apprentice' },
    { threshold: 150, title: 'Helper' },
    { threshold: 300, title: 'Worker' },
    { threshold: 500, title: 'Expert' },
    { threshold: 800, title: 'Master' },
    { threshold: 1200, title: 'Champion' },
    { threshold: 2000, title: 'Legend' },
  ]

  let level = 0
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].threshold) {
      level = i
      break
    }
  }

  const current = levels[level]
  const next = levels[Math.min(level + 1, levels.length - 1)]
  const pointsInLevel = totalPoints - current.threshold
  const pointsNeeded = next.threshold - current.threshold
  const progress = level === levels.length - 1 ? 100 : Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100))

  return {
    level: level + 1,
    title: current.title,
    nextLevelPoints: next.threshold,
    progress,
  }
}
