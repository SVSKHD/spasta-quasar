<template>
  <div class="calendar-view">
    <!-- Calendar Header -->
    <div class="calendar-header q-pa-md">
      <q-card class="spasta-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h5 spasta-text">
              <q-icon name="event" class="q-mr-sm icon-lg" />
              Calendar
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                icon="refresh"
                label="Refresh"
                @click="refreshData"
                class="spasta-text"
                :loading="loading"
              />
              <q-btn
                flat
                icon="add"
                label="Add Event"
                @click="showEventDialog = true"
                class="spasta-text"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Calendar Controls -->
    <div class="calendar-controls q-pa-md q-pt-none">
      <q-card class="spasta-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <!-- View Toggle -->
            <q-btn-toggle
              v-model="currentView"
              toggle-color="white"
              toggle-text-color="grey-8"
              :options="[
                { label: 'Month', value: 'month' },
                { label: 'Week', value: 'week' },
                { label: 'Day', value: 'day' }
              ]"
              class="view-toggle"
            />

            <!-- Navigation -->
            <div class="row items-center q-gutter-md">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="navigatePrevious"
                class="spasta-text"
              />
              <div class="text-h6 spasta-text current-period">
                {{ currentPeriodLabel }}
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="navigateNext"
                class="spasta-text"
              />
              <q-btn
                flat
                label="Today"
                @click="goToToday"
                class="spasta-text q-ml-md"
              />
            </div>

            <!-- Filters -->
            <div class="row q-gutter-sm">
              <q-select
                v-model="selectedCategory"
                :options="categoryOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Category"
                clearable
                class="spasta-input"
                color="white"
                label-color="white"
                dark
                style="min-width: 150px"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Calendar Content -->
    <div class="calendar-content q-pa-md q-pt-none">
      <q-card class="spasta-card calendar-main">
        <q-card-section class="q-pa-none">
          <!-- Month View -->
          <div v-if="currentView === 'month'" class="month-view">
            <div class="month-header">
              <div v-for="day in weekDays" :key="day" class="day-header">
                <div class="text-weight-medium spasta-text">{{ day }}</div>
              </div>
            </div>
            <div class="month-grid">
              <div
                v-for="date in monthDates"
                :key="date.key"
                class="month-cell"
                :class="{
                  'other-month': !date.isCurrentMonth,
                  'today': date.isToday,
                  'selected': date.isSelected
                }"
                @click="selectDate(date.date)"
              >
                <div class="date-number">{{ date.day }}</div>
                <div class="date-events">
                  <div
                    v-for="task in getTasksForDate(date.date)"
                    :key="task.id"
                    class="event-item"
                    :class="`event-${task.priority}`"
                    @click.stop="editTask(task)"
                  >
                    <div class="event-title">{{ task.title }}</div>
                    <div class="event-time" v-if="task.startTime">{{ formatTime(task.startTime) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Week View -->
          <div v-if="currentView === 'week'" class="week-view">
            <div class="week-header">
              <div class="time-column"></div>
              <div v-for="date in weekDates" :key="date.key" class="week-day-header">
                <div class="day-name spasta-text">{{ date.dayName }}</div>
                <div class="day-number" :class="{ 'today': date.isToday }">{{ date.day }}</div>
              </div>
            </div>
            <div class="week-grid">
              <div class="time-slots">
                <div v-for="hour in timeSlots" :key="hour" class="time-slot">
                  <div class="time-label">{{ formatHour(hour) }}</div>
                </div>
              </div>
              <div v-for="date in weekDates" :key="date.key" class="week-day-column">
                <div
                  v-for="hour in timeSlots"
                  :key="hour"
                  class="time-cell"
                  @click="createEventAt(date.date, hour)"
                >
                  <div
                    v-for="task in getTasksForDateTime(date.date, hour)"
                    :key="task.id"
                    class="week-event"
                    :class="`event-${task.priority}`"
                    @click.stop="editTask(task)"
                  >
                    <div class="event-title">{{ task.title }}</div>
                    <div class="event-time">{{ formatTime(task.startTime) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day View -->
          <div v-if="currentView === 'day'" class="day-view">
            <div class="day-header">
              <div class="day-title spasta-text">
                <div class="text-h6">{{ selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) }}</div>
                <div class="text-h4">{{ selectedDate.getDate() }}</div>
                <div class="text-body2">{{ selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</div>
              </div>
            </div>
            <div class="day-grid">
              <div class="time-slots">
                <div v-for="hour in timeSlots" :key="hour" class="time-slot">
                  <div class="time-label">{{ formatHour(hour) }}</div>
                </div>
              </div>
              <div class="day-column">
                <div
                  v-for="hour in timeSlots"
                  :key="hour"
                  class="time-cell"
                  @click="createEventAt(selectedDate, hour)"
                >
                  <div
                    v-for="task in getTasksForDateTime(selectedDate, hour)"
                    :key="task.id"
                    class="day-event"
                    :class="`event-${task.priority}`"
                    @click.stop="editTask(task)"
                  >
                    <div class="event-title">{{ task.title }}</div>
                    <div class="event-time">{{ formatTime(task.startTime) }} - {{ formatTime(task.endTime) }}</div>
                    <div class="event-category">{{ task.category }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Event Dialog -->
    <q-dialog v-model="showEventDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ editingEvent ? 'Edit Event' : 'Create Event' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveEvent" class="q-gutter-md">
            <q-input
              v-model="eventForm.title"
              label="Event Title"
              outlined
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="eventForm.description"
              label="Description"
              outlined
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
                  v-model="eventForm.startDate"
                  label="Start Date"
                  outlined
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
                  v-model="eventForm.startTime"
                  label="Start Time"
                  outlined
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
                <q-input
                  v-model="eventForm.endDate"
                  label="End Date"
                  outlined
                  type="date"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-input
                  v-model="eventForm.endTime"
                  label="End Time"
                  outlined
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
                  v-model="eventForm.category"
                  label="Category"
                  outlined
                  :options="categorySelectOptions"
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
                  v-model="eventForm.priority"
                  label="Priority"
                  outlined
                  :options="[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' }
                  ]"
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
            </div>

            <q-checkbox
              v-model="eventForm.isRecurring"
              label="Recurring Event"
              color="white"
              class="spasta-text"
            />

            <div v-if="eventForm.isRecurring" class="recurring-options">
              <div class="row q-gutter-md">
                <div class="col">
                  <q-select
                    v-model="eventForm.recurrence.type"
                    label="Repeat"
                    outlined
                    :options="[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Monthly', value: 'monthly' },
                      { label: 'Yearly', value: 'yearly' }
                    ]"
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
                  <q-input
                    v-model.number="eventForm.recurrence.interval"
                    label="Every"
                    outlined
                    type="number"
                    min="1"
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeEventDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="saveEvent"
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
import { useAuthStore } from '../stores/authStore'
import type { Task, TaskPriority, TaskRecurrence } from '../types/task'

const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const currentView = ref<'month' | 'week' | 'day'>('month')
const selectedDate = ref(new Date())
const currentDate = ref(new Date())
const loading = ref(false)
const showEventDialog = ref(false)
const editingEvent = ref<Task | null>(null)
const selectedCategory = ref<string | undefined>()

const eventForm = ref({
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  category: '',
  priority: 'medium' as TaskPriority,
  isRecurring: false,
  recurrence: {
    type: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: 1,
    weekDays: [] as number[],
    endDate: ''
  }
})

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const timeSlots = Array.from({ length: 24 }, (_, i) => i)

const currentPeriodLabel = computed(() => {
  const date = currentDate.value
  
  switch (currentView.value) {
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'week':
      const weekStart = getWeekStart(date)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    case 'day':
      return selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    default:
      return ''
  }
})

const categoryOptions = computed(() => {
  return [
    { label: 'All Categories', value: undefined },
    ...categoryStore.categories.map(cat => ({
      label: cat.name,
      value: cat.name
    }))
  ]
})

const categorySelectOptions = computed(() => {
  return categoryStore.categories.map(cat => ({
    label: cat.name,
    value: cat.name
  }))
})

const filteredTasks = computed(() => {
  let tasks = taskStore.tasks.filter(task => 
    task.startDate || task.dueDate // Only show tasks with dates
  )
  
  if (selectedCategory.value) {
    tasks = tasks.filter(task => task.category === selectedCategory.value)
  }
  
  return tasks
})

const monthDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    dates.push({
      date: new Date(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate.value),
      key: date.toISOString().split('T')[0]
    })
  }
  
  return dates
})

const weekDates = computed(() => {
  const weekStart = getWeekStart(currentDate.value)
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    
    dates.push({
      date: new Date(date),
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: isSameDay(date, today),
      key: date.toISOString().split('T')[0]
    })
  }
  
  return dates
})

