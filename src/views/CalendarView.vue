<template>
  <div class="calendar-view q-pa-md">
    <!-- Calendar Header -->
    <div class="row q-gutter-md q-mb-md slide-in-up">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h5 spasta-text">
                <q-icon name="event" class="q-mr-sm icon-lg" />
                Task Calendar
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  icon="today"
                  label="Today"
                  @click="goToToday"
                  class="spasta-text"
                />
                <q-btn
                  flat
                  icon="add"
                  label="Add Task"
                  @click="showTaskDialog = true"
                  class="spasta-text"
                />
                <q-btn-toggle
                  v-model="calendarView"
                  :options="[
                    { label: 'Month', value: 'month' },
                    { label: 'Week', value: 'week' },
                    { label: 'Day', value: 'day' }
                  ]"
                  color="white"
                  text-color="grey-8"
                  toggle-color="primary"
                  toggle-text-color="white"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Calendar Component -->
    <div class="row slide-in-up" style="animation-delay: 0.2s;">
      <div class="col-12">
        <q-card class="spasta-card calendar-container">
          <q-card-section>
            <!-- Calendar Navigation -->
            <div class="calendar-nav row items-center justify-between q-mb-lg">
              <div class="row items-center">
                <q-btn
                  flat
                  round
                  icon="chevron_left"
                  @click="previousPeriod"
                  class="spasta-text"
                />
                <div class="text-h6 spasta-text q-mx-md">{{ currentPeriodLabel }}</div>
                <q-btn
                  flat
                  round
                  icon="chevron_right"
                  @click="nextPeriod"
                  class="spasta-text"
                />
              </div>
              <q-btn
                flat
                icon="sync"
                label="Sync with Tasks"
                @click="syncWithTaskBoard"
                class="spasta-text"
                :loading="syncing"
              />
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-grid">
              <!-- Month View -->
              <div v-if="calendarView === 'month'" class="month-view">
                <!-- Weekday Headers -->
                <div class="weekday-headers">
                  <div v-for="day in weekdays" :key="day" class="weekday-header">
                    {{ day }}
                  </div>
                </div>
                
                <!-- Calendar Days -->
                <div class="calendar-days">
                  <div
                    v-for="day in calendarDays"
                    :key="day.date"
                    class="calendar-day"
                    :class="{
                      'other-month': !day.isCurrentMonth,
                      'today': day.isToday,
                      'selected': day.date === selectedDate,
                      'has-events': day.events.length > 0
                    }"
                    @click="selectDate(day.date)"
                  >
                    <div class="day-number">{{ day.dayNumber }}</div>
                    <div class="day-events">
                      <div
                        v-for="event in day.events.slice(0, 3)"
                        :key="event.id"
                        class="calendar-event"
                        :class="getEventClass(event)"
                        @click.stop="viewEvent(event)"
                      >
                        <div class="event-title">{{ event.title }}</div>
                        <div class="event-time">{{ formatEventTime(event) }}</div>
                      </div>
                      <div v-if="day.events.length > 3" class="more-events">
                        +{{ day.events.length - 3 }} more
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Week View -->
              <div v-else-if="calendarView === 'week'" class="week-view">
                <div class="week-header">
                  <div v-for="day in weekDays" :key="day.date" class="week-day-header">
                    <div class="day-name">{{ day.dayName }}</div>
                    <div class="day-date" :class="{ 'today': day.isToday }">{{ day.dayNumber }}</div>
                  </div>
                </div>
                <div class="week-content">
                  <div v-for="day in weekDays" :key="day.date" class="week-day-column">
                    <div
                      v-for="event in day.events"
                      :key="event.id"
                      class="calendar-event week-event"
                      :class="getEventClass(event)"
                      @click="viewEvent(event)"
                    >
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-time">{{ formatEventTime(event) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Day View -->
              <div v-else class="day-view">
                <div class="day-header">
                  <div class="text-h6 spasta-text">{{ selectedDayLabel }}</div>
                </div>
                <div class="day-content">
                  <div class="time-slots">
                    <div v-for="hour in dayHours" :key="hour" class="time-slot">
                      <div class="time-label">{{ formatHour(hour) }}</div>
                      <div class="time-content">
                        <div
                          v-for="event in getEventsForHour(hour)"
                          :key="event.id"
                          class="calendar-event day-event"
                          :class="getEventClass(event)"
                          @click="viewEvent(event)"
                        >
                          <div class="event-title">{{ event.title }}</div>
                          <div class="event-time">{{ formatEventTime(event) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
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
              rows="3"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model="taskForm.startDate"
                  label="Start Date"
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
                  v-model="taskForm.startTime"
                  label="Start Time"
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
                <q-input
                  v-model="taskForm.endDate"
                  label="End Date"
                  outlined
                  dense
                  type="date"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-input
                  v-model="taskForm.endTime"
                  label="End Time"
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

            <!-- Recurring Options -->
            <q-expansion-item
              icon="repeat"
              label="Recurring Task"
              class="spasta-expansion"
            >
              <div class="q-pa-md">
                <q-checkbox
                  v-model="taskForm.isRecurring"
                  label="Make this a recurring task"
                  color="primary"
                  class="spasta-text q-mb-md"
                />

                <div v-if="taskForm.isRecurring" class="q-gutter-md">
                  <q-select
                    v-model="taskForm.recurrence.type"
                    label="Repeat"
                    outlined
                    dense
                    :options="recurrenceOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />

                  <div v-if="taskForm.recurrence.type === 'weekly'" class="q-mb-md">
                    <div class="text-body2 spasta-text q-mb-sm">Repeat on:</div>
                    <div class="row q-gutter-xs">
                      <q-chip
                        v-for="day in weekDays"
                        :key="day.value"
                        :selected="taskForm.recurrence.weekDays.includes(day.value)"
                        @click="toggleWeekDay(day.value)"
                        clickable
                        color="primary"
                        text-color="white"
                        size="sm"
                        :label="day.label"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-input
                        v-model.number="taskForm.recurrence.interval"
                        label="Every"
                        outlined
                        dense
                        type="number"
                        min="1"
                        class="spasta-input"
                        color="white"
                        label-color="white"
                        dark
                      />
                    </div>
                    <div class="col">
                      <q-input
                        v-model="taskForm.recurrence.endDate"
                        label="End Date (optional)"
                        outlined
                        dense
                        type="date"
                        class="spasta-input"
                        color="white"
                        label-color="white"
                        dark
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-expansion-item>
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
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Event Details Dialog -->
    <q-dialog v-model="showEventDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ selectedEvent?.title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="selectedEvent">
            <div class="text-body2 spasta-text q-mb-sm">
              <q-icon name="schedule" class="q-mr-sm" />
              {{ formatEventDateTime(selectedEvent) }}
            </div>
            
            <div v-if="selectedEvent.description" class="text-body2 spasta-text q-mb-sm">
              <q-icon name="description" class="q-mr-sm" />
              {{ selectedEvent.description }}
            </div>
            
            <div class="text-body2 spasta-text q-mb-sm">
              <q-icon name="flag" class="q-mr-sm" />
              Priority: {{ selectedEvent.priority }}
            </div>
            
            <div class="text-body2 spasta-text q-mb-sm">
              <q-icon name="category" class="q-mr-sm" />
              Category: {{ selectedEvent.category }}
            </div>

            <div v-if="selectedEvent.isRecurring" class="text-body2 spasta-text q-mb-sm">
              <q-icon name="repeat" class="q-mr-sm" />
              Recurring: {{ getRecurrenceText(selectedEvent) }}
            </div>

            <div v-if="selectedEvent.isFromTaskBoard" class="text-body2 text-info q-mb-sm">
              <q-icon name="dashboard" class="q-mr-sm" />
              Synced from Task Board
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showEventDialog = false" class="spasta-text" />
          <q-btn 
            v-if="!selectedEvent?.isFromTaskBoard"
            flat 
            label="Edit" 
            color="white" 
            text-color="grey-8"
            @click="editEvent"
          />
          <q-btn 
            v-if="!selectedEvent?.isFromTaskBoard"
            flat 
            label="Delete" 
            color="negative"
            @click="deleteEvent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from '../stores/authStore'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'

interface CalendarTask {
  id: string
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  priority: 'low' | 'medium' | 'high'
  category: string
  isRecurring: boolean
  recurrence: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    weekDays: number[]
    endDate?: string
  }
  createdAt: string
  isFromTaskBoard?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  priority: string
  category: string
  isRecurring: boolean
  recurrence?: any
  isFromTaskBoard?: boolean
}

interface CalendarDay {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

const $q = useQuasar()
const authStore = useAuthStore()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const calendarView = ref('month')
const currentDate = ref(new Date())
const showTaskDialog = ref(false)
const showEventDialog = ref(false)
const editingTask = ref<CalendarTask | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const tasks = ref<CalendarTask[]>([])
const syncing = ref(false)

const taskForm = ref({
  title: '',
  description: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '10:00',
  priority: 'medium' as 'low' | 'medium' | 'high',
  category: 'Work',
  isRecurring: false,
  recurrence: {
    type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: 1,
    weekDays: [] as number[],
    endDate: ''
  }
})

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const categoryOptions = computed(() => {
  return categoryStore.categories.map(cat => ({
    label: cat.name,
    value: cat.name
  }))
})

const recurrenceOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
]

const weekDays = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
]

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dayHours = Array.from({ length: 24 }, (_, i) => i)

