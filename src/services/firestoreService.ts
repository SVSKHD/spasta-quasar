import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Task, Category } from '../types/task'

export const firestoreService = {
  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          dueDate: data.dueDate || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined
        } as Task
      })
    } catch (error) {
      console.error('Error getting tasks:', error)
      return []
    }
  },

  async addTask(userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    try {
      const tasksRef = collection(db, 'tasks')
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return {
        id: docRef.id,
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error adding task:', error)
      return null
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error updating task:', error)
      return false
    }
  },

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  },

  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, 'categories')
      const q = query(
        categoriesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Category
      })
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  },

  async addCategory(userId: string, categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category | null> {
    try {
      const categoriesRef = collection(db, 'categories')
      const docRef = await addDoc(categoriesRef, {
        ...categoryData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error adding category:', error)
      return null
    }
  },

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<boolean> {
    try {
      const categoryRef = doc(db, 'categories', categoryId)
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error updating category:', error)
      return false
    }
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const categoryRef = doc(db, 'categories', categoryId)
      await deleteDoc(categoryRef)
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      return false
    }
  },

  // Calendar Tasks
  async getCalendarTasks(userId: string): Promise<any[]> {
    try {
      const tasksRef = collection(db, 'calendar_tasks')
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error getting calendar tasks:', error)
      return []
    }
  },

  async addCalendarTask(userId: string, taskData: any): Promise<any | null> {
    try {
      const tasksRef = collection(db, 'calendar_tasks')
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        userId,
        createdAt: serverTimestamp()
      })
      
      return {
        id: docRef.id,
        ...taskData,
        createdAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error adding calendar task:', error)
      return null
    }
  },

  async updateCalendarTask(taskId: string, updates: any): Promise<boolean> {
    try {
      const taskRef = doc(db, 'calendar_tasks', taskId)
      await updateDoc(taskRef, updates)
      return true
    } catch (error) {
      console.error('Error updating calendar task:', error)
      return false
    }
  },

  async deleteCalendarTask(taskId: string): Promise<boolean> {
    try {
      const taskRef = doc(db, 'calendar_tasks', taskId)
      await deleteDoc(taskRef)
      return true
    } catch (error) {
      console.error('Error deleting calendar task:', error)
      return false
    }
  },

  // Notes
  async getNotes(userId: string): Promise<any[]> {
    try {
      const notesRef = collection(db, 'notes')
      const q = query(
        notesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error getting notes:', error)
      return []
    }
  },

  async addNote(userId: string, noteData: any): Promise<any | null> {
    try {
      const notesRef = collection(db, 'notes')
      const docRef = await addDoc(notesRef, {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return {
        id: docRef.id,
        ...noteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error adding note:', error)
      return null
    }
  },

  async updateNote(noteId: string, updates: any): Promise<boolean> {
    try {
      const noteRef = doc(db, 'notes', noteId)
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error updating note:', error)
      return false
    }
  },

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const noteRef = doc(db, 'notes', noteId)
      await deleteDoc(noteRef)
      return true
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  },

  // Note Categories
  async getNoteCategories(userId: string): Promise<any[]> {
    try {
      const categoriesRef = collection(db, 'note_categories')
      const q = query(
        categoriesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error getting note categories:', error)
      return []
    }
  },

  async addNoteCategory(userId: string, categoryData: any): Promise<any | null> {
    try {
      const categoriesRef = collection(db, 'note_categories')
      const docRef = await addDoc(categoriesRef, {
        ...categoryData,
        userId,
        createdAt: serverTimestamp()
      })
      
      return {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error adding note category:', error)
      return null
    }
  },

  async updateNoteCategory(categoryId: string, updates: any): Promise<boolean> {
    try {
      const categoryRef = doc(db, 'note_categories', categoryId)
      await updateDoc(categoryRef, updates)
      return true
    } catch (error) {
      console.error('Error updating note category:', error)
      return false
    }
  },

  async deleteNoteCategory(categoryId: string): Promise<boolean> {
    try {
      const categoryRef = doc(db, 'note_categories', categoryId)
      await deleteDoc(categoryRef)
      return true
    } catch (error) {
      console.error('Error deleting note category:', error)
      return false
    }
  }
}