<template>
  <div class="calendar-view">
    <!-- Calendar Header -->
    <div class="calendar-header q-pa-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="calendar-title">
              <div class="text-h5 spasta-text">
                <q-icon name="event" class="q-mr-sm icon-lg" />
                Calendar
              </div>
              <div class="text-body2 spasta-text opacity-70">
                {{ currentDateDisplay }}
              </div>
            </div>
            
            <div class="calendar-controls row items-center spacing-md">
              <!-- View Toggle -->
              <q-btn-toggle
                v-model="currentView"
                :options="[
                  { label: 'Month', value: 'month' },
                  { label: 'Week', value: 'week' },
                  { label: 'Day', value: 'day' }
                ]"
                color="white"
                text-color="grey-8"
                toggle-color="primary"
                toggle-text-color="white"
                class="view-toggle"
              />
              
              <!-- Navigation -->
              <div class="navigation-controls row items-center spacing-sm">
                <q-btn
                  flat
                  round
                  icon="chevron_left"
                  @click="navigatePrevious"
                  class="spasta-text"
                />
                <q-btn
                  flat
                  label="Today"
                  @click="goToToday"
                  class="spasta-text"
                />
                <q-btn
                  flat
                  round
                  icon="chevron_right"
                  @click="navigateNext"
                  class="spasta-text"
                />
              </div>
              
              <!-- Category Filter -->
              <q-select
                v-model="selectedCategoryFilter"
                :options="categoryFilterOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Filter by category"
                class="spasta-input category-filter"
                color="white"
                label-color="white"
                dark
                clearable
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Calendar Content -->
    <div class="calendar-content q-pa-md q-pt-none">
      <q-card class="spasta-card calendar-main">
        <!-- Month View -->
        <div v-if="currentView === 'month'" class="month-view">
          <div class="month-grid">
            <!-- Days of Week Header -->
            <div class="weekdays-header">
              <div v-for="day in weekdays" :key="day" class="weekday-header">
                <div class="text-body2 text-weight-medium spasta-text">{{ day }}</div>
              </div>
            </div>
            
            <!-- Calendar Days -->
            <div class="calendar-days">
              <div
                v-for="day in monthDays"
                :key="`${day.date}-${day.month}`"
                class="calendar-day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-events': day.events.length > 0
                }"
                @click="selectDay(day)"
              >
                <div class="day-number">
                  <span class="text-body2 spasta-text">{{ day.date }}</span>
                </div>
                
                <div class="day-events">
                  <div
                    v-for="event in day.events.slice(0, 3)"
                    :key="event.id"
                    class="event-item"
                    :class="`priority-${event.priority}`"
                    @click.stop="editEvent(event)"
                  >
                    <div class="event-title">{{ event.title }}</div>
                    <div v-if="event.startTime" class="event-time">{{ event.startTime }}</div>
                  </div>
                  
                  <div v-if="day.events.length > 3" class="more-events">
                    <span class="text-caption spasta-text">+{{ day.events.length - 3 }} more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Week View -->
        <div v-if="currentView === 'week'" class="week-view">
          <div class="week-grid">
            <!-- Time Column -->
            <div class="time-column">
              <div class="time-header"></div>
              <div
                v-for="hour in hours"
                :key="hour"
                class="time-slot"
              >
                <span class="text-caption spasta-text">{{ formatHour(hour) }}</span>
              </div>
            </div>
            
            <!-- Days Columns -->
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="day-column"
              :class="{ 'today': day.isToday }"
            >
              <!-- Day Header -->
              <div class="day-header" @click="selectDay(day)">
                <div class="text-body2 text-weight-medium spasta-text">{{ day.dayName }}</div>
                <div class="text-h6 spasta-text">{{ day.date }}</div>
              </div>
              
              <!-- Hour Slots -->
              <div class="hour-slots">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="hour-slot"
                  @click="createEventAtTime(day, hour)"
                >
                  <!-- Events in this hour -->
                  <div
                    v-for="event in getEventsForDayAndHour(day, hour)"
                    :key="event.id"
                    class="week-event"
                    :class="`priority-${event.priority}`"
                    @click.stop="editEvent(event)"
                  >
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Day View -->
        <div v-if="currentView === 'day'" class="day-view">
          <div class="day-grid">
            <!-- Time Column -->
            <div class="time-column">
              <div
                v-for="hour in hours"
                :key="hour"
                class="time-slot"
              >
                <span class="text-body2 spasta-text">{{ formatHour(hour) }}</span>
              </div>
            </div>
            
            <!-- Day Column -->
            <div class="day-column-full">
              <div class="day-header-full">
                <div class="text-h5 spasta-text">{{ selectedDayDisplay }}</div>
              </div>
              
              <div class="hour-slots-full">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="hour-slot-full"
                  @click="createEventAtTime(selectedDayData, hour)"
                >
                  <!-- Events in this hour -->
                  <div
                    v-for="event in getEventsForDayAndHour(selectedDayData, hour)"
                    :key="event.id"
                    class="day-event"
                    :class="`priority-${event.priority}`"
                    @click.stop="editEvent(event)"
                  >
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-details">
                      <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
                      <div class="event-category">{{ event.category }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  :options="categoryOptions"
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

              <q-input
                v-model="eventForm.recurrence.endDate"
                label="End Date (optional)"
                outlined
                type="date"
                class="spasta-input"
                color="white"
                label-color="white"
                dark
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="closeEventDialog" 
            class="spasta-text" 
            icon="close"
            size="lg"
          />
          <q-btn 
            flat 
            label="Save Event" 
            color="white" 
            text-color="grey-8"
            @click="saveEvent"
            icon="save"
            size="lg"
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
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedCategoryFilter = ref<string | null>(null)
const showEventDialog = ref(false)
const editingEvent = ref<Task | null>(null)

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
  } as TaskRecurrence
})

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 24 }, (_, i) => i)

