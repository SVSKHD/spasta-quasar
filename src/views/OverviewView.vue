<template>
  <div class="overview-view">
    <!-- Overview Header -->
    <div class="overview-header q-pa-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="overview-title">
              <div class="text-h5 spasta-text">
                <q-icon name="widgets" class="q-mr-sm icon-lg" />
                Overview Dashboard
              </div>
              <div class="text-body2 spasta-text opacity-70">
                Customize your workspace with resizable widgets
              </div>
            </div>
            
            <div class="overview-controls row items-center spacing-md">
              <q-btn
                flat
                icon="add"
                label="Add Widget"
                @click="showAddWidgetDialog = true"
                class="spasta-text"
              />
              <q-btn
                flat
                icon="settings"
                label="Layout"
                @click="showLayoutDialog = true"
                class="spasta-text"
              />
              <q-btn
                flat
                icon="refresh"
                @click="refreshData"
                class="spasta-text"
                :loading="isLoading"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Widgets Grid -->
    <div class="widgets-container q-pa-md q-pt-none">
      <div class="widgets-grid" ref="widgetsGrid">
        <!-- Quick Stats Widget -->
        <div 
          class="widget-item spasta-card resizable"
          :style="getWidgetStyle('stats')"
          @mousedown="startResize($event, 'stats')"
        >
          <div class="widget-header">
            <div class="widget-title">
              <q-icon name="analytics" class="q-mr-sm" />
              Quick Stats
            </div>
            <q-btn flat round dense icon="more_vert" size="sm" class="spasta-text">
              <q-menu class="spasta-card">
                <q-list>
                  <q-item clickable @click="removeWidget('stats')">
                    <q-item-section avatar><q-icon name="delete" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="widget-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value text-h4 text-positive">{{ taskStore.taskStats.total }}</div>
                <div class="stat-label">Total Tasks</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 text-primary">{{ taskStore.taskStats.inProgress }}</div>
                <div class="stat-label">In Progress</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 text-warning">{{ taskStore.taskStats.todo }}</div>
                <div class="stat-label">To Do</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 text-positive">{{ taskStore.taskStats.done }}</div>
                <div class="stat-label">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Tasks Widget -->
        <div 
          class="widget-item spasta-card resizable"
          :style="getWidgetStyle('recent-tasks')"
          @mousedown="startResize($event, 'recent-tasks')"
        >
          <div class="widget-header">
            <div class="widget-title">
              <q-icon name="assignment" class="q-mr-sm" />
              Recent Tasks
            </div>
            <q-btn flat round dense icon="more_vert" size="sm" class="spasta-text">
              <q-menu class="spasta-card">
                <q-list>
                  <q-item clickable @click="removeWidget('recent-tasks')">
                    <q-item-section avatar><q-icon name="delete" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="widget-content">
            <q-list>
              <q-item 
                v-for="task in recentTasks" 
                :key="task.id"
                class="task-item"
              >
                <q-item-section avatar>
                  <q-icon 
                    :name="getTaskIcon(task.status)" 
                    :color="getTaskColor(task.status)" 
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="spasta-text">{{ task.title }}</q-item-label>
                  <q-item-label caption class="spasta-text opacity-70">{{ task.category }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip 
                    :color="getPriorityColor(task.priority)" 
                    text-color="white" 
                    size="sm"
                    :label="task.priority"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Calendar Widget -->
        <div 
          class="widget-item spasta-card resizable"
          :style="getWidgetStyle('calendar')"
          @mousedown="startResize($event, 'calendar')"
        >
          <div class="widget-header">
            <div class="widget-title">
              <q-icon name="event" class="q-mr-sm" />
              Calendar
            </div>
            <q-btn flat round dense icon="more_vert" size="sm" class="spasta-text">
              <q-menu class="spasta-card">
                <q-list>
                  <q-item clickable @click="removeWidget('calendar')">
                    <q-item-section avatar><q-icon name="delete" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="widget-content">
            <div class="mini-calendar">
              <div class="calendar-header">
                <q-btn flat round dense icon="chevron_left" @click="previousMonth" class="spasta-text" />
                <div class="text-h6 spasta-text">{{ currentMonthYear }}</div>
                <q-btn flat round dense icon="chevron_right" @click="nextMonth" class="spasta-text" />
              </div>
              <div class="calendar-grid">
                <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                <div 
                  v-for="date in calendarDates" 
                  :key="date.key"
                  class="calendar-date"
                  :class="{ 
                    'today': date.isToday, 
                    'other-month': !date.isCurrentMonth,
                    'has-tasks': date.taskCount > 0
                  }"
                >
                  <span>{{ date.date }}</span>
                  <div v-if="date.taskCount > 0" class="task-indicator">{{ date.taskCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Widget -->
        <div 
          class="widget-item spasta-card resizable"
          :style="getWidgetStyle('weather')"
          @mousedown="startResize($event, 'weather')"
        >
          <div class="widget-header">
            <div class="widget-title">
              <q-icon name="wb_sunny" class="q-mr-sm" />
              Weather
            </div>
            <q-btn flat round dense icon="more_vert" size="sm" class="spasta-text">
              <q-menu class="spasta-card">
                <q-list>
                  <q-item clickable @click="removeWidget('weather')">
                    <q-item-section avatar><q-icon name="delete" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="widget-content">
            <div class="weather-info">
              <div class="weather-main">
                <q-icon name="wb_sunny" size="xl" color="warning" />
                <div class="temperature">
                  <div class="text-h3 spasta-text">{{ weather.temperature }}°</div>
                  <div class="text-body2 spasta-text opacity-70">{{ weather.condition }}</div>
                </div>
              </div>
              <div class="weather-details">
                <div class="weather-detail">
                  <q-icon name="location_on" size="sm" />
                  <span>{{ weather.location }}</span>
                </div>
                <div class="weather-detail">
                  <q-icon name="opacity" size="sm" />
                  <span>{{ weather.humidity }}% Humidity</span>
                </div>
                <div class="weather-detail">
                  <q-icon name="air" size="sm" />
                  <span>{{ weather.windSpeed }} km/h Wind</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Finance Widget -->
        <div 
          class="widget-item spasta-card resizable"
          :style="getWidgetStyle('finance')"
          @mousedown="startResize($event, 'finance')"
        >
          <div class="widget-header">
            <div class="widget-title">
              <q-icon name="account_balance_wallet" class="q-mr-sm" />
              Finance
            </div>
            <q-btn flat round dense icon="more_vert" size="sm" class="spasta-text">
              <q-menu class="spasta-card">
                <q-list>
                  <q-item clickable @click="removeWidget('finance')">
                    <q-item-section avatar><q-icon name="delete" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="widget-content">
            <div class="finance-summary">
              <div class="finance-item">
                <div class="finance-label">Total Income</div>
                <div class="finance-value text-positive">${{ financeStore.financeStats.totalIncome.toLocaleString() }}</div>
              </div>
              <div class="finance-item">
                <div class="finance-label">Total Expenses</div>
                <div class="finance-value text-negative">${{ financeStore.financeStats.totalExpenses.toLocaleString() }}</div>
              </div>
              <div class="finance-item">
                <div class="finance-label">Net Income</div>
                <div class="finance-value" :class="financeStore.financeStats.netIncome >= 0 ? 'text-positive' : 'text-negative'">
                  ${{ financeStore.financeStats.netIncome.toLocaleString() }}
                </div>
              </div>
              <div class="finance-item">
                <div class="finance-label">Savings Rate</div>
                <div class="finance-value text-info">{{ financeStore.financeStats.savingsRate.toFixed(1) }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes Widget -->
        <div 
          class="widget-item spasta-card resizable"
          :style="getWidgetStyle('notes')"
          @mousedown="startResize($event, 'notes')"
        >
          <div class="widget-header">
            <div class="widget-title">
              <q-icon name="note" class="q-mr-sm" />
              Quick Notes
            </div>
            <q-btn flat round dense icon="more_vert" size="sm" class="spasta-text">
              <q-menu class="spasta-card">
                <q-list>
                  <q-item clickable @click="removeWidget('notes')">
                    <q-item-section avatar><q-icon name="delete" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="widget-content">
            <q-input
              v-model="quickNote"
              placeholder="Type a quick note..."
              outlined
              type="textarea"
              rows="4"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
              @keyup.ctrl.enter="saveQuickNote"
            />
            <div class="notes-actions q-mt-sm">
              <q-btn 
                flat 
                icon="save" 
                label="Save Note" 
                size="sm"
                @click="saveQuickNote"
                class="spasta-text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Widget Dialog -->
    <q-dialog v-model="showAddWidgetDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Widget</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="widget-options">
            <div 
              v-for="widget in availableWidgets" 
              :key="widget.id"
              class="widget-option"
              @click="addWidget(widget.id)"
            >
              <q-card class="spasta-card-light cursor-pointer">
                <q-card-section class="text-center q-pa-md">
                  <q-icon :name="widget.icon" size="lg" :color="widget.color" class="q-mb-sm" />
                  <div class="text-body1 spasta-text">{{ widget.name }}</div>
                  <div class="text-caption spasta-text opacity-70">{{ widget.description }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showAddWidgetDialog = false" class="spasta-text" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Layout Dialog -->
    <q-dialog v-model="showLayoutDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">Layout Settings</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="layout-options">
            <q-btn-toggle
              v-model="gridColumns"
              :options="[
                { label: '2 Columns', value: 2 },
                { label: '3 Columns', value: 3 },
                { label: '4 Columns', value: 4 }
              ]"
              color="white"
              text-color="grey-8"
              toggle-color="primary"
              toggle-text-color="white"
              class="q-mb-md"
            />
            
            <div class="q-mt-lg">
              <q-btn 
                flat 
                icon="refresh" 
                label="Reset Layout" 
                @click="resetLayout"
                class="spasta-text"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showLayoutDialog = false" class="spasta-text" />
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
import { useFinanceStore } from '../stores/financeStore'
import { useAuthStore } from '../stores/authStore'

const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const financeStore = useFinanceStore()
const authStore = useAuthStore()

// State
const showAddWidgetDialog = ref(false)
const showLayoutDialog = ref(false)
const isLoading = ref(false)
const quickNote = ref('')
const gridColumns = ref(3)
const currentDate = ref(new Date())

// Widget layout state
const widgets = ref({
  'stats': { x: 0, y: 0, width: 2, height: 1, visible: true },
  'recent-tasks': { x: 2, y: 0, width: 1, height: 2, visible: true },
  'calendar': { x: 0, y: 1, width: 1, height: 2, visible: true },
  'weather': { x: 1, y: 1, width: 1, height: 1, visible: true },
  'finance': { x: 0, y: 3, width: 2, height: 1, visible: true },
  'notes': { x: 2, y: 3, width: 1, height: 1, visible: true }
})

const availableWidgets = [
  { id: 'pomodoro', name: 'Pomodoro Timer', description: 'Focus timer with break reminders', icon: 'timer', color: 'positive' },
  { id: 'habits', name: 'Habit Tracker', description: 'Track daily habits and streaks', icon: 'check_circle', color: 'primary' },
  { id: 'goals', name: 'Goals Progress', description: 'Financial goals overview', icon: 'flag', color: 'warning' },
  { id: 'crypto', name: 'Crypto Tracker', description: 'Cryptocurrency prices', icon: 'currency_bitcoin', color: 'orange' },
  { id: 'news', name: 'News Feed', description: 'Latest news updates', icon: 'newspaper', color: 'info' }
]

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Mock weather data
const weather = ref({
  temperature: 22,
  condition: 'Sunny',
  location: 'Your Location',
  humidity: 65,
  windSpeed: 12
})

// Computed properties
const recentTasks = computed(() => {
  return taskStore.tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const currentDateObj = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = currentDateObj.getMonth() === month
    const isToday = currentDateObj.toDateString() === new Date().toDateString()
    const dateStr = currentDateObj.toISOString().split('T')[0]
    const taskCount = taskStore.tasks.filter(task => 
      task.dueDate && task.dueDate.startsWith(dateStr)
    ).length
    
    dates.push({
      key: `${currentDateObj.getFullYear()}-${currentDateObj.getMonth()}-${currentDateObj.getDate()}`,
      date: currentDateObj.getDate(),
      isCurrentMonth,
      isToday,
      taskCount
    })
    
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return dates
})

// Methods
const getWidgetStyle = (widgetId: string) => {
  const widget = widgets.value[widgetId]
  if (!widget || !widget.visible) return { display: 'none' }
  
  const cellSize = 100 / gridColumns.value
  
  return {
    gridColumn: `${widget.x + 1} / span ${widget.width}`,
    gridRow: `${widget.y + 1} / span ${widget.height}`,
    minHeight: `${widget.height * 200}px`
  }
}

const getTaskIcon = (status: string) => {
  switch (status) {
    case 'todo': return 'radio_button_unchecked'
    case 'in-progress': return 'hourglass_empty'
    case 'done': return 'check_circle'
    default: return 'help'
  }
}

const getTaskColor = (status: string) => {
  switch (status) {
    case 'todo': return 'grey'
    case 'in-progress': return 'primary'
    case 'done': return 'positive'
    default: return 'grey'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'positive'
    default: return 'grey'
  }
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const addWidget = (widgetId: string) => {
  // Find next available position
  const maxY = Math.max(...Object.values(widgets.value).map(w => w.y + w.height))
  
  widgets.value[widgetId] = {
    x: 0,
    y: maxY,
    width: 1,
    height: 1,
    visible: true
  }
  
  showAddWidgetDialog.value = false
  saveLayout()
  
  $q.notify({
    type: 'positive',
    message: 'Widget added successfully',
    position: 'top-right',
    timeout: 2000
  })
}

const removeWidget = (widgetId: string) => {
  widgets.value[widgetId].visible = false
  saveLayout()
  
  $q.notify({
    type: 'info',
    message: 'Widget removed',
    position: 'top-right',
    timeout: 2000
  })
}

const resetLayout = () => {
  widgets.value = {
    'stats': { x: 0, y: 0, width: 2, height: 1, visible: true },
    'recent-tasks': { x: 2, y: 0, width: 1, height: 2, visible: true },
    'calendar': { x: 0, y: 1, width: 1, height: 2, visible: true },
    'weather': { x: 1, y: 1, width: 1, height: 1, visible: true },
    'finance': { x: 0, y: 3, width: 2, height: 1, visible: true },
    'notes': { x: 2, y: 3, width: 1, height: 1, visible: true }
  }
  saveLayout()
  
  $q.notify({
    type: 'info',
    message: 'Layout reset to default',
    position: 'top-right',
    timeout: 2000
  })
}

const saveLayout = () => {
  localStorage.setItem('spasta_widget_layout', JSON.stringify(widgets.value))
  localStorage.setItem('spasta_grid_columns', gridColumns.value.toString())
}

const loadLayout = () => {
  const savedLayout = localStorage.getItem('spasta_widget_layout')
  if (savedLayout) {
    widgets.value = JSON.parse(savedLayout)
  }
  
  const savedColumns = localStorage.getItem('spasta_grid_columns')
  if (savedColumns) {
    gridColumns.value = parseInt(savedColumns)
  }
}

const saveQuickNote = () => {
  if (quickNote.value.trim()) {
    // Here you could save to a notes store or local storage
    localStorage.setItem('spasta_quick_note', quickNote.value)
    
    $q.notify({
      type: 'positive',
      message: 'Note saved',
      position: 'top-right',
      timeout: 2000
    })
  }
}

const refreshData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      taskStore.loadTasks(),
      categoryStore.loadCategories(),
      financeStore.loadFinanceData()
    ])
    
    $q.notify({
      type: 'info',
      message: 'Data refreshed',
      position: 'top-right',
      timeout: 1500
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

const startResize = (event: MouseEvent, widgetId: string) => {
  // Placeholder for resize functionality
  // This would implement drag-to-resize logic
}

// Watch for grid column changes
watch(gridColumns, () => {
  saveLayout()
})

onMounted(() => {
  loadLayout()
  
  // Load quick note
  const savedNote = localStorage.getItem('spasta_quick_note')
  if (savedNote) {
    quickNote.value = savedNote
  }
  
  // Load data
  refreshData()
})
</script>

<style scoped>
.overview-view {
  height: calc(100vh - 150px);
  width: 100%;
}

.overview-header {
  padding-bottom: 0;
}

.overview-controls {
  gap: 12px;
}

.widgets-container {
  height: calc(100vh - 250px);
  overflow-y: auto;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(v-bind(gridColumns), 1fr);
  gap: 20px;
  padding: 20px;
  min-height: 100%;
}

.widget-item {
  border-radius: 16px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.widget-item:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 8px 24px rgba(58, 107, 140, 0.3);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  background: rgba(58, 107, 140, 0.1);
}

.widget-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #EFE4D2;
  flex: 1;
}

.widget-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

/* Stats Widget */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.stat-value {
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  color: #EFE4D2;
  opacity: 0.7;
  font-size: 0.9em;
}

/* Task Item */
.task-item {
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(239, 228, 210, 0.05);
  border: 1px solid rgba(239, 228, 210, 0.1);
}

/* Calendar Widget */
.mini-calendar {
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #EFE4D2;
  opacity: 0.7;
  padding: 8px 4px;
  font-size: 0.8em;
}

.calendar-date {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  font-size: 0.9em;
  color: #EFE4D2;
  transition: all 0.2s ease;
}

.calendar-date:hover {
  background: rgba(239, 228, 210, 0.1);
}

.calendar-date.today {
  background: rgba(239, 228, 210, 0.2);
  font-weight: bold;
}

.calendar-date.other-month {
  opacity: 0.3;
}

.calendar-date.has-tasks {
  background: rgba(58, 107, 140, 0.3);
}

.task-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #EFE4D2;
  color: #254D70;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* Weather Widget */
.weather-info {
  text-align: center;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.temperature {
  text-align: left;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weather-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #EFE4D2;
  opacity: 0.8;
  font-size: 0.9em;
}

/* Finance Widget */
.finance-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.finance-item {
  text-align: center;
  padding: 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.finance-label {
  color: #EFE4D2;
  opacity: 0.7;
  font-size: 0.8em;
  margin-bottom: 4px;
}

.finance-value {
  font-weight: bold;
  font-size: 1.1em;
}

/* Notes Widget */
.notes-actions {
  display: flex;
  justify-content: flex-end;
}

/* Add Widget Dialog */
.widget-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.widget-option {
  transition: all 0.2s ease;
}

.widget-option:hover {
  transform: translateY(-2px);
}

/* Layout Options */
.layout-options {
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .widgets-grid {
    grid-template-columns: 1fr !important;
    gap: 16px;
    padding: 16px;
  }
  
  .widget-item {
    min-height: auto !important;
  }
  
  .stats-grid,
  .finance-summary {
    grid-template-columns: 1fr;
  }
  
  .weather-main {
    flex-direction: column;
    gap: 12px;
  }
  
  .widget-options {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar styling */
.widgets-container::-webkit-scrollbar {
  width: 8px;
}

.widgets-container::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 8px;
}

.widgets-container::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 8px;
}

.widgets-container::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}
</style>