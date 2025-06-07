export interface Task {
  id: string
  title: string
  description: string
  status: string // Changed from TaskStatus to allow custom statuses
  priority: TaskPriority
  category: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  subtasks: Subtask[]
  assignedTo?: TaskAssignee
  photoUrl?: string
  // Calendar specific fields
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  isRecurring?: boolean
  recurrence?: TaskRecurrence
}

export interface TaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  weekDays: number[]
  endDate?: string
}

export interface TaskAssignee {
  id: string
  name: string
  email: string
  photoUrl?: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  statuses: CategoryStatus[]
  createdAt: string
  updatedAt: string
}

export interface CategoryStatus {
  id: string
  name: string
  label: string
  color: string
  icon: string
  order: number
}

export interface TaskFilter {
  search: string
  status?: string
  priority?: TaskPriority
  category?: string
  tag?: string
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  done: number
  overdue: number
}