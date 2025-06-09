import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from './authStore'
import type { Task, TaskStatus, TaskFilter, TaskStats } from '../types/task'

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
      console.log('Loading tasks for user:', authStore.user.id)
      
      if (authStore.user.id === 'guest') {
        // Load from localStorage for guest users
        const stored = localStorage.getItem('guest_tasks')
        if (stored) {
          tasks.value = JSON.parse(stored)
          console.log('Loaded tasks from localStorage:', tasks.value.length, 'tasks')
        } else {
          console.log('No tasks found in localStorage - user can create them')
          tasks.value = []
        }
      } else {
        // Load from Firestore for authenticated users
        console.log('Loading tasks from Firestore')
        const firestoreTasks = await firestoreService.getTasks(authStore.user.id)
        tasks.value = firestoreTasks
        console.log('Loaded tasks from Firestore:', tasks.value.length, 'tasks')
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  // Save guest tasks to localStorage
  const saveGuestTasks = () => {
    if (authStore.user?.id === 'guest') {
      localStorage.setItem('guest_tasks', JSON.stringify(tasks.value))
      console.log('Saved guest tasks to localStorage')
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
      console.log('Adding task:', taskData.title)
      
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
        console.log('Task added for guest user:', newTask.title)
        return newTask
      } else {
        // Handle authenticated users with Firestore
        const newTask = await firestoreService.addTask(authStore.user.id, taskWithSubtasks)
        if (newTask) {
          tasks.value.push(newTask)
          console.log('Task added to Firebase:', newTask.title)
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

      console.log('Updating task:', id, updates)

      if (authStore.user?.id === 'guest') {
        // Handle guest users with localStorage
        tasks.value[index] = {
          ...tasks.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveGuestTasks()
        console.log('Task updated for guest user:', tasks.value[index].title)
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
          console.log('Task updated in Firebase:', tasks.value[index].title)
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

      console.log('Deleting task:', id)

      if (authStore.user?.id === 'guest') {
        // Handle guest users with localStorage
        tasks.value.splice(index, 1)
        saveGuestTasks()
        console.log('Task deleted for guest user')
        return true
      } else {
        // Handle authenticated users with Firestore
        const success = await firestoreService.deleteTask(id)
        if (success) {
          tasks.value.splice(index, 1)
          console.log('Task deleted from Firebase')
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

  // Force refresh tasks
  const refreshTasks = async () => {
    console.log('Refreshing tasks...')
    tasks.value = []
    await loadTasks()
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
    loadTasks,
    refreshTasks
  }
})