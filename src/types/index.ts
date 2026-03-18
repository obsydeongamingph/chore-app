export interface Chore {
  id: string
  name: string
  description?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  estimatedMinutes?: number
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  customIntervalDays?: number
  dueDate?: string // ISO string
  lastCompleted?: string // ISO string
  nextDue?: string // ISO string
  streak: number
  totalCompletions: number
  createdAt: string
  isActive: boolean
}

export interface CompletionLog {
  id: string
  choreId: string
  choreName: string
  completedAt: string
  pointsEarned: number
  category: string
  priority: 'low' | 'medium' | 'high'
}

export interface AppState {
  chores: Chore[]
  completionLog: CompletionLog[]
  totalPoints: number
  categories: string[]
  theme: 'light' | 'dark'
}

export interface GroceryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  notes?: string
  checked: boolean
  addedAt: string
}

export type Priority = 'low' | 'medium' | 'high'
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type Theme = 'light' | 'dark'

export interface ChoreFilters {
  category: string
  priority: string
  status: string
  sortBy: string
}