const currentDateDisplay = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long'
  }
  
  if (currentView.value === 'week') {
    const startOfWeek = getStartOfWeek(currentDate.value)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else if (currentView.value === 'day') {
    return selectedDate.value.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return currentDate.value.toLocaleDateString('en-US', options)
})

const selectedDayDisplay = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const selectedDayData = computed(() => {
  return {
    date: selectedDate.value.getDate(),
    month: selectedDate.value.getMonth(),
    year: selectedDate.value.getFullYear(),
    isToday: isToday(selectedDate.value),
    isCurrentMonth: true,
    events: getEventsForDate(selectedDate.value),
    dayName: selectedDate.value.toLocaleDateString('en-US', { weekday: 'short' })
  }
})

const categoryFilterOptions = computed(() => {
  const options = [{ label: 'All Categories', value: null }]
  categoryStore.categories.forEach(cat => {
    options.push({ label: cat.name, value: cat.name })
  })
  return options
})

const categoryOptions = computed(() => {
  return categoryStore.categories.map(cat => cat.name)
})

const filteredTasks = computed(() => {
  let tasks = taskStore.tasks.filter(task => task.dueDate || task.startDate)
  
  if (selectedCategoryFilter.value) {
    tasks = tasks.filter(task => task.category === selectedCategoryFilter.value)
  }
  
  return tasks
})

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const currentDateObj = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    const dayEvents = getEventsForDate(currentDateObj)
    
    days.push({
      date: currentDateObj.getDate(),
      month: currentDateObj.getMonth(),
      year: currentDateObj.getFullYear(),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: isToday(currentDateObj),
      events: dayEvents
    })
    
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return days
})

const weekDays = computed(() => {
  const startOfWeek = getStartOfWeek(currentDate.value)
  const days = []
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    
    days.push({
      date: day.getDate(),
      month: day.getMonth(),
      year: day.getFullYear(),
      isToday: isToday(day),
      events: getEventsForDate(day),
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' })
    })
  }
  
  return days
})

const getStartOfWeek = (date: Date) => {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return start
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getEventsForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return filteredTasks.value.filter(task => {
    const taskDate = task.dueDate || task.startDate
    return taskDate && taskDate.startsWith(dateStr)
  })
}

const getEventsForDayAndHour = (day: any, hour: number) => {
  const date = new Date(day.year, day.month, day.date)
  const dateStr = date.toISOString().split('T')[0]
  
  return filteredTasks.value.filter(task => {
    const taskDate = task.dueDate || task.startDate
    if (!taskDate || !taskDate.startsWith(dateStr)) return false
    
    if (task.startTime) {
      const taskHour = parseInt(task.startTime.split(':')[0])
      return taskHour === hour
    }
    
    return hour === 9 // Default to 9 AM for tasks without time
  })
}

