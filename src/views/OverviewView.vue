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
                :icon="editMode ? 'check' : 'edit'"
                :label="editMode ? 'Done' : 'Edit Layout'"
                @click="toggleEditMode"
                :color="editMode ? 'positive' : 'white'"
                :text-color="editMode ? 'white' : 'grey-8'"
                class="edit-btn"
              />
              <q-btn
                flat
                icon="add"
                label="Add Widget"
                @click="showWidgetSelector = true"
                class="spasta-text"
                :disable="!editMode"
              />
              <q-btn
                flat
                icon="refresh"
                label="Refresh"
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
      <div 
        class="widgets-grid" 
        :class="{ 'edit-mode': editMode }"
        ref="widgetsGrid"
      >
        <!-- Widget Items -->
        <div
          v-for="widget in widgets"
          :key="widget.id"
          class="widget-item"
          :class="{
            'widget-editing': editMode,
            [`widget-${widget.size}`]: true
          }"
          :style="getWidgetStyle(widget)"
          @mousedown="editMode && startDrag($event, widget)"
        >
          <q-card class="widget-card spasta-card full-height">
            <!-- Widget Header -->
            <div class="widget-header" v-if="widget.showHeader">
              <div class="widget-title">
                <q-icon :name="widget.icon" class="q-mr-sm" />
                <span class="text-subtitle1 spasta-text">{{ widget.title }}</span>
              </div>
              <div class="widget-actions" v-if="editMode">
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
              <!-- Task Statistics Widget -->
              <div v-if="widget.type === 'task-stats'" class="stats-widget">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-number text-primary">{{ taskStore.taskStats.total }}</div>
                    <div class="stat-label">Total Tasks</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number text-warning">{{ taskStore.taskStats.todo }}</div>
                    <div class="stat-label">To Do</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number text-info">{{ taskStore.taskStats.inProgress }}</div>
                    <div class="stat-label">In Progress</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number text-positive">{{ taskStore.taskStats.done }}</div>
                    <div class="stat-label">Completed</div>
                  </div>
                </div>
              </div>

              <!-- Recent Tasks Widget -->
              <div v-else-if="widget.type === 'recent-tasks'" class="tasks-widget">
                <q-list>
                  <q-item
                    v-for="task in getRecentTasks(widget.itemLimit || 5)"
                    :key="task.id"
                    clickable
                    @click="editTask(task)"
                    class="task-item"
                  >
                    <q-item-section avatar>
                      <q-icon 
                        :name="getTaskStatusIcon(task.status)" 
                        :color="getTaskStatusColor(task.status)" 
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
                <div v-if="getRecentTasks(widget.itemLimit || 5).length === 0" class="empty-state">
                  <q-icon name="assignment" size="lg" class="spasta-text opacity-30" />
                  <div class="text-body2 spasta-text opacity-70">No tasks yet</div>
                </div>
              </div>

              <!-- Finance Overview Widget -->
              <div v-else-if="widget.type === 'finance-overview'" class="finance-widget">
                <div class="finance-stats">
                  <div class="finance-item">
                    <div class="finance-label">Income</div>
                    <div class="finance-value text-positive">${{ financeStore.financeStats.totalIncome.toLocaleString() }}</div>
                  </div>
                  <div class="finance-item">
                    <div class="finance-label">Expenses</div>
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

              <!-- Mini Calendar Widget -->
              <div v-else-if="widget.type === 'mini-calendar'" class="calendar-widget">
                <div class="mini-calendar">
                  <div class="calendar-header">
                    <q-btn
                      flat
                      round
                      dense
                      icon="chevron_left"
                      @click="previousMonth"
                      class="spasta-text"
                    />
                    <div class="calendar-title">{{ currentMonthDisplay }}</div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="chevron_right"
                      @click="nextMonth"
                      class="spasta-text"
                    />
                  </div>
                  <div class="calendar-grid">
                    <div class="weekdays">
                      <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day" class="weekday">
                        {{ day }}
                      </div>
                    </div>
                    <div class="calendar-days">
                      <div
                        v-for="day in calendarDays"
                        :key="`${day.date}-${day.month}`"
                        class="calendar-day"
                        :class="{
                          'other-month': !day.isCurrentMonth,
                          'today': day.isToday,
                          'has-tasks': day.hasTasks
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
                <div v-if="weather" class="weather-info">
                  <div class="weather-main">
                    <q-icon :name="weather.icon" :color="weather.color" size="xl" />
                    <div class="weather-temp">{{ weather.temperature }}°{{ temperatureUnit }}</div>
                  </div>
                  <div class="weather-details">
                    <div class="weather-desc">{{ weather.description }}</div>
                    <div class="weather-location">{{ weather.location }}</div>
                  </div>
                </div>
                <div v-else class="weather-loading">
                  <q-skeleton type="rect" height="80px" />
                </div>
              </div>

              <!-- Quick Actions Widget -->
              <div v-else-if="widget.type === 'quick-actions'" class="actions-widget">
                <div class="actions-grid">
                  <q-btn
                    flat
                    icon="add_task"
                    label="New Task"
                    @click="createTask"
                    class="action-btn spasta-text"
                  />
                  <q-btn
                    flat
                    icon="receipt"
                    label="Add Expense"
                    @click="createExpense"
                    class="action-btn spasta-text"
                  />
                  <q-btn
                    flat
                    icon="flag"
                    label="New Goal"
                    @click="createGoal"
                    class="action-btn spasta-text"
                  />
                  <q-btn
                    flat
                    icon="note_add"
                    label="Quick Note"
                    @click="createNote"
                    class="action-btn spasta-text"
                  />
                </div>
              </div>

              <!-- Goals Progress Widget -->
              <div v-else-if="widget.type === 'goals-progress'" class="goals-widget">
                <div v-if="financeStore.activeGoals.length > 0">
                  <div
                    v-for="goal in financeStore.activeGoals.slice(0, widget.itemLimit || 3)"
                    :key="goal.id"
                    class="goal-item q-mb-md"
                  >
                    <div class="goal-header">
                      <div class="goal-title">{{ goal.title }}</div>
                      <div class="goal-amount">${{ goal.currentAmount.toLocaleString() }} / ${{ goal.targetAmount.toLocaleString() }}</div>
                    </div>
                    <q-linear-progress
                      :value="goal.currentAmount / goal.targetAmount"
                      color="positive"
                      track-color="grey-3"
                      size="8px"
                      rounded
                    />
                    <div class="goal-progress">{{ ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) }}% complete</div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <q-icon name="flag" size="lg" class="spasta-text opacity-30" />
                  <div class="text-body2 spasta-text opacity-70">No active goals</div>
                </div>
              </div>

              <!-- Recent Notes Widget -->
              <div v-else-if="widget.type === 'recent-notes'" class="notes-widget">
                <div class="notes-list">
                  <div
                    v-for="note in getRecentNotes(widget.itemLimit || 5)"
                    :key="note.id"
                    class="note-item"
                    @click="editNote(note)"
                  >
                    <div class="note-title">{{ note.title || 'Untitled Note' }}</div>
                    <div class="note-preview">{{ getPlainTextPreview(note.content) }}</div>
                    <div class="note-date">{{ formatDate(note.updatedAt) }}</div>
                  </div>
                </div>
                <div v-if="getRecentNotes(widget.itemLimit || 5).length === 0" class="empty-state">
                  <q-icon name="note" size="lg" class="spasta-text opacity-30" />
                  <div class="text-body2 spasta-text opacity-70">No notes yet</div>
                </div>
              </div>
            </div>

            <!-- Resize Handle -->
            <div
              v-if="editMode"
              class="resize-handle"
              @mousedown="startResize($event, widget)"
            >
              <q-icon name="drag_indicator" />
            </div>
          </q-card>
        </div>

        <!-- Grid Overlay -->
        <div v-if="editMode" class="grid-overlay"></div>
      </div>
    </div>

    <!-- Widget Selector Dialog -->
    <q-dialog v-model="showWidgetSelector">
      <q-card class="spasta-card" style="min-width: 600px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Widget</div>
          <div class="text-body2 spasta-text opacity-70">Choose a widget to add to your dashboard</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="widget-types-grid">
            <div
              v-for="widgetType in availableWidgetTypes"
              :key="widgetType.type"
              class="widget-type-card"
              @click="addWidget(widgetType)"
            >
              <q-card class="spasta-card-light cursor-pointer">
                <q-card-section class="text-center q-pa-lg">
                  <q-icon :name="widgetType.icon" size="xl" :color="widgetType.color" class="q-mb-md" />
                  <div class="text-h6 spasta-text q-mb-sm">{{ widgetType.title }}</div>
                  <div class="text-body2 spasta-text opacity-70">{{ widgetType.description }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showWidgetSelector = false" class="spasta-text" />
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
            v-if="['recent-tasks', 'recent-notes', 'goals-progress'].includes(configWidget.type)"
            v-model.number="configWidget.itemLimit"
            label="Number of Items"
            outlined
            dense
            type="number"
            min="1"
            max="10"
            class="spasta-input q-mb-md"
            color="white"
            label-color="white"
            dark
          />

          <q-select
            v-model="configWidget.size"
            label="Widget Size"
            outlined
            dense
            :options="[
              { label: 'Small', value: 'small' },
              { label: 'Medium', value: 'medium' },
              { label: 'Large', value: 'large' }
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
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showWidgetConfig = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="saveWidgetConfig"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useFinanceStore } from '../stores/financeStore'
import { useAuthStore } from '../stores/authStore'

