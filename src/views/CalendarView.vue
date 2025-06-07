<template>
  <div class="calendar-view q-pa-md">
    <!-- Calendar Header -->
    <div class="row q-gutter-md q-mb-md">
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
    <div class="row">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-card-section>
            <q-calendar-month
              v-if="calendarView === 'month'"
              v-model="selectedDate"
              :events="calendarEvents"
              event-color="primary"
              class="spasta-calendar"
              @click-event="viewEvent"
              @click-date="selectDate"
            >
              <template #event="{ event }">
                <div class="calendar-event" :class="getEventClass(event)">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-time">{{ formatEventTime(event) }}</div>
                </div>
              </template>
            </q-calendar-month>

            <q-calendar-agenda
              v-else-if="calendarView === 'week'"
              v-model="selectedDate"
              view="week"
              :events="calendarEvents"
              class="spasta-calendar"
              @click-event="viewEvent"
            >
              <template #event="{ event }">
                <div class="calendar-event" :class="getEventClass(event)">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-time">{{ formatEventTime(event) }}</div>
                </div>
              </template>
            </q-calendar-agenda>

            <q-calendar-agenda
              v-else
              v-model="selectedDate"
              view="day"
              :events="calendarEvents"
              class="spasta-calendar"
              @click-event="viewEvent"
            >
              <template #event="{ event }">
                <div class="calendar-event" :class="getEventClass(event)">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-time">{{ formatEventTime(event) }}</div>
                </div>
              </template>
            </q-calendar-agenda>
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
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showEventDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Edit" 
            color="white" 
            text-color="grey-8"
            @click="editEvent"
          />
          <q-btn 
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from '../stores/authStore'

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
}

const $q = useQuasar()
const authStore = useAuthStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])
const calendarView = ref('month')
const showTaskDialog = ref(false)
const showEventDialog = ref(false)
const editingTask = ref<CalendarTask | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const tasks = ref<CalendarTask[]>([])

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

const categoryOptions = [
  { label: 'Work', value: 'Work' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Health', value: 'Health' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Education', value: 'Education' },
  { label: 'Social', value: 'Social' }
]

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

const calendarEvents = computed(() => {
  const events: CalendarEvent[] = []
  
  tasks.value.forEach(task => {
    if (task.isRecurring) {
      // Generate recurring events
      const recurringEvents = generateRecurringEvents(task)
      events.push(...recurringEvents)
    } else {
      // Single event
      events.push(taskToEvent(task))
    }
  })
  
  return events
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
    recurrence: task.recurrence
  }
}

const generateRecurringEvents = (task: CalendarTask): CalendarEvent[] => {
  const events: CalendarEvent[] = []
  const startDate = new Date(task.startDate)
  const endDate = task.recurrence.endDate ? new Date(task.recurrence.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
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
        recurrence: task.recurrence
      })
    }
    
    // Move to next occurrence
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
    'event-recurring': event.isRecurring
  }
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

const getRecurrenceText = (event: CalendarEvent) => {
  if (!event.recurrence) return ''
  
  const { type, interval, weekDays } = event.recurrence
  let text = `Every ${interval > 1 ? interval + ' ' : ''}${type}`
  
  if (type === 'weekly' && weekDays.length > 0) {
    const dayNames = weekDays.map((day: number) => weekDays.find((d: any) => d.value === day)?.label || '').join(', ')
    text += ` on ${dayNames}`
  }
  
  return text
}

const loadTasks = async () => {
  if (!authStore.user?.id) return

  try {
    if (authStore.user.id === 'guest') {
      const stored = localStorage.getItem('spasta_calendar_tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      } else {
        // Add demo tasks
        tasks.value = [
          {
            id: '1',
            title: 'Daily Standup',
            description: 'Team daily standup meeting',
            startDate: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endDate: new Date().toISOString().split('T')[0],
            endTime: '09:30',
            priority: 'medium',
            category: 'Work',
            isRecurring: true,
            recurrence: {
              type: 'daily',
              interval: 1,
              weekDays: [1, 2, 3, 4, 5], // Monday to Friday
              endDate: ''
            },
            createdAt: new Date().toISOString()
          }
        ]
        saveTasks()
      }
    } else {
      tasks.value = await firestoreService.getCalendarTasks(authStore.user.id)
    }
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
  selectedDate.value = new Date().toISOString().split('T')[0]
}

const selectDate = (date: string) => {
  selectedDate.value = date
  taskForm.value.startDate = date
  taskForm.value.endDate = date
  showTaskDialog.value = true
}

const viewEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventDialog.value = true
}

const editEvent = () => {
  if (selectedEvent.value) {
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
  if (selectedEvent.value) {
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
    createdAt: editingTask.value?.createdAt || new Date().toISOString()
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

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.calendar-view {
  height: calc(100vh - 150px);
  margin-top: 0;
}

.spasta-calendar :deep(.q-calendar-month__head-weekday) {
  background-color: rgba(114, 92, 173, 0.3);
  color: #FFE3A9;
  font-weight: 600;
}

.spasta-calendar :deep(.q-calendar-month__day) {
  background-color: rgba(11, 29, 81, 0.1);
  border: 1px solid rgba(255, 227, 169, 0.1);
}

.spasta-calendar :deep(.q-calendar-month__day--current) {
  background-color: rgba(114, 92, 173, 0.2);
  border-color: #FFE3A9;
}

.spasta-calendar :deep(.q-calendar-month__day:hover) {
  background-color: rgba(114, 92, 173, 0.15);
}

.calendar-event {
  padding: 4px 8px;
  border-radius: 6px;
  margin: 2px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.event-title {
  font-weight: 600;
  font-size: 12px;
  line-height: 1.2;
}

.event-time {
  font-size: 10px;
  opacity: 0.8;
}

.event-high {
  background-color: #C10015;
  color: white;
}

.event-medium {
  background-color: #F2C037;
  color: #333;
}

.event-low {
  background-color: #21BA45;
  color: white;
}

.event-recurring {
  border-left: 4px solid #FFE3A9;
}

.spasta-expansion :deep(.q-expansion-item__header) {
  color: #FFE3A9;
}

.spasta-expansion :deep(.q-expansion-item__content) {
  background-color: rgba(255, 227, 169, 0.05);
  border-radius: 8px;
}
</style>