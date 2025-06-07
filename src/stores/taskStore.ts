import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from './authStore'
import type { Task, TaskStatus, TaskPriority, TaskFilter, TaskStats, Subtask } from '../types/task'

export const useTaskStore = defineStore('tasks', () => {
  const authStore = useAuthStore()
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const filter = ref<TaskFilter>({
    search: '',
    status: undefined,
    priority: undefined,
    category: undefined,
    tag: undefined
  })

  // Load tasks from Firestore or localStorage
  const loadTasks = async () => {
    if (!authStore.user?.id) return

    loading.value = true
    try {
      if (authStore.user.id === 'guest') {
        // Load from localStorage for guest users
        const stored = localStorage.getItem('guest_tasks')
        if (stored) {
          tasks.value = JSON.parse(stored)
        } else {
          // Add demo tasks for guest
          tasks.value = [
            {
              id: '1',
              title: 'Design new dashboard',
              description: 'Create wireframes and mockups for the new analytics dashboard',
              status: 'in-progress',
              priority: 'high',
              category: 'Design',
              dueDate: '2025-02-15',
              createdAt: '2025-01-01T10:00:00Z',
              updatedAt: '2025-01-10T14:30:00Z',
              tags: ['ui', 'wireframes', 'analytics'],
              photoUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
              assignedTo: {
                id: 'user1',
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                photoUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
              },
              subtasks: [
                { id: 's1', title: 'Create user personas', completed: true, createdAt: '2025-01-01T10:00:00Z' },
                { id: 's2', title: 'Design wireframes', completed: true, createdAt: '2025-01-01T10:00:00Z' },
                { id: 's3', title: 'Create high-fidelity mockups', completed: false, createdAt: '2025-01-01T10:00:00Z' },
                { id: 's4', title: 'User testing', completed: false, createdAt: '2025-01-01T10:00:00Z' }
              ]
            },
            {
              id: '2',
              title: 'Implement user authentication',
              description: 'Set up Firebase authentication with Google sign-in',
              status: 'todo',
              priority: 'high',
              category: 'Development',
              dueDate: '2025-02-20',
              createdAt: '2025-01-05T09:00:00Z',
              updatedAt: '2025-01-05T09:00:00Z',
              tags: ['auth', 'firebase', 'backend'],
              photoUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400',
              assignedTo: {
                id: 'user2',
                name: 'Mike Chen',
                email: 'mike@example.com'
              },
              subtasks: [
                { id: 's5', title: 'Setup Firebase project', completed: false, createdAt: '2025-01-05T09:00:00Z' },
                { id: 's6', title: 'Configure Google OAuth', completed: false, createdAt: '2025-01-05T09:00:00Z' },
                { id: 's7', title: 'Implement login flow', completed: false, createdAt: '2025-01-05T09:00:00Z' }
              ]
            },
            {
              id: '3',
              title: 'Write API documentation',
              description: 'Document all REST endpoints with examples and response schemas',
              status: 'done',
              priority: 'medium',
              category: 'Documentation',
              createdAt: '2024-12-20T08:00:00Z',
              updatedAt: '2025-01-08T16:45:00Z',
              tags: ['docs', 'api', 'swagger'],
              assignedTo: {
                id: 'user3',
                name: 'Alex Rivera',
                email: 'alex@example.com',
                photoUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
              },
              subtasks: [
                { id: 's8', title: 'Document authentication endpoints', completed: true, createdAt: '2024-12-20T08:00:00Z' },
                { id: 's9', title: 'Document user management endpoints', completed: true, createdAt: '2024-12-20T08:00:00Z' },
                { id: 's10', title: 'Add code examples', completed: true, createdAt: '2024-12-20T08:00:00Z' }
              ]
            }
          ]
          saveGuestTasks()
        }
      } else {
        // Load from Firestore for authenticated users
        tasks.value = await firestoreService.getTasks(authStore.user.id)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      loading.value = false
    }
  }

  // Save guest tasks to localStorage
  const saveGuestTasks = () => {
    if (authStore.user?.id === 'guest') {
      localStorage.setItem('guest_tasks', JSON.stringify(tasks.value))
    }
  }

  // Computed properties
  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      if (filter.value.search && !task.title.toLowerCase().includes(filter.value.search.toLowerCase()) && 
          !task.description.toLowerCase().includes(filter.value.search.toLowerCase())) {
        return false
      }
      if (filter.value.status && task.status !== filter.value.status) {
        return false
      }
      if (filter.value.priority && task.priority !== filter.value.priority) {
        return false
      }
      if (filter.value.category && task.category !== filter.value.category) {
        return false
      }
      if (filter.value.tag && !task.tags.includes(filter.value.tag)) {
        return false
      }
      return true
    })
  })

  const tasksByStatus = computed(() => {
    return {
      todo: filteredTasks.value.filter(task => task.status === 'todo'),
      'in-progress': filteredTasks.value.filter(task => task.status === 'in-progress'),
      done: filteredTasks.value.filter(task => task.status === 'done')
    }
  })

  const taskStats = computed((): TaskStats => {
    const now = new Date()
    const overdue = tasks.value.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
    ).length

    return {
      total: tasks.value.length,
      todo: tasks.value.filter(task => task.status === 'todo').length,
      inProgress: tasks.value.filter(task => task.status === 'in-progress').length,
      done: tasks.value.filter(task => task.status === 'done').length,
      overdue
    }
  })

  const categories = computed(() => {
    const cats = [...new Set(tasks.value.map(task => task.category))]
    return cats.sort()
  })

  const allTags = computed(() => {
    const tags = [...new Set(tasks.value.flatMap(task => task.tags))]
    return tags.sort()
  })

  // Actions
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user?.id) return null

    try {
      const taskWithSubtasks = {
        ...taskData,
        subtasks: taskData.subtasks || []
      }

      if (authStore.user.id === 'guest') {
        // Handle guest users with localStorage
        const newTask: Task = {
          ...taskWithSubtasks,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        tasks.value.push(newTask)
        saveGuestTasks()
        return newTask
      } else {
        // Handle authenticated users with Firestore
        const newTask = await firestoreService.addTask(authStore.user.id, taskWithSubtasks)
        if (newTask) {
          tasks.value.push(newTask)
        }
        return newTask
      }
    } catch (error) {
      console.error('Error adding task:', error)
      return null
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const index = tasks.value.findIndex(task => task.id === id)
      if (index === -1) return null

      if (authStore.user?.id === 'guest') {
        // Handle guest users with localStorage
        tasks.value[index] = {
          ...tasks.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveGuestTasks()
        return tasks.value[index]
      } else {
        // Handle authenticated users with Firestore
        const success = await firestoreService.updateTask(id, updates)
        if (success) {
          tasks.value[index] = {
            ...tasks.value[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return tasks.value[index]
        }
        return null
      }
    } catch (error) {
      console.error('Error updating task:', error)
      return null
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const index = tasks.value.findIndex(task => task.id === id)
      if (index === -1) return false

      if (authStore.user?.id === 'guest') {
        // Handle guest users with localStorage
        tasks.value.splice(index, 1)
        saveGuestTasks()
        return true
      } else {
        // Handle authenticated users with Firestore
        const success = await firestoreService.deleteTask(id)
        if (success) {
          tasks.value.splice(index, 1)
        }
        return success
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  }

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    return updateTask(taskId, { status: newStatus })
  }

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || !task.subtasks) return false

    const subtask = task.subtasks.find(s => s.id === subtaskId)
    if (!subtask) return false

    subtask.completed = !subtask.completed
    
    return updateTask(taskId, { subtasks: task.subtasks })
  }

  const setFilter = (newFilter: Partial<TaskFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const clearFilter = () => {
    filter.value = {
      search: '',
      status: undefined,
      priority: undefined,
      category: undefined,
      tag: undefined
    }
  }

  const getTaskById = (id: string) => {
    return tasks.value.find(task => task.id === id)
  }

  return {
    tasks,
    loading,
    filter,
    filteredTasks,
    tasksByStatus,
    taskStats,
    categories,
    allTags,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleSubtask,
    setFilter,
    clearFilter,
    getTaskById,
    loadTasks
  }
})