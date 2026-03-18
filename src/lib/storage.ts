import { AppState, Chore, CompletionLog } from '@/types'

const STORAGE_KEY = 'chore-app-state'

const DEFAULT_CATEGORIES = [
  'Kitchen',
  'Bathroom',
  'Bedroom',
  'Living Room',
  'Outdoor',
  'Laundry',
  'Office',
  'General',
]

const DEFAULT_STATE: AppState = {
  chores: [],
  completionLog: [],
  totalPoints: 0,
  categories: DEFAULT_CATEGORIES,
  theme: 'light',
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      chores: parsed.chores ?? [],
      completionLog: parsed.completionLog ?? [],
      totalPoints: parsed.totalPoints ?? 0,
      categories: parsed.categories ?? DEFAULT_CATEGORIES,
      theme: parsed.theme ?? 'light',
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    console.error('Failed to save state')
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getDefaultCategories(): string[] {
  return DEFAULT_CATEGORIES
}

export function isFreshInstall(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === null
}

export function seedSampleData(): AppState {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const threeDays = new Date(today)
  threeDays.setDate(threeDays.getDate() + 3)

  const sampleChores = [
    {
      id: generateId(),
      name: 'Wash the dishes',
      description: 'Wash, rinse, and put away all dishes',
      category: 'Kitchen',
      priority: 'medium' as const,
      estimatedMinutes: 15,
      recurrence: 'daily' as const,
      nextDue: today.toISOString(),
      streak: 3,
      totalCompletions: 12,
      createdAt: yesterday.toISOString(),
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Vacuum living room',
      category: 'Living Room',
      priority: 'low' as const,
      estimatedMinutes: 20,
      recurrence: 'weekly' as const,
      nextDue: today.toISOString(),
      streak: 1,
      totalCompletions: 4,
      createdAt: yesterday.toISOString(),
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Clean bathroom',
      description: 'Scrub toilet, sink, and shower',
      category: 'Bathroom',
      priority: 'high' as const,
      estimatedMinutes: 30,
      recurrence: 'weekly' as const,
      nextDue: yesterday.toISOString(),
      streak: 0,
      totalCompletions: 5,
      createdAt: yesterday.toISOString(),
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Take out trash',
      category: 'General',
      priority: 'medium' as const,
      estimatedMinutes: 5,
      recurrence: 'weekly' as const,
      nextDue: tomorrow.toISOString(),
      streak: 2,
      totalCompletions: 8,
      createdAt: yesterday.toISOString(),
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Do laundry',
      description: 'Wash, dry and fold clothes',
      category: 'Laundry',
      priority: 'medium' as const,
      estimatedMinutes: 60,
      recurrence: 'weekly' as const,
      nextDue: threeDays.toISOString(),
      streak: 0,
      totalCompletions: 3,
      createdAt: yesterday.toISOString(),
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Mow the lawn',
      category: 'Outdoor',
      priority: 'low' as const,
      estimatedMinutes: 45,
      recurrence: 'custom' as const,
      customIntervalDays: 14,
      nextDue: threeDays.toISOString(),
      streak: 1,
      totalCompletions: 2,
      createdAt: yesterday.toISOString(),
      isActive: true,
    },
  ]

  const state: AppState = {
    chores: sampleChores,
    completionLog: [],
    totalPoints: 45,
    categories: DEFAULT_CATEGORIES,
    theme: 'light',
  }

  saveState(state)
  return state
}
