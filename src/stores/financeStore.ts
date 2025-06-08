import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from './authStore'
import type { Expense, Goal, ExpenseCategory, Budget, FinanceStats } from '../types/finance'

export const useFinanceStore = defineStore('finance', () => {
  const authStore = useAuthStore()
  const expenses = ref<Expense[]>([])
  const goals = ref<Goal[]>([])
  const expenseCategories = ref<ExpenseCategory[]>([])
  const budgets = ref<Budget[]>([])
  const loading = ref(false)

  // Load data from Firestore or localStorage
  const loadFinanceData = async () => {
    if (!authStore.user?.id) return

    loading.value = true
    try {
      console.log('Loading finance data for user:', authStore.user.id)
      
      if (authStore.user.id === 'guest') {
        // Load from localStorage for guest users
        loadGuestData()
      } else {
        // Load from Firestore for authenticated users
        await Promise.all([
          loadExpenses(),
          loadGoals(),
          loadExpenseCategories(),
          loadBudgets()
        ])
      }
    } catch (error) {
      console.error('Error loading finance data:', error)
    } finally {
      loading.value = false
    }
  }

  const loadGuestData = () => {
    // Load expenses
    const storedExpenses = localStorage.getItem('guest_expenses')
    if (storedExpenses) {
      expenses.value = JSON.parse(storedExpenses)
    } else {
      expenses.value = getDemoExpenses()
      saveGuestData()
    }

    // Load goals
    const storedGoals = localStorage.getItem('guest_goals')
    if (storedGoals) {
      goals.value = JSON.parse(storedGoals)
    } else {
      goals.value = getDemoGoals()
      saveGuestData()
    }

    // Load expense categories
    const storedCategories = localStorage.getItem('guest_expense_categories')
    if (storedCategories) {
      expenseCategories.value = JSON.parse(storedCategories)
    } else {
      expenseCategories.value = getDefaultExpenseCategories()
      saveGuestData()
    }

    // Load budgets
    const storedBudgets = localStorage.getItem('guest_budgets')
    if (storedBudgets) {
      budgets.value = JSON.parse(storedBudgets)
    } else {
      budgets.value = getDefaultBudgets()
      saveGuestData()
    }
  }

  const saveGuestData = () => {
    if (authStore.user?.id === 'guest') {
      localStorage.setItem('guest_expenses', JSON.stringify(expenses.value))
      localStorage.setItem('guest_goals', JSON.stringify(goals.value))
      localStorage.setItem('guest_expense_categories', JSON.stringify(expenseCategories.value))
      localStorage.setItem('guest_budgets', JSON.stringify(budgets.value))
    }
  }

  const loadExpenses = async () => {
    if (authStore.user?.id && authStore.user.id !== 'guest') {
      expenses.value = await firestoreService.getExpenses(authStore.user.id)
    }
  }

  const loadGoals = async () => {
    if (authStore.user?.id && authStore.user.id !== 'guest') {
      goals.value = await firestoreService.getGoals(authStore.user.id)
    }
  }

  const loadExpenseCategories = async () => {
    if (authStore.user?.id && authStore.user.id !== 'guest') {
      expenseCategories.value = await firestoreService.getExpenseCategories(authStore.user.id)
    }
  }

  const loadBudgets = async () => {
    if (authStore.user?.id && authStore.user.id !== 'guest') {
      budgets.value = await firestoreService.getBudgets(authStore.user.id)
    }
  }

  // Demo data
  const getDemoExpenses = (): Expense[] => {
    const now = new Date()
    return [
      {
        id: '1',
        title: 'Grocery Shopping',
        description: 'Weekly groceries from supermarket',
        amount: 85.50,
        category: 'Food & Dining',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'expense',
        tags: ['groceries', 'weekly'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Salary',
        description: 'Monthly salary payment',
        amount: 5000,
        category: 'Income',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'income',
        tags: ['salary', 'monthly'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Gas Station',
        description: 'Fuel for car',
        amount: 45.00,
        category: 'Transportation',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'expense',
        tags: ['fuel', 'car'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  const getDemoGoals = (): Goal[] => {
    return [
      {
        id: '1',
        title: 'Emergency Fund',
        description: 'Build an emergency fund for unexpected expenses',
        targetAmount: 10000,
        currentAmount: 3500,
        targetDate: '2025-12-31',
        category: 'Savings',
        priority: 'high',
        status: 'active',
        milestones: [
          {
            id: 'm1',
            title: 'First $2,500',
            amount: 2500,
            completed: true,
            completedAt: '2024-12-01T00:00:00Z',
            createdAt: new Date().toISOString()
          },
          {
            id: 'm2',
            title: 'Reach $5,000',
            amount: 5000,
            completed: false,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Vacation Fund',
        description: 'Save for summer vacation to Europe',
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: '2025-06-01',
        category: 'Travel',
        priority: 'medium',
        status: 'active',
        milestones: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  const getDefaultExpenseCategories = (): ExpenseCategory[] => {
    return [
      { id: '1', name: 'Food & Dining', icon: 'restaurant', color: 'orange', budget: 500, createdAt: new Date().toISOString() },
      { id: '2', name: 'Transportation', icon: 'directions_car', color: 'blue', budget: 300, createdAt: new Date().toISOString() },
      { id: '3', name: 'Shopping', icon: 'shopping_cart', color: 'purple', budget: 200, createdAt: new Date().toISOString() },
      { id: '4', name: 'Entertainment', icon: 'movie', color: 'pink', budget: 150, createdAt: new Date().toISOString() },
      { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: 'red', budget: 800, createdAt: new Date().toISOString() },
      { id: '6', name: 'Healthcare', icon: 'local_hospital', color: 'green', budget: 200, createdAt: new Date().toISOString() },
      { id: '7', name: 'Income', icon: 'attach_money', color: 'positive', createdAt: new Date().toISOString() }
    ]
  }

  const getDefaultBudgets = (): Budget[] => {
    return [
      {
        id: '1',
        category: 'Food & Dining',
        amount: 500,
        period: 'monthly',
        spent: 285.50,
        remaining: 214.50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        category: 'Transportation',
        amount: 300,
        period: 'monthly',
        spent: 145.00,
        remaining: 155.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  // Computed properties
  const financeStats = computed((): FinanceStats => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyExpenses = expenses.value
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return expense.type === 'expense' && 
               expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const monthlyIncome = expenses.value
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return expense.type === 'income' && 
               expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const totalExpenses = expenses.value
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0)

    const totalIncome = expenses.value
      .filter(expense => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0)

    const netIncome = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    const totalBudget = budgets.value.reduce((sum, budget) => sum + budget.amount, 0)
    const budgetUtilization = totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0

    const activeGoals = goals.value.filter(goal => goal.status === 'active')
    const goalsProgress = activeGoals.length > 0 
      ? activeGoals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount), 0) / activeGoals.length * 100
      : 0

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      monthlyIncome,
      monthlyExpenses,
      budgetUtilization,
      goalsProgress,
      savingsRate
    }
  })

  const expensesByCategory = computed(() => {
    const categoryTotals: Record<string, number> = {}
    expenses.value
      .filter(expense => expense.type === 'expense')
      .forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
      })
    return categoryTotals
  })

  const recentExpenses = computed(() => {
    return expenses.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  })

  const activeGoals = computed(() => {
    return goals.value.filter(goal => goal.status === 'active')
  })

  // Actions
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user?.id) return null

    try {
      if (authStore.user.id === 'guest') {
        const newExpense: Expense = {
          ...expenseData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        expenses.value.push(newExpense)
        saveGuestData()
        return newExpense
      } else {
        const newExpense = await firestoreService.addExpense(authStore.user.id, expenseData)
        if (newExpense) {
          expenses.value.push(newExpense)
        }
        return newExpense
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      return null
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const index = expenses.value.findIndex(expense => expense.id === id)
      if (index === -1) return null

      if (authStore.user?.id === 'guest') {
        expenses.value[index] = {
          ...expenses.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveGuestData()
        return expenses.value[index]
      } else {
        const success = await firestoreService.updateExpense(id, updates)
        if (success) {
          expenses.value[index] = {
            ...expenses.value[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return expenses.value[index]
        }
        return null
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      return null
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const index = expenses.value.findIndex(expense => expense.id === id)
      if (index === -1) return false

      if (authStore.user?.id === 'guest') {
        expenses.value.splice(index, 1)
        saveGuestData()
        return true
      } else {
        const success = await firestoreService.deleteExpense(id)
        if (success) {
          expenses.value.splice(index, 1)
        }
        return success
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      return false
    }
  }

  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user?.id) return null

    try {
      if (authStore.user.id === 'guest') {
        const newGoal: Goal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        goals.value.push(newGoal)
        saveGuestData()
        return newGoal
      } else {
        const newGoal = await firestoreService.addGoal(authStore.user.id, goalData)
        if (newGoal) {
          goals.value.push(newGoal)
        }
        return newGoal
      }
    } catch (error) {
      console.error('Error adding goal:', error)
      return null
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const index = goals.value.findIndex(goal => goal.id === id)
      if (index === -1) return null

      if (authStore.user?.id === 'guest') {
        goals.value[index] = {
          ...goals.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveGuestData()
        return goals.value[index]
      } else {
        const success = await firestoreService.updateGoal(id, updates)
        if (success) {
          goals.value[index] = {
            ...goals.value[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return goals.value[index]
        }
        return null
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      return null
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const index = goals.value.findIndex(goal => goal.id === id)
      if (index === -1) return false

      if (authStore.user?.id === 'guest') {
        goals.value.splice(index, 1)
        saveGuestData()
        return true
      } else {
        const success = await firestoreService.deleteGoal(id)
        if (success) {
          goals.value.splice(index, 1)
        }
        return success
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      return false
    }
  }

  const addGoalContribution = async (goalId: string, amount: number) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return false

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    const updates: Partial<Goal> = { currentAmount: newAmount }

    if (newAmount >= goal.targetAmount && goal.status !== 'completed') {
      updates.status = 'completed'
    }

    return updateGoal(goalId, updates)
  }

  return {
    expenses,
    goals,
    expenseCategories,
    budgets,
    loading,
    financeStats,
    expensesByCategory,
    recentExpenses,
    activeGoals,
    loadFinanceData,
    addExpense,
    updateExpense,
    deleteExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalContribution
  }
})