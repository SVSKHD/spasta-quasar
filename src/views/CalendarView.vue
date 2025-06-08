<template>
  <div class="calendar-view">
    <!-- Calendar Header -->
    <div class="calendar-header q-mb-lg">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="calendar-title">
              <div class="text-h5 text-weight-medium spasta-text">
                <q-icon name="event" class="q-mr-sm icon-lg" />
                Task Calendar
              </div>
              <div class="text-body2 spasta-text opacity-80">
                {{ formatCurrentPeriod() }}
              </div>
            </div>
            
            <div class="calendar-controls row q-gutter-sm">
              <!-- Navigation -->
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="navigatePrevious"
                class="spasta-text nav-btn"
              >
                <q-tooltip>Previous {{ viewMode }}</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                label="Today"
                @click="goToToday"
                class="spasta-text today-btn"
              />
              
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="navigateNext"
                class="spasta-text nav-btn"
              >
                <q-tooltip>Next {{ viewMode }}</q-tooltip>
              </q-btn>
              
              <q-separator vertical class="q-mx-sm" />
              
              <!-- View Mode Toggle -->
              <q-btn-toggle
                v-model="viewMode"
                :options="[
                  { label: 'Month', value: 'month', icon: 'view_module' },
                  { label: 'Week', value: 'week', icon: 'view_week' },
                  { label: 'Day', value: 'day', icon: 'view_day' }
                ]"
                color="white"
                text-color="grey-8"
                toggle-color="primary"
                toggle-text-color="white"
                class="view-toggle"
              />
              
              <q-separator vertical class="q-mx-sm" />
              
              <!-- Add Task -->
              <q-btn
                flat
                icon="add"
                label="Add Task"
                @click="showTaskDialog = true"
                class="spasta-text add-btn"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Calendar Content -->
    <div class="calendar-content">
      <q-card class="spasta-card calendar-main">
        <q-card-section class="q-pa-none">
          <!-- Month View -->
          <div v-if="viewMode === 'month'" class="month-view">
            <div class="month-header">
              <div class="weekdays">
                <div 
                  v-for="day in weekdays" 
                  :key="day" 
                  class="weekday-header"
                >
                  {{ day }}
                </div>
              </div>
            </div>
            
            <div class="month-grid">
              <div
                v-for="(day, index) in monthDays"
                :key="`${day.date}-${index}`"
                class="day-cell"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'selected': day.isSelected,
                  'has-tasks': day.tasks.length > 0
                }"
                @click="selectDay(day)"
              >
                <div class="day-number">{{ day.dayNumber }}</div>
                <div class="day-tasks">
                  <div
                    v-for="task in day.tasks.slice(0, 3)"
                    :key="task.id"
                    class="task-event"
                    :class="getTaskEventClass(task)"
                    @click.stop="viewTask(task)"
                  >
                    <div class="task-title">{{ task.title }}</div>
                  </div>
                  <div v-if="day.tasks.length > 3" class="more-tasks">
                    +{{ day.tasks.length - 3 }} more
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Week View -->
          <div v-if="viewMode === 'week'" class="week-view">
            <div class="week-header">
              <div class="time-column"></div>
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="week-day-header"
                :class="{ 'today': day.isToday }"
              >
                <div class="day-name">{{ day.dayName }}</div>
                <div class="day-number">{{ day.dayNumber }}</div>
              </div>
            </div>
            
            <div class="week-grid">
              <div class="time-slots">
                <div
                  v-for="hour in timeSlots"
                  :key="hour"
                  class="time-slot"
                >
                  {{ formatHour(hour) }}
                </div>
              </div>
              
              <div class="week-days">
                <div
                  v-for="day in weekDays"
                  :key="day.date"
                  class="week-day-column"
                  @click="selectDay(day)"
                >
                  <div class="hour-slots">
                    <div
                      v-for="hour in timeSlots"
                      :key="hour"
                      class="hour-slot"
                      :class="{ 'current-hour': isCurrentHour(day.date, hour) }"
                    ></div>
                  </div>
                  
                  <!-- Tasks positioned absolutely -->
                  <div
                    v-for="task in day.tasks"
                    :key="task.id"
                    class="week-task-event"
                    :class="getTaskEventClass(task)"
                    :style="getTaskPosition(task)"
                    @click.stop="viewTask(task)"
                  >
                    <div class="task-time">{{ getTaskTime(task) }}</div>
                    <div class="task-title">{{ task.title }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day View -->
          <div v-if="viewMode === 'day'" class="day-view">
            <div class="day-header">
              <div class="selected-day-info">
                <div class="day-name">{{ selectedDayInfo.dayName }}</div>
                <div class="day-date">{{ selectedDayInfo.fullDate }}</div>
              </div>
            </div>
            
            <div class="day-grid">
              <div class="time-column">
                <div
                  v-for="hour in timeSlots"
                  :key="hour"
                  class="time-slot"
                >
                  {{ formatHour(hour) }}
                </div>
              </div>
              
              <div class="day-content">
                <div class="hour-slots">
                  <div
                    v-for="hour in timeSlots"
                    :key="hour"
                    class="hour-slot"
                    :class="{ 'current-hour': isCurrentHour(selectedDate, hour) }"
                    @click="createTaskAtTime(hour)"
                  ></div>
                </div>
                
                <!-- Tasks positioned absolutely -->
                <div
                  v-for="task in selectedDayTasks"
                  :key="task.id"
                  class="day-task-event"
                  :class="getTaskEventClass(task)"
                  :style="getTaskPosition(task)"
                  @click.stop="viewTask(task)"
                >
                  <div class="task-time">{{ getTaskTime(task) }}</div>
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-category">{{ task.category }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Task Dialog -->
    <q-dialog v-model="showTaskDialog" persistent>
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ editingTask ? 'Edit Task' : 'Create Task' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveTask" class="q-gutter-md">
            <q-input
              v-model="taskForm.title"
              label="Task Title"
              outlined
              dense
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="taskForm.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="2"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model="taskForm.dueDate"
                  label="Date"
                  outlined
                  dense
                  type="date"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-input
                  v-model="taskForm.dueTime"
                  label="Time"
                  outlined
                  dense
                  type="time"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="taskForm.priority"
                  label="Priority"
                  outlined
                  dense
                  :options="priorityOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-select
                  v-model="taskForm.category"
                  label="Category"
                  outlined
                  dense
                  :options="categoryOptions"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <q-select
              v-model="taskForm.status"
              label="Status"
              outlined
              dense
              :options="statusOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeTaskDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="saveTask"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Task Details Dialog -->
    <q-dialog v-model="showTaskDetailsDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ selectedTask?.title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="selectedTask">
            <div class="task-detail-item q-mb-sm">
              <q-icon name="schedule" class="q-mr-sm" />
              <span class="spasta-text">{{ formatTaskDateTime(selectedTask) }}</span>
            </div>
            
            <div v-if="selectedTask.description" class="task-detail-item q-mb-sm">
              <q-icon name="description" class="q-mr-sm" />
              <span class="spasta-text">{{ selectedTask.description }}</span>
            </div>
            
            <div class="task-detail-item q-mb-sm">
              <q-icon name="flag" class="q-mr-sm" />
              <q-chip
                :color="getPriorityColor(selectedTask.priority)"
                text-color="white"
                size="sm"
                :label="selectedTask.priority"
                class="text-capitalize"
              />
            </div>
            
            <div class="task-detail-item q-mb-sm">
              <q-icon name="category" class="q-mr-sm" />
              <span class="spasta-text">{{ selectedTask.category }}</span>
            </div>

            <div class="task-detail-item">
              <q-icon name="info" class="q-mr-sm" />
              <q-chip
                :color="getStatusColor(selectedTask.status)"
                text-color="white"
                size="sm"
                :label="getStatusLabel(selectedTask.status)"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showTaskDetailsDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Edit" 
            color="white" 
            text-color="grey-8"
            @click="editTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import type { Task } from '../types/task'

const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()

// Reactive state
const viewMode = ref<'month' | 'week' | 'day'>('month')
const selectedDate = ref(new Date())
const showTaskDialog = ref(false)
const showTaskDetailsDialog = ref(false)
const editingTask = ref<Task | null>(null)
const selectedTask = ref<Task | null>(null)
const saving = ref(false)

// Form data
const taskForm = ref({
  title: '',
  description: '',
  dueDate: '',
  dueTime: '09:00',
  priority: 'medium' as 'low' | 'medium' | 'high',
  category: '',
  status: 'todo'
})

// Constants
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const timeSlots = Array.from({ length: 24 }, (_, i) => i)

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Done', value: 'done' }
]

