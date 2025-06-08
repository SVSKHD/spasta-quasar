import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from './authStore'
import type { Category, CategoryStatus } from '../types/task'

export const useCategoryStore = defineStore('categories', () => {
  const authStore = useAuthStore()
  const categories = ref<Category[]>([])
  const loading = ref(false)

  // Load categories from Firestore or localStorage
  const loadCategories = async () => {
    if (!authStore.user?.id) return

    loading.value = true
    try {
      if (authStore.user.id === 'guest') {
        // Load from localStorage for guest users
        const stored = localStorage.getItem('guest_categories')
        if (stored) {
          categories.value = JSON.parse(stored)
        } else {
          // Add default categories for guest
          categories.value = getDefaultCategories()
          saveGuestCategories()
        }
      } else {
        // Load from Firestore for authenticated users
        const firestoreCategories = await firestoreService.getCategories(authStore.user.id)
        if (firestoreCategories.length === 0) {
          // Add default categories if none exist
          const defaultCategories = getDefaultCategories()
          for (const categoryData of defaultCategories) {
            const newCategory = await firestoreService.addCategory(authStore.user.id, categoryData)
            if (newCategory) {
              categories.value.push(newCategory)
            }
          }
        } else {
          categories.value = firestoreCategories
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      loading.value = false
    }
  }

  // Save guest categories to localStorage
  const saveGuestCategories = () => {
    if (authStore.user?.id === 'guest') {
      localStorage.setItem('guest_categories', JSON.stringify(categories.value))
    }
  }

  // Get default categories
  const getDefaultCategories = (): Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] => {
    return [
      {
        name: 'Development',
        description: 'Software development tasks',
        icon: 'code',
        color: 'primary',
        statuses: [
          { id: '1', name: 'todo', label: 'To Do', color: 'grey', icon: 'radio_button_unchecked', order: 1 },
          { id: '2', name: 'in-progress', label: 'In Progress', color: 'primary', icon: 'hourglass_empty', order: 2 },
          { id: '3', name: 'review', label: 'Code Review', color: 'warning', icon: 'rate_review', order: 3 },
          { id: '4', name: 'done', label: 'Done', color: 'positive', icon: 'check_circle', order: 4 }
        ]
      },
      {
        name: 'Design',
        description: 'UI/UX design tasks',
        icon: 'palette',
        color: 'purple',
        statuses: [
          { id: '5', name: 'todo', label: 'To Do', color: 'grey', icon: 'radio_button_unchecked', order: 1 },
          { id: '6', name: 'wireframe', label: 'Wireframe', color: 'info', icon: 'crop_landscape', order: 2 },
          { id: '7', name: 'design', label: 'Design', color: 'purple', icon: 'brush', order: 3 },
          { id: '8', name: 'done', label: 'Done', color: 'positive', icon: 'check_circle', order: 4 }
        ]
      },
      {
        name: 'Marketing',
        description: 'Marketing and promotion tasks',
        icon: 'campaign',
        color: 'orange',
        statuses: [
          { id: '9', name: 'todo', label: 'To Do', color: 'grey', icon: 'radio_button_unchecked', order: 1 },
          { id: '10', name: 'planning', label: 'Planning', color: 'info', icon: 'event_note', order: 2 },
          { id: '11', name: 'execution', label: 'Execution', color: 'orange', icon: 'play_arrow', order: 3 },
          { id: '12', name: 'done', label: 'Done', color: 'positive', icon: 'check_circle', order: 4 }
        ]
      }
    ]
  }

  // Actions
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user?.id) return null

    loading.value = true
    try {
      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        categories.value.push(newCategory)
        saveGuestCategories()
        return newCategory
      } else {
        // Handle authenticated users with Firestore
        const newCategory = await firestoreService.addCategory(authStore.user.id, categoryData)
        if (newCategory) {
          categories.value.push(newCategory)
          return newCategory
        }
        return null
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!authStore.user?.id) return null

    loading.value = true
    try {
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) return null

      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        categories.value[index] = {
          ...categories.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveGuestCategories()
        return categories.value[index]
      } else {
        // Handle authenticated users with Firestore
        const success = await firestoreService.updateCategory(id, updates)
        if (success) {
          categories.value[index] = {
            ...categories.value[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return categories.value[index]
        }
        return null
      }
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    if (!authStore.user?.id) return false

    loading.value = true
    try {
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) return false

      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        categories.value.splice(index, 1)
        saveGuestCategories()
        return true
      } else {
        // Handle authenticated users with Firestore
        const success = await firestoreService.deleteCategory(id)
        if (success) {
          categories.value.splice(index, 1)
        }
        return success
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const getCategoryById = (id: string) => {
    return categories.value.find(category => category.id === id)
  }

  const getCategoryByName = (name: string) => {
    return categories.value.find(category => category.name === name)
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    loadCategories
  }
})