const currentPeriodLabel = computed(() => {
  const date = currentDate.value
  if (calendarView.value === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } else if (calendarView.value === 'week') {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
})

const selectedDayLabel = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})

const calendarEvents = computed(() => {
  const events: CalendarEvent[] = []
  
  tasks.value.forEach(task => {
    if (task.isRecurring) {
      const recurringEvents = generateRecurringEvents(task)
      events.push(...recurringEvents)
    } else {
      events.push(taskToEvent(task))
    }
  })
  
  return events
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: CalendarDay[] = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = calendarEvents.value.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0]
      return eventDate === dateStr
    })
    
    days.push({
      date: dateStr,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      events: dayEvents
    })
  }
  
  return days
})

const weekDaysComputed = computed(() => {
  const startOfWeek = new Date(currentDate.value)
  startOfWeek.setDate(currentDate.value.getDate() - currentDate.value.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = calendarEvents.value.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0]
      return eventDate === dateStr
    })
    
    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      events: dayEvents
    })
  }
  
  return days
})

const taskToEvent = (task: CalendarTask): CalendarEvent => {
  const startDateTime = `${task.startDate}T${task.startTime || '00:00'}`
  const endDateTime = `${task.endDate || task.startDate}T${task.endTime || '23:59'}`
  
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    start: startDateTime,
    end: endDateTime,
    priority: task.priority,
    category: task.category,
    isRecurring: task.isRecurring,
    recurrence: task.recurrence,
    isFromTaskBoard: task.isFromTaskBoard
  }
}