// Computed properties
const categoryOptions = computed(() => {
  return categoryStore.categories.map(cat => cat.name)
})

const tasksWithDates = computed(() => {
  return taskStore.tasks.filter(task => task.dueDate).map(task => ({
    ...task,
    date: new Date(task.dueDate!),
    time: task.dueDate?.includes('T') ? task.dueDate.split('T')[1] : '09:00'
  }))
})

const monthDays = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dayTasks = tasksWithDates.value.filter(task => 
      task.date.toDateString() === date.toDateString()
    )
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === selectedDate.value.toDateString(),
      tasks: dayTasks
    })
  }
  
  return days
})

const weekDays = computed(() => {
  const startOfWeek = new Date(selectedDate.value)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day)
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dayTasks = tasksWithDates.value.filter(task => 
      task.date.toDateString() === date.toDateString()
    )
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: date.getDate(),
      dayName: weekdays[date.getDay()],
      isToday: date.toDateString() === today.toDateString(),
      tasks: dayTasks
    })
  }
  
  return days
})

const selectedDayTasks = computed(() => {
  return tasksWithDates.value.filter(task => 
    task.date.toDateString() === selectedDate.value.toDateString()
  )
})

const selectedDayInfo = computed(() => {
  const date = selectedDate.value
  return {
    dayName: weekdays[date.getDay()],
    fullDate: date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
})

// Methods
const formatCurrentPeriod = () => {
  const date = selectedDate.value
  
  if (viewMode.value === 'month') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  } else if (viewMode.value === 'week') {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
}

const navigatePrevious = () => {
  const newDate = new Date(selectedDate.value)
  
  if (viewMode.value === 'month') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setDate(newDate.getDate() - 1)
  }
  
  selectedDate.value = newDate
}