interface Widget {
  id: string
  type: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  size: 'small' | 'medium' | 'large'
  showHeader: boolean
  itemLimit?: number
}

interface WidgetType {
  type: string
  title: string
  description: string
  icon: string
  color: string
  defaultSize: 'small' | 'medium' | 'large'
}

const router = useRouter()
const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const financeStore = useFinanceStore()
const authStore = useAuthStore()

const editMode = ref(false)
const showWidgetSelector = ref(false)
const showWidgetConfig = ref(false)
const configWidget = ref<Widget | null>(null)
const widgets = ref<Widget[]>([])
const widgetsGrid = ref<HTMLElement>()
const draggedWidget = ref<Widget | null>(null)
const resizingWidget = ref<Widget | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const calendarDate = ref(new Date())
const weather = ref<any>(null)
const temperatureUnit = ref<'C' | 'F'>('C')
const notes = ref<any[]>([])

const isLoading = computed(() => {
  return taskStore.loading || categoryStore.loading || financeStore.loading
})

const currentMonthDisplay = computed(() => {
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
  
  for (let i = 0; i < 42; i++) {
    const dayTasks = getTasksForDate(currentDateObj)
    
    days.push({
      date: currentDateObj.getDate(),
      month: currentDateObj.getMonth(),
      year: currentDateObj.getFullYear(),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: isToday(currentDateObj),
      hasTasks: dayTasks.length > 0
    })
    
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return days
})

const availableWidgetTypes: WidgetType[] = [
  {
    type: 'task-stats',
    title: 'Task Statistics',
    description: 'Overview of your task completion',
    icon: 'assignment',
    color: 'primary',
    defaultSize: 'medium'
  },
  {
    type: 'recent-tasks',
    title: 'Recent Tasks',
    description: 'Your latest tasks and updates',
    icon: 'list',
    color: 'info',
    defaultSize: 'large'
  },
  {
    type: 'finance-overview',
    title: 'Finance Overview',
    description: 'Income, expenses, and savings',
    icon: 'account_balance_wallet',
    color: 'positive',
    defaultSize: 'medium'
  },
  {
    type: 'mini-calendar',
    title: 'Mini Calendar',
    description: 'Quick calendar view',
    icon: 'event',
    color: 'warning',
    defaultSize: 'medium'
  },
  {
    type: 'weather',
    title: 'Weather',
    description: 'Current weather conditions',
    icon: 'wb_sunny',
    color: 'orange',
    defaultSize: 'small'
  },
  {
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'Fast access to common actions',
    icon: 'flash_on',
    color: 'purple',
    defaultSize: 'medium'
  },
  {
    type: 'goals-progress',
    title: 'Goals Progress',
    description: 'Track your financial goals',
    icon: 'flag',
    color: 'teal',
    defaultSize: 'large'
  },
  {
    type: 'recent-notes',
    title: 'Recent Notes',
    description: 'Your latest notes and ideas',
    icon: 'note',
    color: 'indigo',
    defaultSize: 'large'
  }
]

const getWidgetStyle = (widget: Widget) => {
  return {
    gridColumn: `${widget.x + 1} / span ${widget.width}`,
    gridRow: `${widget.y + 1} / span ${widget.height}`
  }
}

const getRecentTasks = (limit: number) => {
  return taskStore.tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

const getRecentNotes = (limit: number) => {
  return notes.value
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

const getTasksForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return taskStore.tasks.filter(task => {
    const taskDate = task.dueDate || task.startDate
    return taskDate && taskDate.startsWith(dateStr)
  })
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getTaskStatusIcon = (status: string) => {
  switch (status) {
    case 'todo': return 'radio_button_unchecked'
    case 'in-progress': return 'hourglass_empty'
    case 'done': return 'check_circle'
    default: return 'help'
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'positive'
    default: return 'grey'
  }
}

const getPlainTextPreview = (htmlContent: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlContent
  const text = div.textContent || div.innerText || ''
  return text.substring(0, 50) + (text.length > 50 ? '...' : '')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  })
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (!editMode.value) {
    saveLayout()
  }
}

const addWidget = (widgetType: WidgetType) => {
  const newWidget: Widget = {
    id: Date.now().toString(),
    type: widgetType.type,
    title: widgetType.title,
    icon: widgetType.icon,
    x: 0,
    y: 0,
    width: getSizeWidth(widgetType.defaultSize),
    height: getSizeHeight(widgetType.defaultSize),
    size: widgetType.defaultSize,
    showHeader: true,
    itemLimit: ['recent-tasks', 'recent-notes', 'goals-progress'].includes(widgetType.type) ? 5 : undefined
  }
  
  // Find empty position
  const position = findEmptyPosition(newWidget.width, newWidget.height)
  newWidget.x = position.x
  newWidget.y = position.y
  
  widgets.value.push(newWidget)
  showWidgetSelector.value = false
  saveLayout()
}

const getSizeWidth = (size: string) => {
  switch (size) {
    case 'small': return 2
    case 'medium': return 3
    case 'large': return 4
    default: return 3
  }
}

const getSizeHeight = (size: string) => {
  switch (size) {
    case 'small': return 2
    case 'medium': return 3
    case 'large': return 4
    default: return 3
  }
}

const findEmptyPosition = (width: number, height: number) => {
  const gridCols = 6
  const gridRows = 10
  
  for (let y = 0; y <= gridRows - height; y++) {
    for (let x = 0; x <= gridCols - width; x++) {
      if (isPositionEmpty(x, y, width, height)) {
        return { x, y }
      }
    }
  }
  
  return { x: 0, y: 0 }
}

const isPositionEmpty = (x: number, y: number, width: number, height: number) => {
  return !widgets.value.some(widget => {
    return !(
      x >= widget.x + widget.width ||
      x + width <= widget.x ||
      y >= widget.y + widget.height ||
      y + height <= widget.y
    )
  })
}

const removeWidget = (widgetId: string) => {
  const index = widgets.value.findIndex(w => w.id === widgetId)
  if (index !== -1) {
    widgets.value.splice(index, 1)
    saveLayout()
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
      // Update size if changed
      if (configWidget.value.size !== widgets.value[index].size) {
        configWidget.value.width = getSizeWidth(configWidget.value.size)
        configWidget.value.height = getSizeHeight(configWidget.value.size)
      }
      
      widgets.value[index] = { ...configWidget.value }
      saveLayout()
    }
  }
  showWidgetConfig.value = false
  configWidget.value = null
}