const generateRecurringEvents = (task: CalendarTask): CalendarEvent[] => {
  const events: CalendarEvent[] = []
  const startDate = new Date(task.startDate)
  const endDate = task.recurrence.endDate ? new Date(task.recurrence.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  const interval = task.recurrence.interval || 1
  
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    let shouldAddEvent = true
    
    if (task.recurrence.type === 'weekly' && task.recurrence.weekDays.length > 0) {
      shouldAddEvent = task.recurrence.weekDays.includes(currentDate.getDay())
    }
    
    if (shouldAddEvent) {
      const eventStartDate = currentDate.toISOString().split('T')[0]
      const eventEndDate = task.endDate ? 
        new Date(currentDate.getTime() + (new Date(task.endDate).getTime() - new Date(task.startDate).getTime())).toISOString().split('T')[0] :
        eventStartDate
      
      events.push({
        id: `${task.id}-${currentDate.getTime()}`,
        title: task.title,
        description: task.description,
        start: `${eventStartDate}T${task.startTime || '00:00'}`,
        end: `${eventEndDate}T${task.endTime || '23:59'}`,
        priority: task.priority,
        category: task.category,
        isRecurring: true,
        recurrence: task.recurrence,
        isFromTaskBoard: task.isFromTaskBoard
      })
    }
    
    switch (task.recurrence.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * interval))
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval)
        break
    }
  }
  
  return events
}

