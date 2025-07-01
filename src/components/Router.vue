<template>
  <q-layout view="lHh LpR lFf">
    <!-- Header -->
    <q-header class="header-container">
      <div class="header-wrapper">
        <q-toolbar class="spasta-header">
          <q-btn
            flat
            dense
            round
            :icon="drawerOpen ? 'close' : 'menu'"
            @click="drawerOpen = !drawerOpen"
            class="q-mr-sm spasta-text menu-toggle-btn"
          >
            <q-tooltip>{{ drawerOpen ? 'Close menu' : 'Open menu' }}</q-tooltip>
          </q-btn>
          
          <q-toolbar-title class="text-h6 text-weight-medium spasta-text">
            <q-icon name="dashboard" class="q-mr-sm icon-md" />
            Spasta
            <span class="text-body1 q-ml-md route-text">{{ currentPageTitle }}</span>
          </q-toolbar-title>
          
          <q-btn
            v-if="$route.name === 'Dashboard'"
            flat
            round
            icon="add"
            @click="showTaskDrawer = true"
            class="q-mr-sm spasta-text"
            size="sm"
          >
            <q-tooltip>Add new task</q-tooltip>
          </q-btn>
          
          <q-btn
            v-if="$route.name === 'Dashboard'"
            flat
            round
            icon="category"
            @click="showCategoryDrawer = true"
            class="q-mr-sm spasta-text"
            size="sm"
          >
            <q-tooltip>Add new board</q-tooltip>
          </q-btn>
          
          <q-btn
            v-if="$route.name === 'Expenses'"
            flat
            round
            icon="add"
            @click="showExpenseDialog = true"
            class="q-mr-sm spasta-text"
            size="sm"
          >
            <q-tooltip>Add expense</q-tooltip>
          </q-btn>
          
          <q-btn
            v-if="$route.name === 'Goals'"
            flat
            round
            icon="flag"
            @click="showGoalDialog = true"
            class="q-mr-sm spasta-text"
            size="sm"
          >
            <q-tooltip>Add goal</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            round
            icon="refresh"
            @click="refreshData"
            class="q-mr-sm spasta-text"
            :loading="isLoading"
            size="sm"
          >
            <q-tooltip>Refresh</q-tooltip>
          </q-btn>

          <!-- User Menu -->
          <q-btn-dropdown
            flat
            round
            class="q-ml-sm spasta-text"
            size="sm"
          >
            <template v-slot:label>
              <q-avatar size="28px">
                <img 
                  v-if="authStore.user?.picture" 
                  :src="authStore.user.picture" 
                  :alt="authStore.user.name"
                  @error="handleUserPhotoError"
                />
                <div 
                  v-else 
                  class="bg-primary text-white text-weight-bold"
                  style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 10px;"
                >
                  {{ getUserInitials() }}
                </div>
              </q-avatar>
            </template>

            <q-list class="spasta-card">
              <q-item-label header class="spasta-text">{{ authStore.user?.name }}</q-item-label>
              <q-item-label header class="text-caption spasta-text">{{ authStore.user?.email }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup @click="logout" class="spasta-text">
                <q-item-section avatar>
                  <q-icon name="logout" class="icon-sm" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar>
      </div>
    </q-header>

    <!-- Navigation Drawer -->
    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      :width="280"
      bordered
      class="spasta-drawer"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 text-weight-medium spasta-text q-mb-md">
            <q-icon name="explore" class="q-mr-sm icon-md" />
            Navigation
          </div>
          
          <q-list>
            <q-item
              v-for="route in navigationRoutes"
              :key="route.name"
              clickable
              v-ripple
              :active="$route.name === route.name"
              @click="navigateTo(route.name)"
              class="rounded-borders q-mb-xs nav-item"
            >
              <q-item-section avatar>
                <q-icon :name="route.icon" class="icon-md" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="spasta-text">{{ route.title }}</q-item-label>
                <q-item-label caption class="spasta-text opacity-70">{{ route.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <q-page class="spasta-bg main-content">
        <!-- Loading State -->
        <div v-if="authStore.loading" class="flex flex-center" style="height: 100vh;">
          <q-spinner-dots size="50px" color="white" />
        </div>
        
        <!-- Full Screen Layout -->
        <div v-else class="full-screen-layout">
          <!-- Accordion Section for Non-Overview Pages -->
          <div v-if="$route.name !== 'Overview'" class="accordion-section">
            <q-expansion-item
              v-model="accordionExpanded"
              :icon="accordionExpanded ? 'expand_less' : 'expand_more'"
              :label="accordionExpanded ? 'Hide Info Panel' : 'Show Info Panel'"
              header-class="accordion-header spasta-text"
              class="accordion-container spasta-card"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon :name="accordionExpanded ? 'expand_less' : 'expand_more'" color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="spasta-text text-weight-medium">
                    {{ accordionExpanded ? 'Hide Info Panel' : 'Show Info Panel' }}
                  </q-item-label>
                  <q-item-label caption class="spasta-text opacity-70">
                    {{ getAccordionSubtitle() }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip 
                    size="sm" 
                    color="white" 
                    text-color="grey-8" 
                    :label="getQuickStatsChip()" 
                  />
                </q-item-section>
              </template>

              <div class="accordion-content">
                <div class="accordion-grid">
                  <!-- Greeting Section -->
                  <div class="greeting-section">
                    <SpastaGreetingCard />
                  </div>
                  
                  <!-- Quick Stats Section -->
                  <div class="quick-stats-section">
                    <q-card class="spasta-card quick-stats-card">
                      <q-card-section class="q-pa-lg">
                        <div class="text-h6 spasta-text q-mb-md">
                          <q-icon :name="getStatsIcon()" class="q-mr-sm icon-lg" />
                          {{ getStatsTitle() }}
                        </div>
                        
                        <div class="stats-content">
                          <!-- Dashboard Stats -->
                          <div v-if="$route.name === 'Dashboard'" class="stats-grid">
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-positive">{{ taskStore.taskStats.total }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Total Tasks</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-warning">{{ taskStore.taskStats.inProgress }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">In Progress</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-info">{{ taskStore.taskStats.done }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Completed</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-negative">{{ taskStore.taskStats.overdue }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Overdue</div>
                            </div>
                          </div>

                          <!-- Expenses Stats -->
                          <div v-else-if="$route.name === 'Expenses'" class="stats-grid">
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-positive">${{ financeStore.financeStats.totalIncome.toLocaleString() }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Total Income</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-negative">${{ financeStore.financeStats.totalExpenses.toLocaleString() }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Total Expenses</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-info">${{ financeStore.financeStats.monthlyExpenses.toLocaleString() }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">This Month</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-purple">{{ financeStore.financeStats.savingsRate.toFixed(1) }}%</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Savings Rate</div>
                            </div>
                          </div>

                          <!-- Goals Stats -->
                          <div v-else-if="$route.name === 'Goals'" class="stats-grid">
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-primary">{{ financeStore.activeGoals.length }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Active Goals</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-positive">{{ financeStore.financeStats.goalsProgress.toFixed(1) }}%</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Avg Progress</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-info">${{ getTotalGoalAmount().toLocaleString() }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Total Target</div>
                            </div>
                            <div class="stat-item">
                              <div class="stat-value text-h5 text-warning">${{ getTotalSavedAmount().toLocaleString() }}</div>
                              <div class="stat-label text-caption spasta-text opacity-70">Total Saved</div>
                            </div>
                          </div>

                          <!-- Other Pages Stats -->
                          <div v-else class="stats-simple">
                            <div class="simple-stat">
                              <q-icon :name="getPageIcon()" size="xl" color="primary" class="q-mb-sm" />
                              <div class="text-h6 spasta-text">{{ getPageDescription() }}</div>
                              <div class="text-body2 spasta-text opacity-70">{{ getPageSubtitle() }}</div>
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-expansion-item>
          </div>
          
          <!-- Overview Layout (Side by Side) -->
          <div v-else class="overview-layout">
            <div class="greeting-container">
              <SpastaGreetingCard />
            </div>
          </div>
          
          <!-- Main Content Area -->
          <div class="content-area">
            <router-view 
              @add-task="handleAddTask"
              @edit-task="handleEditTask"
              @delete-task="handleDeleteTask"
              @move-task="handleMoveTask"
              @toggle-subtask="handleToggleSubtask"
              @edit-category="handleEditCategory"
            />
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- Task Drawer -->
    <SpastaTaskDrawer
      v-model="showTaskDrawer"
      :task="editingTask"
      :initial-status="initialTaskStatus"
      :initial-category="selectedCategory"
      @task-created="handleTaskCreated"
      @task-updated="handleTaskUpdated"
    />

    <!-- Category Drawer -->
    <SpastaCategoryDrawer
      v-model="showCategoryDrawer"
      :category="editingCategory"
      @category-created="handleCategoryCreated"
      @category-updated="handleCategoryUpdated"
    />

    <!-- Auth Dialog -->
    <SpastaAuthDialog v-model="showAuthDialog" />

    <!-- Productivity Dialogs -->
    <SpastaProductivityDialogs />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useAuthStore } from '../stores/authStore'
import { useFinanceStore } from '../stores/financeStore'
import type { Task, Category } from '../types/task'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const financeStore = useFinanceStore()

const drawerOpen = ref(false)
const showTaskDrawer = ref(false)
const showCategoryDrawer = ref(false)
const showAuthDialog = ref(false)
const showExpenseDialog = ref(false)
const showGoalDialog = ref(false)
const editingTask = ref<Task | undefined>()
const editingCategory = ref<Category | undefined>()
const selectedCategory = ref<string | null>(null)
const initialTaskStatus = ref<string>('')
const accordionExpanded = ref(false)

const navigationRoutes = [
  {
    name: 'Overview',
    title: 'Overview',
    description: 'Customizable widgets dashboard',
    icon: 'widgets'
  },
  {
    name: 'Dashboard',
    title: 'Dashboard',
    description: 'Task management boards',
    icon: 'dashboard'
  },
  {
    name: 'Calendar',
    title: 'Calendar',
    description: 'Task calendar & scheduling',
    icon: 'event'
  },
  {
    name: 'Notes',
    title: 'Notes',
    description: 'Quick notes and ideas',
    icon: 'note'
  },
  {
    name: 'Expenses',
    title: 'Expenses',
    description: 'Expense tracking & budgets',
    icon: 'account_balance_wallet'
  },
  {
    name: 'Goals',
    title: 'Goals',
    description: 'Financial goals & savings',
    icon: 'flag'
  },
  {
    name: 'Trading',
    title: 'Trading',
    description: 'Trading dashboard',
    icon: 'trending_up'
  },
  {
    name: 'Backup',
    title: 'Backup',
    description: 'GitHub repository backups',
    icon: 'backup'
  },
  {
    name: 'Monitor',
    title: 'Monitor Projects',
    description: 'Project status & API monitoring',
    icon: 'monitor'
  }
]

const currentPageTitle = computed(() => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.title || 'Overview'
})

const isLoading = computed(() => {
  return taskStore.loading || categoryStore.loading || financeStore.loading
})

const getAccordionSubtitle = () => {
  return accordionExpanded.value ? 'Greeting & stats visible' : 'Greeting & stats hidden'
}

const getQuickStatsChip = () => {
  switch (route.name) {
    case 'Dashboard':
      return `${taskStore.taskStats.total} tasks`
    case 'Expenses':
      return `$${financeStore.financeStats.monthlyExpenses.toLocaleString()}`
    case 'Goals':
      return `${financeStore.activeGoals.length} goals`
    default:
      return 'Quick info'
  }
}

const getStatsIcon = () => {
  switch (route.name) {
    case 'Dashboard': return 'analytics'
    case 'Expenses': return 'account_balance_wallet'
    case 'Goals': return 'flag'
    case 'Notes': return 'note'
    case 'Calendar': return 'event'
    case 'Trading': return 'trending_up'
    case 'Backup': return 'backup'
    case 'Monitor': return 'monitor'
    default: return 'info'
  }
}

const getStatsTitle = () => {
  switch (route.name) {
    case 'Dashboard': return 'Task Statistics'
    case 'Expenses': return 'Financial Overview'
    case 'Goals': return 'Goals Progress'
    case 'Notes': return 'Notes Overview'
    case 'Calendar': return 'Calendar Overview'
    case 'Trading': return 'Trading Overview'
    case 'Backup': return 'Backup Overview'
    case 'Monitor': return 'Monitor Overview'
    default: return 'Quick Stats'
  }
}

const getPageIcon = () => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.icon || 'info'
}

const getPageDescription = () => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.title || 'Page'
}

const getPageSubtitle = () => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.description || 'Page description'
}

const getTotalGoalAmount = () => {
  return financeStore.goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
}

const getTotalSavedAmount = () => {
  return financeStore.goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
}

const getUserInitials = () => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const handleUserPhotoError = (event: Event) => {
  // Hide the broken image and show initials instead
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
  if ($q.screen.lt.md) {
    drawerOpen.value = false
  }
}

const refreshData = async () => {
  console.log('Refreshing data for route:', route.name)
  try {
    if (route.name === 'Dashboard' || route.name === 'Overview') {
      await Promise.all([
        categoryStore.loadCategories(),
        taskStore.loadTasks()
      ])
    } else if (route.name === 'Expenses' || route.name === 'Goals') {
      await financeStore.loadFinanceData()
    }
    
    $q.notify({
      type: 'info',
      message: 'Data refreshed',
      position: 'top-right',
      timeout: 1500
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    $q.notify({
      type: 'negative',
      message: 'Error refreshing data',
      position: 'top-right',
      timeout: 2000
    })
  }
}

const handleAddTask = (status: string, category?: string) => {
  editingTask.value = undefined
  initialTaskStatus.value = status
  selectedCategory.value = category || null
  showTaskDrawer.value = true
}

const handleEditTask = (task: Task) => {
  editingTask.value = task
  showTaskDrawer.value = true
}

const handleDeleteTask = async (taskId: string) => {
  const success = await taskStore.deleteTask(taskId)
  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Task deleted successfully',
      position: 'top-right',
      timeout: 2000
    })
  }
}

const handleMoveTask = async (taskId: string, newStatus: string) => {
  const result = await taskStore.updateTask(taskId, { status: newStatus })
  if (result) {
    $q.notify({
      type: 'positive',
      message: `Task moved to ${newStatus.replace('-', ' ')}`,
      position: 'top-right',
      timeout: 2000
    })
  }
}

const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
  await taskStore.toggleSubtask(taskId, subtaskId)
}