const getWeekStart = (date: Date) => {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return start
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString()
}

const getTasksForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return filteredTasks.value.filter(task => {
    const taskDate = task.startDate || task.dueDate
    return taskDate === dateStr
  })
}

const getTasksForDateTime = (date: Date, hour: number) => {
  const dateStr = date.toISOString().split('T')[0]
  return filteredTasks.value.filter(task => {
    const taskDate = task.startDate || task.dueDate
    if (taskDate !== dateStr) return false
    
    if (task.startTime) {
      const taskHour = parseInt(task.startTime.split(':')[0])
      return taskHour === hour
    }
    
    return false
  })
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const formatHour = (hour: number) => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:00 ${ampm}`
}

const navigatePrevious = () => {
  const newDate = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'month':
      newDate.setMonth(newDate.getMonth() - 1)
      break
    case 'week':
      newDate.setDate(newDate.getDate() - 7)
      break
    case 'day':
      newDate.setDate(newDate.getDate() - 1)
      selectedDate.value = new Date(newDate)
      break
  }
  
  currentDate.value = newDate
}

const navigateNext = () => {
  const newDate = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'month':
      newDate.setMonth(newDate.getMonth() + 1)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + 7)
      break
    case 'day':
      newDate.setDate(newDate.getDate() + 1)
      selectedDate.value = new Date(newDate)
      break
  }
  
  currentDate.value = newDate
}

const goToToday = () => {
  const today = new Date()
  currentDate.value = today
  selectedDate.value = today
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  if (currentView.value === 'month') {
    currentView.value = 'day'
    currentDate.value = date
  }
}

const createEventAt = (date: Date, hour?: number) => {
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : ''
  
  eventForm.value = {
    title: '',
    description: '',
    startDate: dateStr,
    startTime: timeStr,
    endDate: dateStr,
    endTime: hour !== undefined ? `${(hour + 1).toString().padStart(2, '0')}:00` : '',
    category: '',
    priority: 'medium',
    isRecurring: false,
    recurrence: {
      type: 'weekly',
      interval: 1,
      weekDays: [],
      endDate: ''
    }
  }
  
  showEventDialog.value = true
}

const editTask = (task: Task) => {
  editingEvent.value = task
  eventForm.value = {
    title: task.title,
    description: task.description,
    startDate: task.startDate || task.dueDate || '',
    startTime: task.startTime || '',
    endDate: task.endDate || task.startDate || task.dueDate || '',
    endTime: task.endTime || '',
    category: task.category,
    priority: task.priority,
    isRecurring: task.isRecurring || false,
    recurrence: task.recurrence || {
      type: 'weekly',
      interval: 1,
      weekDays: [],
      endDate: ''
    }
  }
  showEventDialog.value = true
}

const saveEvent = async () => {
  try {
    const taskData = {
      title: eventForm.value.title,
      description: eventForm.value.description,
      category: eventForm.value.category,
      priority: eventForm.value.priority,
      status: 'todo',
      tags: [],
      subtasks: [],
      startDate: eventForm.value.startDate,
      startTime: eventForm.value.startTime,
      endDate: eventForm.value.endDate,
      endTime: eventForm.value.endTime,
      isRecurring: eventForm.value.isRecurring,
      recurrence: eventForm.value.isRecurring ? eventForm.value.recurrence : undefined,
      dueDate: eventForm.value.startDate
    }

    if (editingEvent.value) {
      await taskStore.updateTask(editingEvent.value.id, taskData)
      $q.notify({
        type: 'positive',
        message: 'Event updated successfully',
        position: 'top-right',
        timeout: 2000
      })
    } else {
      await taskStore.addTask(taskData)
      $q.notify({
        type: 'positive',
        message: 'Event created successfully',
        position: 'top-right',
        timeout: 2000
      })
    }
    
    closeEventDialog()
  } catch (error) {
    console.error('Error saving event:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving event',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const closeEventDialog = () => {
  showEventDialog.value = false
  editingEvent.value = null
  eventForm.value = {
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    category: '',
    priority: 'medium',
    isRecurring: false,
    recurrence: {
      type: 'weekly',
      interval: 1,
      weekDays: [],
      endDate: ''
    }
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.loadTasks(),
      categoryStore.loadCategories()
    ])
    $q.notify({
      type: 'info',
      message: 'Calendar refreshed',
      position: 'top-right',
      timeout: 1500
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    loading.value = false
  }
}

// Watch for auth changes and reload data
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth && authStore.user?.id) {
    await refreshData()
  }
})

onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    await refreshData()
  }
})
</script>

<style scoped>
.calendar-view {
  height: calc(100vh - 50px);
  width: 100%;
}

.calendar-header,
.calendar-controls {
  margin-bottom: 0;
}

.calendar-main {
  min-height: 600px;
}

.view-toggle :deep(.q-btn-toggle) {
  background: rgba(58, 107, 140, 0.2);
  border-radius: 12px;
}

.view-toggle :deep(.q-btn) {
  color: #EFE4D2;
  border-radius: 8px;
}

.current-period {
  min-width: 200px;
  text-align: center;
}

/* Month View */
.month-view {
  width: 100%;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(58, 107, 140, 0.3);
  border-radius: 12px 12px 0 0;
}

.day-header {
  padding: 16px 8px;
  text-align: center;
  border-right: 1px solid rgba(239, 228, 210, 0.1);
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  min-height: 500px;
}

.month-cell {
  border: 1px solid rgba(239, 228, 210, 0.1);
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  position: relative;
}

.month-cell:hover {
  background: rgba(58, 107, 140, 0.2);
}

.month-cell.other-month {
  opacity: 0.4;
}

.month-cell.today {
  background: rgba(239, 228, 210, 0.1);
  border-color: #EFE4D2;
}

.month-cell.selected {
  background: rgba(58, 107, 140, 0.3);
  border-color: #EFE4D2;
}

.date-number {
  font-weight: 600;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.date-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid;
}

.event-item:hover {
  transform: scale(1.05);
}

.event-item.event-high {
  border-left-color: #C10015;
  background: rgba(193, 0, 21, 0.3);
}

.event-item.event-medium {
  border-left-color: #F2C037;
  background: rgba(242, 192, 55, 0.3);
}

.event-item.event-low {
  border-left-color: #21BA45;
  background: rgba(33, 186, 69, 0.3);
}

.event-title {
  color: #EFE4D2;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  color: #EFE4D2;
  opacity: 0.8;
  font-size: 10px;
}

/* Week View */
.week-view {
  width: 100%;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background: rgba(58, 107, 140, 0.3);
  border-radius: 12px 12px 0 0;
}

.time-column {
  padding: 16px 8px;
}

.week-day-header {
  padding: 16px 8px;
  text-align: center;
  border-right: 1px solid rgba(239, 228, 210, 0.1);
}

.day-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.day-number {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 50%;
}

.day-number.today {
  background: #EFE4D2;
  color: #254D70;
}

.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  min-height: 500px;
}

.time-slots {
  border-right: 1px solid rgba(239, 228, 210, 0.2);
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-label {
  font-size: 12px;
  color: #EFE4D2;
  opacity: 0.7;
}

.week-day-column {
  border-right: 1px solid rgba(239, 228, 210, 0.1);
}

.time-cell {
  height: 60px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  cursor: pointer;
  position: relative;
  padding: 2px;
}

.time-cell:hover {
  background: rgba(58, 107, 140, 0.1);
}

.week-event {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  cursor: pointer;
  border-left: 3px solid;
  margin-bottom: 2px;
}

.week-event.event-high {
  border-left-color: #C10015;
  background: rgba(193, 0, 21, 0.4);
}

.week-event.event-medium {
  border-left-color: #F2C037;
  background: rgba(242, 192, 55, 0.4);
}

.week-event.event-low {
  border-left-color: #21BA45;
  background: rgba(33, 186, 69, 0.4);
}

/* Day View */
.day-view {
  width: 100%;
}

.day-header {
  background: rgba(58, 107, 140, 0.3);
  border-radius: 12px 12px 0 0;
  padding: 24px;
  text-align: center;
}

.day-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.day-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  min-height: 500px;
}

.day-column {
  border-left: 1px solid rgba(239, 228, 210, 0.2);
}

.day-event {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  border-left: 4px solid;
  margin-bottom: 4px;
}

.day-event.event-high {
  border-left-color: #C10015;
  background: rgba(193, 0, 21, 0.4);
}

.day-event.event-medium {
  border-left-color: #F2C037;
  background: rgba(242, 192, 55, 0.4);
}

.day-event.event-low {
  border-left-color: #21BA45;
  background: rgba(33, 186, 69, 0.4);
}

.event-category {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-view {
    height: calc(100vh - 100px);
  }
  
  .calendar-controls .row {
    flex-direction: column;
    gap: 16px;
  }
  
  .month-cell {
    min-height: 60px;
    padding: 4px;
  }
  
  .event-item {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .week-grid,
  .day-grid {
    grid-template-columns: 60px 1fr;
  }
  
  .time-slot {
    height: 40px;
  }
  
  .time-cell {
    height: 40px;
  }
}

/* Animation for view transitions */
.month-view,
.week-view,
.day-view {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>