const getEventClass = (event: CalendarEvent) => {
  return {
    'event-high': event.priority === 'high',
    'event-medium': event.priority === 'medium',
    'event-low': event.priority === 'low',
    'event-recurring': event.isRecurring,
    'event-from-board': event.isFromTaskBoard
  }
}

const getEventsForHour = (hour: number) => {
  const selectedDateEvents = calendarEvents.value.filter(event => {
    const eventDate = new Date(event.start).toISOString().split('T')[0]
    return eventDate === selectedDate.value
  })
  
  return selectedDateEvents.filter(event => {
    const eventHour = new Date(event.start).getHours()
    return eventHour === hour
  })
}

const formatEventTime = (event: CalendarEvent) => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

const formatEventDateTime = (event: CalendarEvent) => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const startDate = start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  
  return `${startDate} from ${startTime} to ${endTime}`
}

const formatHour = (hour: number) => {
  return new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const getRecurrenceText = (event: CalendarEvent) => {
  if (!event.recurrence) return ''
  
  const { type, interval, weekDays } = event.recurrence
  let text = `Every ${interval > 1 ? interval + ' ' : ''}${type}`
  
  if (type === 'weekly' && weekDays.length > 0) {
    const dayNames = weekDays.map((day: number) => weekdays[day]).join(', ')
    text += ` on ${dayNames}`
  }
  
  return text
}

const syncWithTaskBoard = async () => {
  syncing.value = true
  try {
    // Get tasks from task board that have due dates
    const boardTasks = taskStore.tasks.filter(task => task.dueDate)
    
    // Convert board tasks to calendar tasks
    const calendarTasksFromBoard = boardTasks.map(task => ({
      id: `board-${task.id}`,
      title: task.title,
      description: task.description,
      startDate: task.dueDate!,
      startTime: '09:00',
      endDate: task.dueDate!,
      endTime: '17:00',
      priority: task.priority,
      category: task.category,
      isRecurring: false,
      recurrence: {
        type: 'daily' as const,
        interval: 1,
        weekDays: []
      },
      createdAt: task.createdAt,
      isFromTaskBoard: true
    }))
    
    // Remove existing synced tasks and add new ones
    tasks.value = tasks.value.filter(task => !task.isFromTaskBoard)
    tasks.value.push(...calendarTasksFromBoard)
    
    // Save to storage
    if (authStore.user?.id === 'guest') {
      localStorage.setItem('spasta_calendar_tasks', JSON.stringify(tasks.value))
    }
    
    $q.notify({
      type: 'positive',
      message: `Synced ${calendarTasksFromBoard.length} tasks from Task Board`,
      position: 'top-right',
      timeout: 3000
    })
  } catch (error) {
    console.error('Error syncing with task board:', error)
    $q.notify({
      type: 'negative',
      message: 'Error syncing with Task Board',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    syncing.value = false
  }
}

const loadTasks = async () => {
  if (!authStore.user?.id) return

  try {
    if (authStore.user.id === 'guest') {
      const stored = localStorage.getItem('spasta_calendar_tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      } else {
        tasks.value = []
      }
    } else {
      tasks.value = await firestoreService.getCalendarTasks(authStore.user.id)
    }
    
    // Auto-sync with task board on load
    await syncWithTaskBoard()
  } catch (error) {
    console.error('Error loading calendar tasks:', error)
  }
}

const saveTasks = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_calendar_tasks', JSON.stringify(tasks.value))
  }
}

const goToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date().toISOString().split('T')[0]
}

