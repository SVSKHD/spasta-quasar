import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../firebase/config'
import type { User } from '../stores/authStore'

const googleProvider = new GoogleAuthProvider()

export const authService = {
  // Sign in with Google popup
  async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      return {
        id: user.uid,
        name: user.displayName || 'Unknown User',
        email: user.email || '',
        picture: user.photoURL || undefined
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  },

  // Sign in with Google redirect
  async signInWithRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, googleProvider)
    } catch (error) {
      console.error('Google redirect sign-in error:', error)
      throw error
    }
  },

  // Get redirect result
  async getRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(auth)
      if (result?.user) {
        const user = result.user
        return {
          id: user.uid,
          name: user.displayName || 'Unknown User',
          email: user.email || '',
          picture: user.photoURL || undefined
        }
      }
      return null
    } catch (error) {
      console.error('Get redirect result error:', error)
      throw error
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign-out error:', error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Unknown User',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || undefined
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  },

  // Get current user
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Unknown User',
        email: firebaseUser.email || '',
        picture: firebaseUser.photoURL || undefined
      }
    }
    return null
  }
}