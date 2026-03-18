'use client'

import { useState, useEffect, useCallback } from 'react'
import { GroceryItem } from '@/types'
import { getGroceryItems, saveGroceryItems, generateId } from '@/lib/storage'

export const GROCERY_CATEGORIES = [
  { name: 'Produce',        color: '#00ff88' },
  { name: 'Dairy',          color: '#00f5ff' },
  { name: 'Meat & Seafood', color: '#ff0044' },
  { name: 'Bakery',         color: '#ffaa00' },
  { name: 'Frozen',         color: '#4488ff' },
  { name: 'Beverages',      color: '#bf00ff' },
  { name: 'Snacks',         color: '#ff6600' },
  { name: 'Household',      color: '#888888' },
  { name: 'Personal Care',  color: '#ff66cc' },
  { name: 'Other',          color: '#aaaaaa' },
] as const

export const GROCERY_UNITS = [
  'pcs', 'kg', 'g', 'L', 'ml', 'cups', 'oz', 'lb', 'dozen', 'bag', 'box', 'can', 'bottle', 'bunch', 'pack',
]

export function getCategoryColor(category: string): string {
  return GROCERY_CATEGORIES.find(c => c.name === category)?.color ?? '#aaaaaa'
}

export function useGrocery() {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setItems(getGroceryItems())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveGroceryItems(items)
    }
  }, [items, isLoaded])

  const addItem = useCallback((
    data: Omit<GroceryItem, 'id' | 'checked' | 'addedAt'>
  ) => {
    const newItem: GroceryItem = {
      ...data,
      id: generateId(),
      checked: false,
      addedAt: new Date().toISOString(),
    }
    setItems(prev => [...prev, newItem])
    return newItem
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<GroceryItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const toggleCheck = useCallback((id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }, [])

  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.checked))
  }, [])

  const categories = GROCERY_CATEGORIES.map(c => c.name)

  return {
    items,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    toggleCheck,
    clearChecked,
    categories,
  }
}