const startDrag = (event: MouseEvent, widget: Widget) => {
  draggedWidget.value = widget
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
}

const handleDrag = (event: MouseEvent) => {
  if (!draggedWidget.value || !widgetsGrid.value) return
  
  const gridRect = widgetsGrid.value.getBoundingClientRect()
  const cellWidth = gridRect.width / 6
  const cellHeight = 120
  
  const x = Math.floor((event.clientX - gridRect.left - dragOffset.value.x) / cellWidth)
  const y = Math.floor((event.clientY - gridRect.top - dragOffset.value.y) / cellHeight)
  
  const clampedX = Math.max(0, Math.min(x, 6 - draggedWidget.value.width))
  const clampedY = Math.max(0, y)
  
  draggedWidget.value.x = clampedX
  draggedWidget.value.y = clampedY
}

const endDrag = () => {
  draggedWidget.value = null
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  saveLayout()
}

const startResize = (event: MouseEvent, widget: Widget) => {
  event.stopPropagation()
  resizingWidget.value = widget
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', endResize)
}

const handleResize = (event: MouseEvent) => {
  if (!resizingWidget.value || !widgetsGrid.value) return
  
  const gridRect = widgetsGrid.value.getBoundingClientRect()
  const cellWidth = gridRect.width / 6
  const cellHeight = 120
  
  const width = Math.max(1, Math.floor((event.clientX - gridRect.left - resizingWidget.value.x * cellWidth) / cellWidth))
  const height = Math.max(1, Math.floor((event.clientY - gridRect.top - resizingWidget.value.y * cellHeight) / cellHeight))
  
  const maxWidth = 6 - resizingWidget.value.x
  const clampedWidth = Math.min(width, maxWidth)
  const clampedHeight = Math.max(1, height)
  
  resizingWidget.value.width = clampedWidth
  resizingWidget.value.height = clampedHeight
}

