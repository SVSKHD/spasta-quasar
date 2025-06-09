<template>
  <div class="overview-view">
    <!-- Overview Header -->
    <div class="overview-header q-pa-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="overview-title">
              <div class="text-h5 spasta-text">
                <q-icon name="dashboard" class="q-mr-sm icon-lg" />
                Overview Dashboard
              </div>
              <div class="text-body2 spasta-text opacity-70">
                Customize your workspace with resizable widgets
              </div>
            </div>
            
            <div class="overview-controls row items-center spacing-md">
              <q-btn
                flat
                icon="widgets"
                label="Add Widget"
                @click="showWidgetSelector = true"
                class="spasta-text"
              />
              <q-btn
                flat
                icon="grid_view"
                :label="isEditMode ? 'Exit Edit' : 'Edit Layout'"
                @click="toggleEditMode"
                :color="isEditMode ? 'warning' : 'white'"
                :text-color="isEditMode ? 'white' : 'grey-8'"
              />
              <q-btn
                flat
                icon="refresh"
                label="Refresh"
                @click="refreshAllWidgets"
                class="spasta-text"
                :loading="refreshing"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Widgets Grid -->
    <div class="widgets-container q-pa-md q-pt-none">
      <div 
        ref="gridContainer"
        class="widgets-grid"
        :class="{ 'edit-mode': isEditMode }"
      >
        <!-- Widget Items -->
        <div
          v-for="widget in widgets"
          :key="widget.id"
          class="widget-item"
          :class="{ 'editing': isEditMode }"
          :style="getWidgetStyle(widget)"
          @mousedown="startResize($event, widget)"
        >
          <!-- Widget Header -->
          <div class="widget-header" v-if="isEditMode || widget.showHeader">
            <div class="widget-title">
              <q-icon :name="widget.icon" class="q-mr-xs" />
              {{ widget.title }}
            </div>
            <div class="widget-actions" v-if="isEditMode">
              <q-btn
                flat
                round
                dense
                icon="settings"
                size="sm"
                @click="configureWidget(widget)"
                class="spasta-text"
              />
              <q-btn
                flat
                round
                dense
                icon="close"
                size="sm"
                @click="removeWidget(widget.id)"
                class="text-negative"
              />
            </div>
          </div>

          <!-- Widget Content -->
          <div class="widget-content">
            <!-- Task Stats Widget -->
            <div v-if="widget.type === 'task-stats'" class="stats-widget">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value text-primary">{{ taskStore.taskStats.total }}</div>
                  <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value text-warning">{{ taskStore.taskStats.todo }}</div>
                  <div class="stat-label">To Do</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value text-info">{{ taskStore.taskStats.inProgress }}</div>
                  <div class="stat-label">In Progress</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value text-positive">{{ taskStore.taskStats.done }}</div>
                  <div class="stat-label">Done</div>
                </div>
              </div>
            </div>

            <!-- Recent Tasks Widget -->
            <div v-else-if="widget.type === 'recent-tasks'" class="recent-tasks-widget">
              <div class="task-list">
                <div
                  v-for="task in taskStore.tasks.slice(0, widget.itemLimit || 5)"
                  :key="task.id"
                  class="task-item"
                >
                  <div class="task-info">
                    <div class="task-title">{{ task.title }}</div>
                    <div class="task-meta">
                      <q-chip size="xs" :color="getTaskStatusColor(task.status)" text-color="white">
                        {{ task.status }}
                      </q-chip>
                      <span class="task-category">{{ task.category }}</span>
                    </div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    size="sm"
                    @click="editTask(task)"
                    class="spasta-text"
                  />
                </div>
                <div v-if="taskStore.tasks.length === 0" class="empty-state">
                  <q-icon name="assignment" size="lg" class="opacity-30" />
                  <div class="text-body2 opacity-70">No tasks yet</div>
                </div>
              </div>
            </div>

            <!-- Finance Stats Widget -->
            <div v-else-if="widget.type === 'finance-stats'" class="finance-widget">
              <div class="finance-grid">
                <div class="finance-item">
                  <div class="finance-value text-positive">${{ financeStore.financeStats.totalIncome.toLocaleString() }}</div>
                  <div class="finance-label">Income</div>
                </div>
                <div class="finance-item">
                  <div class="finance-value text-negative">${{ financeStore.financeStats.totalExpenses.toLocaleString() }}</div>
                  <div class="finance-label">Expenses</div>
                </div>
                <div class="finance-item">
                  <div class="finance-value" :class="financeStore.financeStats.netIncome >= 0 ? 'text-positive' : 'text-negative'">
                    ${{ financeStore.financeStats.netIncome.toLocaleString() }}
                  </div>
                  <div class="finance-label">Net</div>
                </div>
                <div class="finance-item">
                  <div class="finance-value text-info">{{ financeStore.financeStats.savingsRate.toFixed(1) }}%</div>
                  <div class="finance-label">Savings Rate</div>
                </div>
              </div>
            </div>

            <!-- Calendar Widget -->
            <div v-else-if="widget.type === 'calendar'" class="calendar-widget">
              <div class="mini-calendar">
                <div class="calendar-header">
                  <q-btn flat round dense icon="chevron_left" @click="previousMonth" size="sm" />
                  <div class="month-year">{{ currentMonthYear }}</div>
                  <q-btn flat round dense icon="chevron_right" @click="nextMonth" size="sm" />
                </div>
                <div class="calendar-grid">
                  <div class="weekdays">
                    <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day" class="weekday">
                      {{ day }}
                    </div>
                  </div>
                  <div class="days">
                    <div
                      v-for="day in calendarDays"
                      :key="day.date"
                      class="day"
                      :class="{
                        'other-month': !day.isCurrentMonth,
                        'today': day.isToday,
                        'has-events': day.hasEvents
                      }"
                    >
                      {{ day.date }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Weather Widget -->
            <div v-else-if="widget.type === 'weather'" class="weather-widget">
              <div class="weather-content">
                <div class="weather-main">
                  <q-icon name="wb_sunny" size="lg" color="warning" />
                  <div class="temperature">{{ mockWeather.temperature }}°C</div>
                </div>
                <div class="weather-details">
                  <div class="weather-description">{{ mockWeather.description }}</div>
                  <div class="weather-location">{{ mockWeather.location }}</div>
                </div>
              </div>
            </div>

            <!-- Quick Actions Widget -->
            <div v-else-if="widget.type === 'quick-actions'" class="quick-actions-widget">
              <div class="actions-grid">
                <q-btn
                  flat
                  icon="add_task"
                  label="New Task"
                  @click="$emit('add-task')"
                  class="action-btn spasta-text"
                />
                <q-btn
                  flat
                  icon="category"
                  label="New Board"
                  @click="$emit('add-category')"
                  class="action-btn spasta-text"
                />
                <q-btn
                  flat
                  icon="receipt"
                  label="Add Expense"
                  @click="$emit('add-expense')"
                  class="action-btn spasta-text"
                />
                <q-btn
                  flat
                  icon="flag"
                  label="New Goal"
                  @click="$emit('add-goal')"
                  class="action-btn spasta-text"
                />
              </div>
            </div>

            <!-- Goals Progress Widget -->
            <div v-else-if="widget.type === 'goals-progress'" class="goals-widget">
              <div class="goals-list">
                <div
                  v-for="goal in financeStore.activeGoals.slice(0, widget.itemLimit || 3)"
                  :key="goal.id"
                  class="goal-item"
                >
                  <div class="goal-info">
                    <div class="goal-title">{{ goal.title }}</div>
                    <div class="goal-progress">
                      <q-linear-progress
                        :value="goal.currentAmount / goal.targetAmount"
                        color="positive"
                        track-color="grey-3"
                        size="4px"
                        rounded
                      />
                      <div class="progress-text">
                        ${{ goal.currentAmount.toLocaleString() }} / ${{ goal.targetAmount.toLocaleString() }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="financeStore.activeGoals.length === 0" class="empty-state">
                  <q-icon name="flag" size="lg" class="opacity-30" />
                  <div class="text-body2 opacity-70">No active goals</div>
                </div>
              </div>
            </div>

            <!-- Notes Widget -->
            <div v-else-if="widget.type === 'notes'" class="notes-widget">
              <div class="notes-list">
                <div class="note-item" v-for="i in (widget.itemLimit || 3)" :key="i">
                  <div class="note-title">Sample Note {{ i }}</div>
                  <div class="note-preview">This is a preview of note content...</div>
                  <div class="note-date">{{ new Date().toLocaleDateString() }}</div>
                </div>
                <div class="empty-state" v-if="false">
                  <q-icon name="note" size="lg" class="opacity-30" />
                  <div class="text-body2 opacity-70">No notes yet</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resize Handle -->
          <div v-if="isEditMode" class="resize-handle">
            <q-icon name="drag_indicator" />
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Selector Dialog -->
    <q-dialog v-model="showWidgetSelector">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Widget</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="widget-types-grid">
            <div
              v-for="type in availableWidgetTypes"
              :key="type.id"
              class="widget-type-card"
              @click="addWidget(type)"
            >
              <q-icon :name="type.icon" size="lg" :color="type.color" class="q-mb-sm" />
              <div class="widget-type-title">{{ type.title }}</div>
              <div class="widget-type-description">{{ type.description }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showWidgetSelector = false" 
            class="spasta-text"
            icon="close"
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Widget Configuration Dialog -->
    <q-dialog v-model="showWidgetConfig">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Configure Widget</div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="configWidget">
          <q-input
            v-model="configWidget.title"
            label="Widget Title"
            outlined
            dense
            class="spasta-input q-mb-md"
            color="white"
            label-color="white"
            dark
          />

          <q-checkbox
            v-model="configWidget.showHeader"
            label="Show Header"
            color="white"
            class="spasta-text q-mb-md"
          />

          <q-input
            v-if="['recent-tasks', 'goals-progress', 'notes'].includes(configWidget.type)"
            v-model.number="configWidget.itemLimit"
            label="Items to Show"
            outlined
            dense
            type="number"
            min="1"
            max="10"
            class="spasta-input"
            color="white"
            label-color="white"
            dark
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showWidgetConfig = false" 
            class="spasta-text"
            icon="close"
            size="lg"
          />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="saveWidgetConfig"
            icon="save"
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useTaskStore } from '../stores/taskStore'
import { useFinanceStore } from '../stores/financeStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useAuthStore } from '../stores/authStore'
import type { Task } from '../types/task'

interface Widget {
  id: string
  type: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  showHeader: boolean
  itemLimit?: number
}

interface WidgetType {
  id: string
  title: string
  description: string
  icon: string
  color: string
  defaultWidth: number
  defaultHeight: number
}

interface Emits {
  (e: 'add-task'): void
  (e: 'add-category'): void
  (e: 'add-expense'): void
  (e: 'add-goal'): void
}

const emit = defineEmits<Emits>()

const $q = useQuasar()
const taskStore = useTaskStore()
const financeStore = useFinanceStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const isEditMode = ref(false)
const showWidgetSelector = ref(false)
const showWidgetConfig = ref(false)
const refreshing = ref(false)
const configWidget = ref<Widget | null>(null)
const gridContainer = ref<HTMLElement>()
const calendarDate = ref(new Date())

const widgets = ref<Widget[]>([
  {
    id: '1',
    type: 'task-stats',
    title: 'Task Statistics',
    icon: 'assignment',
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    showHeader: true
  },
  {
    id: '2',
    type: 'recent-tasks',
    title: 'Recent Tasks',
    icon: 'list',
    x: 2,
    y: 0,
    width: 2,
    height: 2,
    showHeader: true,
    itemLimit: 5
  },
  {
    id: '3',
    type: 'finance-stats',
    title: 'Finance Overview',
    icon: 'account_balance',
    x: 0,
    y: 1,
    width: 2,
    height: 1,
    showHeader: true
  },
  {
    id: '4',
    type: 'calendar',
    title: 'Calendar',
    icon: 'event',
    x: 4,
    y: 0,
    width: 1,
    height: 2,
    showHeader: true
  },
  {
    id: '5',
    type: 'quick-actions',
    title: 'Quick Actions',
    icon: 'flash_on',
    x: 0,
    y: 2,
    width: 2,
    height: 1,
    showHeader: true
  },
  {
    id: '6',
    type: 'goals-progress',
    title: 'Goals Progress',
    icon: 'flag',
    x: 2,
    y: 2,
    width: 2,
    height: 1,
    showHeader: true,
    itemLimit: 3
  }
])

const availableWidgetTypes: WidgetType[] = [
  {
    id: 'task-stats',
    title: 'Task Statistics',
    description: 'Overview of your task completion',
    icon: 'assignment',
    color: 'primary',
    defaultWidth: 2,
    defaultHeight: 1
  },
  {
    id: 'recent-tasks',
    title: 'Recent Tasks',
    description: 'Your latest tasks and updates',
    icon: 'list',
    color: 'info',
    defaultWidth: 2,
    defaultHeight: 2
  },
  {
    id: 'finance-stats',
    title: 'Finance Overview',
    description: 'Income, expenses, and savings',
    icon: 'account_balance',
    color: 'positive',
    defaultWidth: 2,
    defaultHeight: 1
  },
  {
    id: 'calendar',
    title: 'Mini Calendar',
    description: 'Quick calendar view',
    icon: 'event',
    color: 'warning',
    defaultWidth: 1,
    defaultHeight: 2
  },
  {
    id: 'weather',
    title: 'Weather',
    description: 'Current weather conditions',
    icon: 'wb_sunny',
    color: 'orange',
    defaultWidth: 1,
    defaultHeight: 1
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'Fast access to common actions',
    icon: 'flash_on',
    color: 'purple',
    defaultWidth: 2,
    defaultHeight: 1
  },
  {
    id: 'goals-progress',
    title: 'Goals Progress',
    description: 'Track your financial goals',
    icon: 'flag',
    color: 'teal',
    defaultWidth: 2,
    defaultHeight: 1
  },
  {
    id: 'notes',
    title: 'Recent Notes',
    description: 'Your latest notes and ideas',
    icon: 'note',
    color: 'indigo',
    defaultWidth: 2,
    defaultHeight: 2
  }
]

const mockWeather = {
  temperature: 22,
  description: 'Partly Cloudy',
  location: 'Your Location'
}

const currentMonthYear = computed(() => {
  return calendarDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const calendarDays = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const currentDateObj = new Date(startDate)
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    days.push({
      date: currentDateObj.getDate(),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: currentDateObj.toDateString() === today.toDateString(),
      hasEvents: Math.random() > 0.8 // Mock events
    })
    
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return days
})

const getWidgetStyle = (widget: Widget) => {
  const cellSize = 200
  const gap = 16
  
  return {
    left: `${widget.x * (cellSize + gap)}px`,
    top: `${widget.y * (cellSize + gap)}px`,
    width: `${widget.width * cellSize + (widget.width - 1) * gap}px`,
    height: `${widget.height * cellSize + (widget.height - 1) * gap}px`
  }
}

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case 'todo': return 'grey'
    case 'in-progress': return 'primary'
    case 'done': return 'positive'
    default: return 'grey'
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  
  if (isEditMode.value) {
    $q.notify({
      type: 'info',
      message: 'Edit mode enabled - drag to resize widgets',
      position: 'top-right',
      timeout: 3000
    })
  } else {
    saveLayout()
  }
}

const addWidget = (type: WidgetType) => {
  const newWidget: Widget = {
    id: Date.now().toString(),
    type: type.id,
    title: type.title,
    icon: type.icon,
    x: 0,
    y: Math.max(...widgets.value.map(w => w.y + w.height), 0),
    width: type.defaultWidth,
    height: type.defaultHeight,
    showHeader: true,
    itemLimit: ['recent-tasks', 'goals-progress', 'notes'].includes(type.id) ? 5 : undefined
  }
  
  widgets.value.push(newWidget)
  showWidgetSelector.value = false
  
  $q.notify({
    type: 'positive',
    message: `${type.title} widget added`,
    position: 'top-right',
    timeout: 2000
  })
}

const removeWidget = (widgetId: string) => {
  const index = widgets.value.findIndex(w => w.id === widgetId)
  if (index !== -1) {
    const widget = widgets.value[index]
    widgets.value.splice(index, 1)
    
    $q.notify({
      type: 'info',
      message: `${widget.title} widget removed`,
      position: 'top-right',
      timeout: 2000
    })
  }
}

const configureWidget = (widget: Widget) => {
  configWidget.value = { ...widget }
  showWidgetConfig.value = true
}

const saveWidgetConfig = () => {
  if (configWidget.value) {
    const index = widgets.value.findIndex(w => w.id === configWidget.value!.id)
    if (index !== -1) {
      widgets.value[index] = { ...configWidget.value }
    }
  }
  showWidgetConfig.value = false
  configWidget.value = null
  
  $q.notify({
    type: 'positive',
    message: 'Widget configuration saved',
    position: 'top-right',
    timeout: 2000
  })
}

const startResize = (event: MouseEvent, widget: Widget) => {
  if (!isEditMode.value) return
  
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = widget.width
  const startHeight = widget.height
  
  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    const cellSize = 200
    const gap = 16
    
    const newWidth = Math.max(1, Math.round(startWidth + deltaX / (cellSize + gap)))
    const newHeight = Math.max(1, Math.round(startHeight + deltaY / (cellSize + gap)))
    
    widget.width = newWidth
    widget.height = newHeight
  }
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const saveLayout = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_widget_layout', JSON.stringify(widgets.value))
  }
  // For authenticated users, save to Firestore
  
  $q.notify({
    type: 'positive',
    message: 'Layout saved',
    position: 'top-right',
    timeout: 2000
  })
}