const handleEditCategory = (category: Category) => {
  editingCategory.value = category
  showCategoryDrawer.value = true
}

const handleTaskCreated = () => {
  $q.notify({
    type: 'positive',
    message: 'Task created successfully',
    position: 'top-right',
    timeout: 2000
  })
}

const handleTaskUpdated = () => {
  $q.notify({
    type: 'positive',
    message: 'Task updated successfully',
    position: 'top-right',
    timeout: 2000
  })
}

const handleCategoryCreated = (category: Category) => {
  console.log('Category created event received:', category)
  $q.notify({
    type: 'positive',
    message: `Board "${category.name}" created successfully`,
    position: 'top-right',
    timeout: 2000
  })
}

const handleCategoryUpdated = (category: Category) => {
  console.log('Category updated event received:', category)
  $q.notify({
    type: 'positive',
    message: `Board "${category.name}" updated successfully`,
    position: 'top-right',
    timeout: 2000
  })
}

const logout = async () => {
  try {
    await authStore.logout()
    showAuthDialog.value = true
    $q.notify({
      type: 'info',
      message: 'Logged out successfully',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Initialize data when user is authenticated
const initializeData = async () => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    try {
      console.log('Initializing data for authenticated user...')
      await Promise.all([
        categoryStore.loadCategories(),
        taskStore.loadTasks(),
        financeStore.loadFinanceData()
      ])
      console.log('Data initialization complete')
    } catch (error) {
      console.error('Error initializing data:', error)
    }
  }
}

// Watch for authentication state changes
watch(() => authStore.isAuthenticated, async (isAuth) => {
  console.log('Auth state changed:', isAuth)
  if (isAuth) {
    showAuthDialog.value = false
    await initializeData()
  } else if (!authStore.loading) {
    showAuthDialog.value = true
  }
})

// Reset accordion state when route changes
watch(() => route.name, () => {
  accordionExpanded.value = false
})

onMounted(async () => {
  console.log('Router component mounted')
  // Initialize Firebase auth listener
  authStore.initializeAuth()
  
  // Show auth dialog if not authenticated after loading
  if (!authStore.loading && !authStore.isAuthenticated) {
    showAuthDialog.value = true
  } else if (authStore.isAuthenticated) {
    // Initialize data if already authenticated
    await initializeData()
  }
})
</script>

<style scoped>
/* Header Styling - Minimal and Clean */
.header-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 4px 8px 0 8px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-wrapper {
  max-width: 100%;
  margin: 0;
  width: 100%;
}

.spasta-header {
  background: linear-gradient(135deg, rgba(58, 107, 140, 0.95) 0%, rgba(37, 77, 112, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(239, 228, 210, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(58, 107, 140, 0.3);
  transition: all 0.3s ease;
  min-height: 44px;
  padding: 0 12px;
}

.spasta-header:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 6px 20px rgba(58, 107, 140, 0.4);
}

/* Menu toggle button styling */
.menu-toggle-btn {
  transition: all 0.3s ease;
  border-radius: 10px !important;
  position: relative;
  overflow: hidden;
  min-width: 32px !important;
  min-height: 32px !important;
}

.menu-toggle-btn:hover {
  background: rgba(239, 228, 210, 0.2) !important;
}

.menu-toggle-btn:active {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.menu-toggle-btn .q-icon {
  transition: all 0.3s ease;
}

/* Route text styling */
.route-text {
  font-weight: 400;
  opacity: 0.9;
  color: #EFE4D2;
  font-size: 1rem;
}

/* Full Screen Layout */
.main-content {
  padding-top: 52px !important;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.full-screen-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 52px);
  padding: 4px;
  gap: 4px;
}

/* Accordion Section */
.accordion-section {
  flex-shrink: 0;
  z-index: 10;
}

.accordion-container {
  border-radius: 16px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  overflow: hidden;
}

.accordion-header {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1) !important;
  padding: 12px 16px !important;
  transition: all 0.3s ease !important;
}

.accordion-header:hover {
  background: rgba(58, 107, 140, 0.3) !important;
}

.accordion-content {
  background: rgba(58, 107, 140, 0.05);
  padding: 16px;
}

.accordion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

/* Overview Layout (Side by Side) */
.overview-layout {
  padding: 0 8px;
  margin-bottom: 8px;
}

.greeting-container {
  width: 100%;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: 0;
}

/* Quick Stats Card */
.quick-stats-card {
  height: 100%;
  min-height: 200px;
}

.stats-content {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(239, 228, 210, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(239, 228, 210, 0.15);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(239, 228, 210, 0.12);
  transform: translateY(-2px);
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-label {
  font-weight: 500;
  line-height: 1.3;
}

.stats-simple {
  text-align: center;
  padding: 32px;
}

.simple-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* Drawer Styling */
.spasta-drawer {
  background: linear-gradient(145deg, rgba(37, 77, 112, 0.95) 0%, rgba(37, 77, 112, 0.98) 100%);
  border-right: 2px solid rgba(239, 228, 210, 0.1);
  margin-top: 52px;
}

.nav-item {
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(58, 107, 140, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.nav-item.q-item--active {
  background: rgba(58, 107, 140, 0.5);
  border-left: 4px solid #EFE4D2;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
}

.nav-item .q-icon {
  margin-right: 12px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 3px 6px 0 6px;
  }
  
  .spasta-header {
    border-radius: 10px;
    padding: 0 8px;
    min-height: 40px;
  }
  
  .route-text {
    font-size: 0.875rem;
  }
  
  .main-content {
    padding-top: 46px !important;
  }
  
  .full-screen-layout {
    padding: 2px;
    gap: 2px;
    height: calc(100vh - 46px);
  }
  
  .accordion-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .overview-layout {
    padding: 0 4px;
    margin-bottom: 4px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .spasta-drawer {
    margin-top: 46px;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  .header-container {
    padding: 3px 8px 0 8px;
  }
  
  .main-content {
    padding-top: 50px !important;
  }
  
  .full-screen-layout {
    height: calc(100vh - 50px);
  }
  
  .spasta-drawer {
    margin-top: 50px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

/* Smooth transitions for all interactive elements */
.spasta-header .q-btn {
  transition: all 0.2s ease;
  min-width: 32px !important;
  min-height: 32px !important;
}

.spasta-header .q-btn:hover {
  background: rgba(239, 228, 210, 0.1);
}

/* Enhanced toolbar title styling */
.q-toolbar-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 1.2rem;
  font-weight: 500;
}

/* User avatar hover effect */
.q-btn-dropdown .q-avatar {
  transition: all 0.2s ease;
}

.q-btn-dropdown:hover .q-avatar {
  box-shadow: 0 4px 12px rgba(239, 228, 210, 0.3);
}

/* Scrollbar styling for content area */
.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 6px;
}

.content-area::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}

/* Accordion expansion animation */
.q-expansion-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-expansion-item__content {
  animation: expandContent 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>