const endResize = () => {
  resizingWidget.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
  saveLayout()
}

const saveLayout = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_overview_layout', JSON.stringify(widgets.value))
  }
  // For authenticated users, save to Firestore (implement later)
}

const loadLayout = () => {
  if (authStore.user?.id === 'guest') {
    const saved = localStorage.getItem('spasta_overview_layout')
    if (saved) {
      widgets.value = JSON.parse(saved)
    } else {
      // Default layout
      widgets.value = [
        {
          id: '1',
          type: 'task-stats',
          title: 'Task Statistics',
          icon: 'assignment',
          x: 0,
          y: 0,
          width: 3,
          height: 2,
          size: 'medium',
          showHeader: true
        },
        {
          id: '2',
          type: 'recent-tasks',
          title: 'Recent Tasks',
          icon: 'list',
          x: 3,
          y: 0,
          width: 3,
          height: 4,
          size: 'large',
          showHeader: true,
          itemLimit: 5
        },
        {
          id: '3',
          type: 'finance-overview',
          title: 'Finance Overview',
          icon: 'account_balance_wallet',
          x: 0,
          y: 2,
          width: 3,
          height: 2,
          size: 'medium',
          showHeader: true
        },
        {
          id: '4',
          type: 'quick-actions',
          title: 'Quick Actions',
          icon: 'flash_on',
          x: 0,
          y: 4,
          width: 2,
          height: 2,
          size: 'small',
          showHeader: true
        },
        {
          id: '5',
          type: 'weather',
          title: 'Weather',
          icon: 'wb_sunny',
          x: 2,
          y: 4,
          width: 2,
          height: 2,
          size: 'small',
          showHeader: true
        }
      ]
      saveLayout()
    }
  }
}