const previousPeriod = () => {
  const date = new Date(currentDate.value)
  if (calendarView.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (calendarView.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

const nextPeriod = () => {
  const date = new Date(currentDate.value)
  if (calendarView.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (calendarView.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

const selectDate = (date: string) => {
  selectedDate.value = date
  if (calendarView.value !== 'day') {
    taskForm.value.startDate = date
    taskForm.value.endDate = date
    showTaskDialog.value = true
  }
}

const viewEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventDialog.value = true
}

const editEvent = () => {
  if (selectedEvent.value && !selectedEvent.value.isFromTaskBoard) {
    const task = tasks.value.find(t => t.id === selectedEvent.value!.id.split('-')[0])
    if (task) {
      editingTask.value = task
      taskForm.value = {
        title: task.title,
        description: task.description,
        startDate: task.startDate,
        startTime: task.startTime,
        endDate: task.endDate,
        endTime: task.endTime,
        priority: task.priority,
        category: task.category,
        isRecurring: task.isRecurring,
        recurrence: { ...task.recurrence }
      }
      showEventDialog.value = false
      showTaskDialog.value = true
    }
  }
}

const deleteEvent = () => {
  if (selectedEvent.value && !selectedEvent.value.isFromTaskBoard) {
    $q.dialog({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      cancel: true,
      persistent: true,
      class: 'spasta-card'
    }).onOk(async () => {
      const taskId = selectedEvent.value!.id.split('-')[0]
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        if (authStore.user?.id === 'guest') {
          tasks.value.splice(index, 1)
          saveTasks()
        } else {
          const success = await firestoreService.deleteCalendarTask(taskId)
          if (success) {
            tasks.value.splice(index, 1)
          }
        }
        showEventDialog.value = false
        
        $q.notify({
          type: 'positive',
          message: 'Task deleted successfully',
          position: 'top-right',
          timeout: 2000
        })
      }
    })
  }
}

const toggleWeekDay = (day: number) => {
  const index = taskForm.value.recurrence.weekDays.indexOf(day)
  if (index > -1) {
    taskForm.value.recurrence.weekDays.splice(index, 1)
  } else {
    taskForm.value.recurrence.weekDays.push(day)
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

  if (!authStore.user?.id) return

  const taskData: CalendarTask = {
    id: editingTask.value?.id || Date.now().toString(),
    title: taskForm.value.title,
    description: taskForm.value.description,
    startDate: taskForm.value.startDate,
    startTime: taskForm.value.startTime,
    endDate: taskForm.value.endDate || taskForm.value.startDate,
    endTime: taskForm.value.endTime,
    priority: taskForm.value.priority,
    category: taskForm.value.category,
    isRecurring: taskForm.value.isRecurring,
    recurrence: { ...taskForm.value.recurrence },
    createdAt: editingTask.value?.createdAt || new Date().toISOString(),
    isFromTaskBoard: false
  }

  try {
    if (editingTask.value) {
      const index = tasks.value.findIndex(t => t.id === editingTask.value!.id)
      if (index !== -1) {
        if (authStore.user.id === 'guest') {
          tasks.value[index] = taskData
          saveTasks()
        } else {
          const success = await firestoreService.updateCalendarTask(editingTask.value.id, taskData)
          if (success) {
            tasks.value[index] = taskData
          }
        }
      }
    } else {
      if (authStore.user.id === 'guest') {
        tasks.value.push(taskData)
        saveTasks()
      } else {
        const newTask = await firestoreService.addCalendarTask(authStore.user.id, taskData)
        if (newTask) {
          tasks.value.push(newTask)
        }
      }
    }

    closeTaskDialog()

    $q.notify({
      type: 'positive',
      message: editingTask.value ? 'Task updated successfully' : 'Task created successfully',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error saving task:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving task. Please try again.',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const closeTaskDialog = () => {
  showTaskDialog.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    priority: 'medium',
    category: 'Work',
    isRecurring: false,
    recurrence: {
      type: 'daily',
      interval: 1,
      weekDays: [],
      endDate: ''
    }
  }
}

// Watch for task store changes to auto-sync
watch(() => taskStore.tasks, () => {
  if (taskStore.tasks.length > 0) {
    syncWithTaskBoard()
  }
}, { deep: true })

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.calendar-view {
  height: calc(100vh - 150px);
  margin-top: 0;
}

.calendar-container {
  min-height: 600px;
}

.calendar-nav {
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  padding-bottom: 16px;
}

.calendar-grid {
  width: 100%;
}

/* Month View */
.month-view {
  width: 100%;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 8px;
}

.weekday-header {
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  background: rgba(58, 107, 140, 0.3);
  color: #EFE4D2;
  border-radius: 8px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(239, 228, 210, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  background: rgba(58, 107, 140, 0.1);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.calendar-day:hover {
  background: rgba(58, 107, 140, 0.2);
  transform: scale(1.02);
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.today {
  background: rgba(114, 92, 173, 0.3);
  border: 2px solid #EFE4D2;
}

.calendar-day.selected {
  background: rgba(114, 92, 173, 0.4);
  border: 2px solid #EFE4D2;
}

.calendar-day.has-events {
  border-left: 4px solid #EFE4D2;
}

.day-number {
  font-weight: 600;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-event {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.calendar-event:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.event-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 10px;
  opacity: 0.8;
}

.more-events {
  font-size: 10px;
  color: #EFE4D2;
  opacity: 0.7;
  text-align: center;
  padding: 2px;
}

/* Week View */
.week-view {
  width: 100%;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.week-day-header {
  text-align: center;
  padding: 12px;
  background: rgba(58, 107, 140, 0.2);
  border-radius: 12px;
}

.day-name {
  font-weight: 600;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.day-date {
  font-size: 18px;
  font-weight: 700;
  color: #EFE4D2;
}

.day-date.today {
  color: #FFE3A9;
  background: rgba(255, 227, 169, 0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.week-content {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-height: 400px;
}

.week-day-column {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.week-event {
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
}

/* Day View */
.day-view {
  width: 100%;
}

.day-header {
  text-align: center;
  padding: 16px;
  background: rgba(58, 107, 140, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
}

.day-content {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.time-slots {
  display: flex;
  flex-direction: column;
}

.time-slot {
  display: flex;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  min-height: 60px;
}

.time-label {
  width: 80px;
  padding: 8px;
  font-size: 12px;
  color: #EFE4D2;
  opacity: 0.7;
  border-right: 1px solid rgba(239, 228, 210, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-content {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-event {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
}

/* Event Colors */
.event-high {
  background: rgba(193, 0, 21, 0.8);
  color: white;
}

.event-medium {
  background: rgba(242, 192, 55, 0.8);
  color: #333;
}

.event-low {
  background: rgba(33, 186, 69, 0.8);
  color: white;
}

.event-recurring {
  border-left: 4px solid #EFE4D2;
}

.event-from-board {
  border: 2px solid #FFE3A9;
  background: rgba(255, 227, 169, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-view {
    height: calc(100vh - 200px);
    padding: 12px;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 12px;
  }
  
  .calendar-event {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .week-content {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .week-day-column {
    min-height: 100px;
  }
  
  .time-label {
    width: 60px;
    font-size: 10px;
  }
  
  .time-slot {
    min-height: 40px;
  }
}

/* Animation Classes */
.slide-in-up {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Calendar Navigation Animations */
.calendar-nav .q-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-nav .q-btn:hover {
  transform: scale(1.1);
}

/* Expansion Item Styling */
.spasta-expansion :deep(.q-expansion-item__header) {
  color: #EFE4D2;
  border-radius: 12px;
}

.spasta-expansion :deep(.q-expansion-item__content) {
  background-color: rgba(239, 228, 210, 0.05);
  border-radius: 0 0 12px 12px;
}
</style>