const loadLayout = () => {
  if (authStore.user?.id === 'guest') {
    const saved = localStorage.getItem('spasta_widget_layout')
    if (saved) {
      widgets.value = JSON.parse(saved)
    }
  }
  // For authenticated users, load from Firestore
}

const refreshAllWidgets = async () => {
  refreshing.value = true
  
  try {
    await Promise.all([
      taskStore.loadTasks(),
      financeStore.loadFinanceData(),
      categoryStore.loadCategories()
    ])
    
    $q.notify({
      type: 'positive',
      message: 'All widgets refreshed',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error refreshing widgets:', error)
    $q.notify({
      type: 'negative',
      message: 'Error refreshing widgets',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    refreshing.value = false
  }
}

const editTask = (task: Task) => {
  // Emit event to parent or navigate to task edit
  console.log('Edit task:', task.id)
}

const previousMonth = () => {
  const newDate = new Date(calendarDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  calendarDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(calendarDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  calendarDate.value = newDate
}

onMounted(async () => {
  loadLayout()
  await refreshAllWidgets()
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
  gap: 16px;
}

.widgets-container {
  height: calc(100vh - 250px);
  overflow: auto;
}

.widgets-grid {
  position: relative;
  min-height: 100%;
  padding: 20px;
}

.widgets-grid.edit-mode {
  background-image: 
    linear-gradient(rgba(239, 228, 210, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(239, 228, 210, 0.1) 1px, transparent 1px);
  background-size: 216px 216px;
}

.widget-item {
  position: absolute;
  background: rgba(58, 107, 140, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 228, 210, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.widget-item:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 8px 32px rgba(58, 107, 140, 0.3);
}

.widget-item.editing {
  border-color: rgba(239, 228, 210, 0.6);
  cursor: move;
}

.widget-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(58, 107, 140, 0.1);
}

.widget-title {
  font-weight: 600;
  color: #EFE4D2;
  display: flex;
  align-items: center;
}

.widget-actions {
  display: flex;
  gap: 4px;
}

.widget-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.resize-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  cursor: nw-resize;
  color: rgba(239, 228, 210, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Widget Specific Styles */
.stats-widget .stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
}

.recent-tasks-widget .task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  transition: all 0.2s ease;
}

.task-item:hover {
  background: rgba(239, 228, 210, 0.1);
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-category {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
}

.finance-widget .finance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
}

.finance-item {
  text-align: center;
  padding: 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.finance-value {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.finance-label {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
}

.calendar-widget .mini-calendar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}

.month-year {
  font-weight: 600;
  color: #EFE4D2;
  font-size: 0.9rem;
}

.calendar-grid {
  flex: 1;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #EFE4D2;
  opacity: 0.7;
  padding: 4px 0;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #EFE4D2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day:hover {
  background: rgba(239, 228, 210, 0.1);
}

.day.other-month {
  opacity: 0.3;
}

.day.today {
  background: rgba(239, 228, 210, 0.2);
  font-weight: bold;
}

.day.has-events {
  background: rgba(58, 107, 140, 0.3);
}

.weather-widget .weather-content {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.temperature {
  font-size: 1.5rem;
  font-weight: bold;
  color: #EFE4D2;
}

.weather-details {
  flex: 1;
}

.weather-description {
  font-weight: 500;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.weather-location {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
}

.quick-actions-widget .actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  height: 100%;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: rgba(239, 228, 210, 0.05);
  border: 1px solid rgba(239, 228, 210, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(239, 228, 210, 0.1);
  transform: translateY(-2px);
}

.goals-widget .goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.goal-item {
  padding: 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.goal-title {
  font-weight: 500;
  color: #EFE4D2;
  margin-bottom: 8px;
}

.goal-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
}

.notes-widget .notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.note-item {
  padding: 8px 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.note-title {
  font-weight: 500;
  color: #EFE4D2;
  margin-bottom: 4px;
}

.note-preview {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
  margin-bottom: 4px;
}

.note-date {
  font-size: 0.7rem;
  color: #EFE4D2;
  opacity: 0.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #EFE4D2;
}

/* Widget Selector */
.widget-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.widget-type-card {
  padding: 20px;
  text-align: center;
  background: rgba(58, 107, 140, 0.1);
  border: 1px solid rgba(239, 228, 210, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.widget-type-card:hover {
  background: rgba(58, 107, 140, 0.2);
  border-color: rgba(239, 228, 210, 0.4);
  transform: translateY(-2px);
}

.widget-type-title {
  font-weight: 600;
  color: #EFE4D2;
  margin-bottom: 8px;
}

.widget-type-description {
  font-size: 0.8rem;
  color: #EFE4D2;
  opacity: 0.7;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .overview-view {
    height: calc(100vh - 200px);
  }
  
  .overview-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .widgets-grid {
    padding: 12px;
  }
  
  .widget-item {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    margin-bottom: 16px;
  }
  
  .stats-grid,
  .finance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .widget-types-grid {
    grid-template-columns: 1fr;
  }
}
</style>