const loadNotes = () => {
  if (authStore.user?.id === 'guest') {
    const stored = localStorage.getItem('spasta_notes')
    if (stored) {
      notes.value = JSON.parse(stored)
    }
  }
}

const generateMockWeather = () => {
  const conditions = ['Clear sky', 'Partly cloudy', 'Cloudy', 'Sunny']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]
  const temp = Math.floor(Math.random() * 20) + 15 // 15-35°C
  
  weather.value = {
    temperature: temp,
    description: condition,
    icon: condition.includes('Clear') || condition.includes('Sunny') ? 'wb_sunny' : 'cloud',
    color: condition.includes('Clear') || condition.includes('Sunny') ? 'warning' : 'grey',
    location: 'Your Location'
  }
}

const previousMonth = () => {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() + 1, 1)
}

const refreshData = async () => {
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
}

const createTask = () => {
  router.push('/dashboard')
  // Emit event to open task drawer
}

const createExpense = () => {
  router.push('/expenses')
}

const createGoal = () => {
  router.push('/goals')
}

const createNote = () => {
  router.push('/notes')
}

const editTask = (task: any) => {
  router.push('/dashboard')
  // Emit event to edit specific task
}

const editNote = (note: any) => {
  router.push('/notes')
  // Emit event to edit specific note
}

