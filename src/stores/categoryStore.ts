import { defineStore } from 'pinia'
import { ref } from 'vue'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from './authStore'
import type { Category } from '../types/task'

export const useCategoryStore = defineStore('categories', () => {
  const authStore = useAuthStore()
  const categories = ref<Category[]>([])
  const loading = ref(false)

  // Load categories from Firestore or localStorage
  const loadCategories = async () => {
    if (!authStore.user?.id) return

    loading.value = true
    try {
      console.log('Loading categories for user:', authStore.user.id)
      
      if (authStore.user.id === 'guest') {
        // Load from localStorage for guest users
        const stored = localStorage.getItem('guest_categories')
        if (stored) {
          categories.value = JSON.parse(stored)
          console.log('Loaded categories from localStorage:', categories.value.length, 'categories')
        } else {
          console.log('No categories found in localStorage - user needs to create them')
          categories.value = []
        }
      } else {
        // Load from Firestore for authenticated users
        console.log('Loading categories from Firestore')
        const firestoreCategories = await firestoreService.getCategories(authStore.user.id)
        categories.value = firestoreCategories
        console.log('Loaded categories from Firestore:', categories.value.length, 'categories')
      }
      
      console.log('Categories loaded:', categories.value)
    } catch (error) {
      console.error('Error loading categories:', error)
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  // Save guest categories to localStorage
  const saveGuestCategories = () => {
    if (authStore.user?.id === 'guest') {
      localStorage.setItem('guest_categories', JSON.stringify(categories.value))
      console.log('Saved guest categories to localStorage')
    }
  }

  // Actions
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user?.id) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    try {
      console.log('Adding category:', categoryData.name)
      
      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        const newCategory: Category = {
          ...categoryData,
          id: `guest-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        categories.value.push(newCategory)
        saveGuestCategories()
        console.log('Category added for guest user:', newCategory)
        return newCategory
      } else {
        // Handle authenticated users with Firestore
        console.log('Adding category to Firebase:', categoryData)
        const newCategory = await firestoreService.addCategory(authStore.user.id, categoryData)
        if (newCategory) {
          console.log('Category added successfully to Firebase:', newCategory)
          categories.value.push(newCategory)
          return newCategory
        }
        throw new Error('Failed to create category in Firebase')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!authStore.user?.id) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    try {
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) {
        throw new Error('Category not found')
      }

      console.log('Updating category:', id, updates)

      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        categories.value[index] = {
          ...categories.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveGuestCategories()
        console.log('Category updated for guest user:', categories.value[index])
        return categories.value[index]
      } else {
        // Handle authenticated users with Firestore
        console.log('Updating category in Firebase:', id, updates)
        const success = await firestoreService.updateCategory(id, updates)
        if (success) {
          categories.value[index] = {
            ...categories.value[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          console.log('Category updated successfully in Firebase:', categories.value[index])
          return categories.value[index]
        }
        throw new Error('Failed to update category in Firebase')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    if (!authStore.user?.id) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    try {
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) {
        throw new Error('Category not found')
      }

      console.log('Deleting category:', id)

      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        categories.value.splice(index, 1)
        saveGuestCategories()
        console.log('Category deleted for guest user')
        return true
      } else {
        // Handle authenticated users with Firestore
        console.log('Deleting category from Firebase:', id)
        const success = await firestoreService.deleteCategory(id)
        if (success) {
          categories.value.splice(index, 1)
          console.log('Category deleted successfully from Firebase')
          return true
        }
        throw new Error('Failed to delete category from Firebase')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
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

  // Force refresh categories
  const refreshCategories = async () => {
    console.log('Refreshing categories...')
    categories.value = []
    await loadCategories()
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    loadCategories,
    refreshCategories
  }
})