const formatHour = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:00 ${period}`
}

const navigatePrevious = () => {
  const newDate = new Date(currentDate.value)
  
  if (currentView.value === 'month') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else if (currentView.value === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else if (currentView.value === 'day') {
    newDate.setDate(newDate.getDate() - 1)
    selectedDate.value = new Date(newDate)
  }
  
  currentDate.value = newDate
}

const navigateNext = () => {
  const newDate = new Date(currentDate.value)
  
  if (currentView.value === 'month') {
    newDate.setMonth(newDate.getMonth() + 1)
  } else if (currentView.value === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else if (currentView.value === 'day') {
    newDate.setDate(newDate.getDate() + 1)
    selectedDate.value = new Date(newDate)
  }
  
  currentDate.value = newDate
}

const goToToday = () => {
  const today = new Date()
  currentDate.value = today
  selectedDate.value = today
}

const selectDay = (day: any) => {
  const date = new Date(day.year, day.month, day.date)
  selectedDate.value = date
  
  if (currentView.value !== 'day') {
    currentView.value = 'day'
    currentDate.value = date
  }
}

const createEventAtTime = (day: any, hour: number) => {
  const date = new Date(day.year, day.month, day.date)
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = `${hour.toString().padStart(2, '0')}:00`
  
  eventForm.value = {
    title: '',
    description: '',
    startDate: dateStr,
    startTime: timeStr,
    endDate: dateStr,
    endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
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
  
  editingEvent.value = null
  showEventDialog.value = true
}

const editEvent = (event: Task) => {
  editingEvent.value = event
  
  eventForm.value = {
    title: event.title,
    description: event.description,
    startDate: event.startDate || event.dueDate || '',
    startTime: event.startTime || '',
    endDate: event.endDate || event.dueDate || '',
    endTime: event.endTime || '',
    category: event.category,
    priority: event.priority,
    isRecurring: event.isRecurring || false,
    recurrence: event.recurrence || {
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
    const eventData = {
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
      dueDate: eventForm.value.startDate,
      isRecurring: eventForm.value.isRecurring,
      recurrence: eventForm.value.isRecurring ? eventForm.value.recurrence : undefined
    }

    if (editingEvent.value) {
      await taskStore.updateTask(editingEvent.value.id, eventData)
      $q.notify({
        type: 'positive',
        message: 'Event updated successfully',
        position: 'top-right',
        timeout: 2000
      })
    } else {
      await taskStore.addTask(eventData)
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

onMounted(() => {
  taskStore.loadTasks()
  categoryStore.loadCategories()
})

watch(() => currentView.value, (newView) => {
  if (newView === 'day' && !selectedDate.value) {
    selectedDate.value = new Date()
  }
})
</script>

<style scoped>
.calendar-view {
  height: calc(100vh - 150px);
  width: 100%;
}

.calendar-header {
  padding-bottom: 0;
}

.calendar-controls {
  gap: 16px;
}

.view-toggle {
  border-radius: 8px;
}

.navigation-controls {
  gap: 8px;
}

.category-filter {
  min-width: 200px;
}

.calendar-main {
  min-height: 600px;
}

/* Month View */
.month-grid {
  padding: 20px;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
}

.weekday-header {
  padding: 12px;
  text-align: center;
  background: rgba(58, 107, 140, 0.2);
  border-radius: 8px 8px 0 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  background: rgba(58, 107, 140, 0.1);
  border: 1px solid rgba(239, 228, 210, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background: rgba(58, 107, 140, 0.2);
  border-color: rgba(239, 228, 210, 0.3);
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.today {
  background: rgba(239, 228, 210, 0.1);
  border-color: #EFE4D2;
}

.day-number {
  margin-bottom: 4px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-item:hover {
  transform: scale(1.02);
}

.event-item.priority-high {
  background: rgba(244, 67, 54, 0.8);
  color: white;
}

.event-item.priority-medium {
  background: rgba(255, 193, 7, 0.8);
  color: black;
}

.event-item.priority-low {
  background: rgba(76, 175, 80, 0.8);
  color: white;
}

.event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 10px;
  opacity: 0.8;
}

.more-events {
  padding: 2px 6px;
  text-align: center;
  opacity: 0.7;
}

/* Week View */
.week-grid {
  display: flex;
  padding: 20px;
}

.time-column {
  width: 80px;
  flex-shrink: 0;
}

.time-header {
  height: 60px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
}

.time-slot {
  height: 60px;
  padding: 4px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.day-column {
  flex: 1;
  border-left: 1px solid rgba(239, 228, 210, 0.2);
}

.day-column.today {
  background: rgba(239, 228, 210, 0.05);
}

.day-header {
  height: 60px;
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-header:hover {
  background: rgba(58, 107, 140, 0.1);
}

.hour-slots {
  display: flex;
  flex-direction: column;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.hour-slot:hover {
  background: rgba(58, 107, 140, 0.1);
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  top: 2px;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  z-index: 1;
}

/* Day View */
.day-grid {
  display: flex;
  padding: 20px;
}

.day-column-full {
  flex: 1;
  border-left: 1px solid rgba(239, 228, 210, 0.2);
}

.day-header-full {
  height: 60px;
  padding: 16px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  text-align: center;
}

.hour-slots-full {
  display: flex;
  flex-direction: column;
}

.hour-slot-full {
  height: 80px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.hour-slot-full:hover {
  background: rgba(58, 107, 140, 0.1);
}

.day-event {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 1;
}

.event-details {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-category {
  font-size: 11px;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-view {
    height: calc(100vh - 200px);
  }
  
  .calendar-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .category-filter {
    min-width: auto;
    width: 100%;
  }
  
  .calendar-day {
    min-height: 80px;
  }
  
  .week-grid,
  .day-grid {
    padding: 12px;
  }
  
  .time-column {
    width: 60px;
  }
  
  .time-slot,
  .hour-slot,
  .hour-slot-full {
    height: 40px;
  }
  
  .day-header {
    height: 40px;
    padding: 4px;
  }
}
</style>