onMounted(async () => {
  await Promise.all([
    taskStore.loadTasks(),
    categoryStore.loadCategories(),
    financeStore.loadFinanceData()
  ])
  
  loadLayout()
  loadNotes()
  generateMockWeather()
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

.edit-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.widgets-container {
  height: calc(100vh - 250px);
  overflow-y: auto;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 120px;
  gap: 16px;
  position: relative;
  min-height: 100%;
}

.widgets-grid.edit-mode {
  background-image: 
    linear-gradient(rgba(239, 228, 210, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(239, 228, 210, 0.1) 1px, transparent 1px);
  background-size: calc(100% / 6) 120px;
}

.widget-item {
  position: relative;
  transition: all 0.3s ease;
}

.widget-item.widget-editing {
  cursor: move;
  z-index: 10;
}

.widget-item.widget-editing:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(114, 92, 173, 0.4);
}

.widget-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(239, 228, 210, 0.2);
  transition: all 0.3s ease;
}

.widget-card:hover {
  border-color: rgba(239, 228, 210, 0.4);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  background: rgba(58, 107, 140, 0.1);
}

.widget-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.widget-actions {
  display: flex;
  gap: 4px;
}

.widget-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  cursor: nw-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 228, 210, 0.2);
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.resize-handle:hover {
  opacity: 1;
  background: rgba(239, 228, 210, 0.3);
}

/* Widget Specific Styles */
.stats-widget .stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 4px;
}

.tasks-widget .task-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.tasks-widget .task-item:hover {
  background: rgba(58, 107, 140, 0.1);
}

.finance-widget .finance-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

.finance-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.finance-label {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 4px;
}

.finance-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.calendar-widget .mini-calendar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.calendar-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.calendar-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  opacity: 0.7;
  padding: 2px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  flex: 1;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: rgba(239, 228, 210, 0.3);
  font-weight: bold;
}

.calendar-day.has-tasks {
  background: rgba(58, 107, 140, 0.3);
}

.weather-widget .weather-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.weather-temp {
  font-size: 1.5rem;
  font-weight: bold;
}

.weather-details {
  text-align: center;
}

.weather-desc {
  font-weight: 500;
  margin-bottom: 4px;
}

.weather-location {
  font-size: 0.8rem;
  opacity: 0.7;
}

.actions-widget .actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 100%;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.2);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(58, 107, 140, 0.2);
  border-color: rgba(239, 228, 210, 0.4);
}

.goals-widget .goal-item {
  padding: 12px;
  background: rgba(58, 107, 140, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.goal-title {
  font-weight: 500;
  font-size: 0.9rem;
}

.goal-amount {
  font-size: 0.8rem;
  opacity: 0.8;
}

.goal-progress {
  text-align: center;
  font-size: 0.8rem;
  margin-top: 4px;
  opacity: 0.8;
}

.notes-widget .notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
}

.note-item {
  padding: 8px;
  background: rgba(58, 107, 140, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  background: rgba(58, 107, 140, 0.2);
  border-color: rgba(239, 228, 210, 0.3);
}

.note-title {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.note-preview {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 4px;
}

.note-date {
  font-size: 0.7rem;
  opacity: 0.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.widget-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.widget-type-card {
  transition: all 0.2s ease;
}

.widget-type-card:hover {
  transform: translateY(-2px);
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
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
    grid-template-columns: 1fr;
    grid-auto-rows: 200px;
  }
  
  .widget-item {
    grid-column: 1 !important;
    grid-row: auto !important;
  }
  
  .widgets-grid.edit-mode {
    background-image: none;
  }
  
  .widget-types-grid {
    grid-template-columns: 1fr;
  }
}
</style>