const navigateNext = () => {
  const newDate = new Date(selectedDate.value)
  
  if (viewMode.value === 'month') {
    newDate.setMonth(newDate.getMonth() + 1)
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setDate(newDate.getDate() + 1)
  }
  
  selectedDate.value = newDate
}

const goToToday = () => {
  selectedDate.value = new Date()
}

const selectDay = (day: any) => {
  selectedDate.value = new Date(day.date)
  if (viewMode.value === 'month') {
    viewMode.value = 'day'
  }
}

const formatHour = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour} ${period}`
}

const isCurrentHour = (date: string, hour: number) => {
  const now = new Date()
  const checkDate = new Date(date)
  return checkDate.toDateString() === now.toDateString() && hour === now.getHours()
}

const getTaskEventClass = (task: any) => {
  const classes = ['task-event-base']
  
  switch (task.priority) {
    case 'high':
      classes.push('task-priority-high')
      break
    case 'medium':
      classes.push('task-priority-medium')
      break
    case 'low':
      classes.push('task-priority-low')
      break
  }
  
  switch (task.status) {
    case 'done':
      classes.push('task-status-done')
      break
    case 'in-progress':
      classes.push('task-status-progress')
      break
    default:
      classes.push('task-status-todo')
  }
  
  return classes.join(' ')
}

const getTaskPosition = (task: any) => {
  const time = task.time || '09:00'
  const [hours, minutes] = time.split(':').map(Number)
  const top = (hours * 60 + minutes) / 60 * 60 // 60px per hour
  
  return {
    top: `${top}px`,
    left: '4px',
    right: '4px',
    minHeight: '40px'
  }
}

const getTaskTime = (task: any) => {
  if (!task.time) return ''
  const [hours, minutes] = task.time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
}

const createTaskAtTime = (hour: number) => {
  const date = selectedDate.value.toISOString().split('T')[0]
  const time = `${hour.toString().padStart(2, '0')}:00`
  
  taskForm.value = {
    title: '',
    description: '',
    dueDate: date,
    dueTime: time,
    priority: 'medium',
    category: categoryOptions.value[0] || '',
    status: 'todo'
  }
  
  editingTask.value = null
  showTaskDialog.value = true
}

const viewTask = (task: any) => {
  selectedTask.value = task
  showTaskDetailsDialog.value = true
}

const editTask = () => {
  if (selectedTask.value) {
    editingTask.value = selectedTask.value
    
    const dueDate = selectedTask.value.dueDate || ''
    const [date, time] = dueDate.includes('T') ? dueDate.split('T') : [dueDate, '09:00']
    
    taskForm.value = {
      title: selectedTask.value.title,
      description: selectedTask.value.description,
      dueDate: date,
      dueTime: time.substring(0, 5),
      priority: selectedTask.value.priority,
      category: selectedTask.value.category,
      status: selectedTask.value.status
    }
    
    showTaskDetailsDialog.value = false
    showTaskDialog.value = true
  }
}

const saveTask = async () => {
  if (!taskForm.value.title.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a task title',
      position: 'top-right',
      timeout: 2000
    })
    return
  }

  saving.value = true
  
  try {
    const dueDateTime = taskForm.value.dueTime 
      ? `${taskForm.value.dueDate}T${taskForm.value.dueTime}:00`
      : taskForm.value.dueDate

    const taskData = {
      title: taskForm.value.title,
      description: taskForm.value.description,
      dueDate: dueDateTime,
      priority: taskForm.value.priority,
      category: taskForm.value.category,
      status: taskForm.value.status,
      tags: [],
      subtasks: []
    }

    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, taskData)
      $q.notify({
        type: 'positive',
        message: 'Task updated successfully',
        position: 'top-right',
        timeout: 2000
      })
    } else {
      await taskStore.addTask(taskData)
      $q.notify({
        type: 'positive',
        message: 'Task created successfully',
        position: 'top-right',
        timeout: 2000
      })
    }
    
    closeTaskDialog()
  } catch (error) {
    console.error('Error saving task:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving task. Please try again.',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    saving.value = false
  }
}

const closeTaskDialog = () => {
  showTaskDialog.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    dueDate: '',
    dueTime: '09:00',
    priority: 'medium',
    category: '',
    status: 'todo'
  }
}

const formatTaskDateTime = (task: any) => {
  if (!task.dueDate) return 'No date set'
  
  const date = new Date(task.dueDate)
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  if (task.dueDate.includes('T')) {
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
    return `${dateStr} at ${timeStr}`
  }
  
  return dateStr
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'positive'
    default: return 'grey'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'positive'
    case 'in-progress': return 'primary'
    case 'todo': return 'grey'
    default: return 'grey'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in-progress': return 'In Progress'
    case 'todo': return 'To Do'
    case 'done': return 'Done'
    default: return status
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    taskStore.loadTasks(),
    categoryStore.loadCategories()
  ])
})

// Watch for task store changes
watch(() => taskStore.tasks, () => {
  // Tasks updated, calendar will automatically reflect changes
}, { deep: true })
</script>

<style scoped>
.calendar-view {
  height: calc(100vh - 150px);
  padding: 24px;
  overflow: hidden;
}

.calendar-header {
  animation: slideInUp 0.5s ease;
}

.calendar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-controls {
  align-items: center;
}

.nav-btn, .today-btn, .add-btn {
  transition: all 0.2s ease;
  border-radius: 12px;
}

.nav-btn:hover, .today-btn:hover, .add-btn:hover {
  background: rgba(239, 228, 210, 0.2);
  transform: scale(1.05);
}

.view-toggle :deep(.q-btn) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.calendar-main {
  height: calc(100vh - 280px);
  overflow: hidden;
  animation: slideInUp 0.6s ease;
}

/* Month View */
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.month-header {
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  padding: 16px 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.weekday-header {
  text-align: center;
  font-weight: 600;
  color: #EFE4D2;
  padding: 12px;
  background: rgba(58, 107, 140, 0.2);
  border-radius: 8px;
}

.month-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
  padding: 1px;
  background: rgba(239, 228, 210, 0.1);
}

.day-cell {
  background: rgba(58, 107, 140, 0.05);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  position: relative;
  overflow: hidden;
}

.day-cell:hover {
  background: rgba(58, 107, 140, 0.15);
  transform: scale(1.02);
}

.day-cell.other-month {
  opacity: 0.4;
}

.day-cell.today {
  background: rgba(114, 92, 173, 0.2);
  border: 2px solid #EFE4D2;
}

.day-cell.selected {
  background: rgba(114, 92, 173, 0.3);
  border: 2px solid #EFE4D2;
}

.day-cell.has-tasks::before {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #EFE4D2;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.day-number {
  font-weight: 600;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.day-tasks {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-event {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.task-event:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-tasks {
  font-size: 10px;
  color: #EFE4D2;
  opacity: 0.7;
  text-align: center;
  padding: 2px;
}

/* Week View */
.week-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  padding: 16px 0;
}

.time-column {
  /* Empty space for time labels */
}

.week-day-header {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.week-day-header.today {
  background: rgba(114, 92, 173, 0.2);
  border: 1px solid #EFE4D2;
}

.day-name {
  font-size: 12px;
  color: #EFE4D2;
  opacity: 0.8;
}

.day-number {
  font-size: 18px;
  font-weight: 600;
  color: #EFE4D2;
}

.week-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 80px 1fr;
  overflow-y: auto;
}

.time-slots {
  border-right: 1px solid rgba(239, 228, 210, 0.2);
}

.time-slot {
  height: 60px;
  padding: 8px;
  font-size: 12px;
  color: #EFE4D2;
  opacity: 0.7;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  display: flex;
  align-items: flex-start;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.week-day-column {
  position: relative;
  border-right: 1px solid rgba(239, 228, 210, 0.1);
}

.hour-slots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hour-slot:hover {
  background: rgba(239, 228, 210, 0.05);
}

.hour-slot.current-hour {
  background: rgba(114, 92, 173, 0.1);
  border-left: 3px solid #EFE4D2;
}

.week-task-event {
  position: absolute;
  background: rgba(58, 107, 140, 0.8);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
}

.week-task-event:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Day View */
.day-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.day-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
}

.selected-day-info .day-name {
  font-size: 24px;
  font-weight: 600;
  color: #EFE4D2;
}

.selected-day-info .day-date {
  font-size: 14px;
  color: #EFE4D2;
  opacity: 0.8;
}

.day-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 80px 1fr;
  overflow-y: auto;
}

.day-content {
  position: relative;
}

.day-task-event {
  position: absolute;
  background: rgba(58, 107, 140, 0.8);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
}

.day-task-event:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.task-time {
  font-size: 11px;
  color: #EFE4D2;
  opacity: 0.8;
  margin-bottom: 2px;
}

.task-category {
  font-size: 10px;
  color: #EFE4D2;
  opacity: 0.6;
  margin-top: 2px;
}

/* Task Priority Colors */
.task-priority-high {
  background: rgba(193, 0, 21, 0.8) !important;
  border-color: rgba(193, 0, 21, 0.6) !important;
}

.task-priority-medium {
  background: rgba(242, 192, 55, 0.8) !important;
  border-color: rgba(242, 192, 55, 0.6) !important;
  color: #333 !important;
}

.task-priority-low {
  background: rgba(33, 186, 69, 0.8) !important;
  border-color: rgba(33, 186, 69, 0.6) !important;
}

/* Task Status Styles */
.task-status-done {
  opacity: 0.7;
  text-decoration: line-through;
}

.task-status-progress {
  border-left: 4px solid #EFE4D2;
}

/* Task Detail Dialog */
.task-detail-item {
  display: flex;
  align-items: center;
  color: #EFE4D2;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .calendar-view {
    padding: 12px;
    height: calc(100vh - 120px);
  }
  
  .calendar-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .view-toggle {
    order: -1;
  }
  
  .month-grid {
    grid-template-rows: repeat(6, minmax(80px, 1fr));
  }
  
  .day-cell {
    min-height: 80px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 14px;
  }
  
  .task-event {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .week-grid,
  .day-grid {
    grid-template-columns: 60px 1fr;
  }
  
  .time-slot {
    height: 40px;
    font-size: 10px;
  }
  
  .hour-slot {
    height: 40px;
  }
}

/* Scrollbar styling */
.week-grid::-webkit-scrollbar,
.day-grid::-webkit-scrollbar {
  width: 8px;
}

.week-grid::-webkit-scrollbar-track,
.day-grid::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 8px;
}

.week-grid::-webkit-scrollbar-thumb,
.day-grid::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.week-grid::-webkit-scrollbar-thumb:hover,
.day-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}
</style>