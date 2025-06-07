import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '../services/authService'

export interface User {
  id: string
  name: string
  email: string
  picture?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(true)

  const login = async (): Promise<User | null> => {
    try {
      const userData = await authService.signInWithGoogle()
      if (userData) {
        user.value = userData
        isAuthenticated.value = true
        return userData
      }
      return null
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@spasta.com'
    }
    user.value = guestUser
    isAuthenticated.value = true
    return guestUser
  }

  const logout = async () => {
    try {
      if (user.value?.id !== 'guest') {
        await authService.signOut()
      }
      user.value = null
      isAuthenticated.value = false
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const initializeAuth = () => {
    return authService.onAuthStateChanged((userData) => {
      user.value = userData
      isAuthenticated.value = !!userData
      loading.value = false
    })
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    loginAsGuest,
    logout,
    initializeAuth
  }
})