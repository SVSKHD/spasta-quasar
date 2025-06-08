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
import type { Expense, Goal, ExpenseCategory, Budget } from '../types/finance'

export const firestoreService = {
  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    try {
      console.log('Fetching tasks for userId:', userId)
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const tasks = querySnapshot.docs.map(doc => {
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
      
      console.log('Fetched tasks from Firestore:', tasks.length)
      return tasks
    } catch (error) {
      console.error('Error getting tasks:', error)
      return []
    }
  },

  async addTask(userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    try {
      console.log('Adding task to Firestore for userId:', userId)
      const tasksRef = collection(db, 'tasks')
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newTask = {
        id: docRef.id,
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Task added to Firestore:', newTask.id)
      return newTask
    } catch (error) {
      console.error('Error adding task:', error)
      return null
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      console.log('Updating task in Firestore:', taskId)
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('Task updated in Firestore:', taskId)
      return true
    } catch (error) {
      console.error('Error updating task:', error)
      return false
    }
  },

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      console.log('Deleting task from Firestore:', taskId)
      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
      console.log('Task deleted from Firestore:', taskId)
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  },

  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    try {
      console.log('Fetching categories for userId:', userId)
      const categoriesRef = collection(db, 'categories')
      const q = query(
        categoriesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      console.log('Firestore query snapshot size:', querySnapshot.size)
      
      const categories = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Category document data:', { id: doc.id, ...data })
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Category
      })
      
      console.log('Fetched categories from Firestore:', categories.length, categories)
      return categories
    } catch (error) {
      console.error('Error getting categories:', error)
      throw error
    }
  },

  async addCategory(userId: string, categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category | null> {
    try {
      console.log('Adding category to Firestore for userId:', userId, categoryData)
      const categoriesRef = collection(db, 'categories')
      
      const dataToSave = {
        ...categoryData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      console.log('Data being saved to Firestore:', dataToSave)
      const docRef = await addDoc(categoriesRef, dataToSave)
      
      const newCategory = {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Category added to Firestore with ID:', docRef.id, newCategory)
      return newCategory
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  },

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<boolean> {
    try {
      console.log('Updating category in Firestore:', categoryId, updates)
      const categoryRef = doc(db, 'categories', categoryId)
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('Category updated in Firestore:', categoryId)
      return true
    } catch (error) {
      console.error('Error updating category:', error)
      return false
    }
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      console.log('Deleting category from Firestore:', categoryId)
      const categoryRef = doc(db, 'categories', categoryId)
      await deleteDoc(categoryRef)
      console.log('Category deleted from Firestore:', categoryId)
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      return false
    }
  },

  // Expenses
  async getExpenses(userId: string): Promise<Expense[]> {
    try {
      console.log('Fetching expenses for userId:', userId)
      const expensesRef = collection(db, 'expenses')
      const q = query(
        expensesRef, 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const expenses = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Expense
      })
      
      console.log('Fetched expenses from Firestore:', expenses.length)
      return expenses
    } catch (error) {
      console.error('Error getting expenses:', error)
      return []
    }
  },

  async addExpense(userId: string, expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense | null> {
    try {
      console.log('Adding expense to Firestore for userId:', userId)
      const expensesRef = collection(db, 'expenses')
      const docRef = await addDoc(expensesRef, {
        ...expenseData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newExpense = {
        id: docRef.id,
        ...expenseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Expense added to Firestore:', newExpense.id)
      return newExpense
    } catch (error) {
      console.error('Error adding expense:', error)
      return null
    }
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<boolean> {
    try {
      console.log('Updating expense in Firestore:', expenseId)
      const expenseRef = doc(db, 'expenses', expenseId)
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('Expense updated in Firestore:', expenseId)
      return true
    } catch (error) {
      console.error('Error updating expense:', error)
      return false
    }
  },

  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      console.log('Deleting expense from Firestore:', expenseId)
      const expenseRef = doc(db, 'expenses', expenseId)
      await deleteDoc(expenseRef)
      console.log('Expense deleted from Firestore:', expenseId)
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      return false
    }
  },

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    try {
      console.log('Fetching goals for userId:', userId)
      const goalsRef = collection(db, 'goals')
      const q = query(
        goalsRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const goals = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Goal
      })
      
      console.log('Fetched goals from Firestore:', goals.length)
      return goals
    } catch (error) {
      console.error('Error getting goals:', error)
      return []
    }
  },

  async addGoal(userId: string, goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal | null> {
    try {
      console.log('Adding goal to Firestore for userId:', userId)
      const goalsRef = collection(db, 'goals')
      const docRef = await addDoc(goalsRef, {
        ...goalData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newGoal = {
        id: docRef.id,
        ...goalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Goal added to Firestore:', newGoal.id)
      return newGoal
    } catch (error) {
      console.error('Error adding goal:', error)
      return null
    }
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<boolean> {
    try {
      console.log('Updating goal in Firestore:', goalId)
      const goalRef = doc(db, 'goals', goalId)
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('Goal updated in Firestore:', goalId)
      return true
    } catch (error) {
      console.error('Error updating goal:', error)
      return false
    }
  },

  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      console.log('Deleting goal from Firestore:', goalId)
      const goalRef = doc(db, 'goals', goalId)
      await deleteDoc(goalRef)
      console.log('Goal deleted from Firestore:', goalId)
      return true
    } catch (error) {
      console.error('Error deleting goal:', error)
      return false
    }
  },

  // Expense Categories
  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    try {
      console.log('Fetching expense categories for userId:', userId)
      const categoriesRef = collection(db, 'expense_categories')
      const q = query(
        categoriesRef, 
        where('userId', '==', userId),
        orderBy('name', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      const categories = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as ExpenseCategory
      })
      
      console.log('Fetched expense categories from Firestore:', categories.length)
      return categories
    } catch (error) {
      console.error('Error getting expense categories:', error)
      return []
    }
  },

  // Budgets
  async getBudgets(userId: string): Promise<Budget[]> {
    try {
      console.log('Fetching budgets for userId:', userId)
      const budgetsRef = collection(db, 'budgets')
      const q = query(
        budgetsRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const budgets = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Budget
      })
      
      console.log('Fetched budgets from Firestore:', budgets.length)
      return budgets
    } catch (error) {
      console.error('Error getting budgets:', error)
      return []
    }
  },

  // Calendar Tasks
  async getCalendarTasks(userId: string): Promise<any[]> {
    try {
      console.log('Fetching calendar tasks for userId:', userId)
      const tasksRef = collection(db, 'calendar_tasks')
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
      
      console.log('Fetched calendar tasks from Firestore:', tasks.length)
      return tasks
    } catch (error) {
      console.error('Error getting calendar tasks:', error)
      return []
    }
  },

  async addCalendarTask(userId: string, taskData: any): Promise<any | null> {
    try {
      console.log('Adding calendar task to Firestore for userId:', userId)
      const tasksRef = collection(db, 'calendar_tasks')
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newTask = {
        id: docRef.id,
        ...taskData,
        createdAt: new Date().toISOString()
      }
      
      console.log('Calendar task added to Firestore:', newTask.id)
      return newTask
    } catch (error) {
      console.error('Error adding calendar task:', error)
      return null
    }
  },

  async updateCalendarTask(taskId: string, updates: any): Promise<boolean> {
    try {
      console.log('Updating calendar task in Firestore:', taskId)
      const taskRef = doc(db, 'calendar_tasks', taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('Calendar task updated in Firestore:', taskId)
      return true
    } catch (error) {
      console.error('Error updating calendar task:', error)
      return false
    }
  },

  async deleteCalendarTask(taskId: string): Promise<boolean> {
    try {
      console.log('Deleting calendar task from Firestore:', taskId)
      const taskRef = doc(db, 'calendar_tasks', taskId)
      await deleteDoc(taskRef)
      console.log('Calendar task deleted from Firestore:', taskId)
      return true
    } catch (error) {
      console.error('Error deleting calendar task:', error)
      return false
    }
  },

  // Notes
  async getNotes(userId: string): Promise<any[]> {
    try {
      console.log('Fetching notes for userId:', userId)
      const notesRef = collection(db, 'notes')
      const q = query(
        notesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const notes = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
      
      console.log('Fetched notes from Firestore:', notes.length)
      return notes
    } catch (error) {
      console.error('Error getting notes:', error)
      return []
    }
  },

  async addNote(userId: string, noteData: any): Promise<any | null> {
    try {
      console.log('Adding note to Firestore for userId:', userId)
      const notesRef = collection(db, 'notes')
      const docRef = await addDoc(notesRef, {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newNote = {
        id: docRef.id,
        ...noteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Note added to Firestore:', newNote.id)
      return newNote
    } catch (error) {
      console.error('Error adding note:', error)
      return null
    }
  },

  async updateNote(noteId: string, updates: any): Promise<boolean> {
    try {
      console.log('Updating note in Firestore:', noteId)
      const noteRef = doc(db, 'notes', noteId)
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      console.log('Note updated in Firestore:', noteId)
      return true
    } catch (error) {
      console.error('Error updating note:', error)
      return false
    }
  },

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      console.log('Deleting note from Firestore:', noteId)
      const noteRef = doc(db, 'notes', noteId)
      await deleteDoc(noteRef)
      console.log('Note deleted from Firestore:', noteId)
      return true
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  },

  // Note Categories
  async getNoteCategories(userId: string): Promise<any[]> {
    try {
      console.log('Fetching note categories for userId:', userId)
      const categoriesRef = collection(db, 'note_categories')
      const q = query(
        categoriesRef, 
        where('userId', '==', userId),
        orderBy('name', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      const categories = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
      
      console.log('Fetched note categories from Firestore:', categories.length)
      return categories
    } catch (error) {
      console.error('Error getting note categories:', error)
      return []
    }
  },

  async addNoteCategory(userId: string, categoryData: any): Promise<any | null> {
    try {
      console.log('Adding note category to Firestore for userId:', userId)
      const categoriesRef = collection(db, 'note_categories')
      const docRef = await addDoc(categoriesRef, {
        ...categoryData,
        userId,
        createdAt: serverTimestamp()
      })
      
      const newCategory = {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date().toISOString()
      }
      
      console.log('Note category added to Firestore:', newCategory.id)
      return newCategory
    } catch (error) {
      console.error('Error adding note category:', error)
      return null
    }
  },

  async updateNoteCategory(categoryId: string, updates: any): Promise<boolean> {
    try {
      console.log('Updating note category in Firestore:', categoryId)
      const categoryRef = doc(db, 'note_categories', categoryId)
      await updateDoc(categoryRef, updates)
      console.log('Note category updated in Firestore:', categoryId)
      return true
    } catch (error) {
      console.error('Error updating note category:', error)
      return false
    }
  },

  async deleteNoteCategory(categoryId: string): Promise<boolean> {
    try {
      console.log('Deleting note category from Firestore:', categoryId)
      const categoryRef = doc(db, 'note_categories', categoryId)
      await deleteDoc(categoryRef)
      console.log('Note category deleted from Firestore:', categoryId)
      return true
    } catch (error) {
      console.error('Error deleting note category:', error)
      return false
    }
  }
}