export interface Expense {
  id: string
  title: string
  description?: string
  amount: number
  category: string
  date: string
  type: 'expense' | 'income'
  tags: string[]
  receipt?: string
  recurring?: ExpenseRecurrence
  createdAt: string
  updatedAt: string
}

export interface ExpenseRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
}

export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
  budget?: number
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  milestones: GoalMilestone[]
  createdAt: string
  updatedAt: string
}

export interface GoalMilestone {
  id: string
  title: string
  amount: number
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  spent: number
  remaining: number
  createdAt: string
  updatedAt: string
}

export interface FinanceStats {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  monthlyIncome: number
  monthlyExpenses: number
  budgetUtilization: number
  goalsProgress: number
  savingsRate: number
}