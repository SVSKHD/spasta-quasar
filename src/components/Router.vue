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
            icon="menu"
            @click="drawerOpen = !drawerOpen"
            class="q-mr-sm spasta-text"
          />
          
          <q-toolbar-title class="text-h5 text-weight-medium spasta-text">
            <q-icon name="dashboard" class="q-mr-sm icon-md" />
            Spasta
            <span class="text-h6 q-ml-md route-text">{{ currentPageTitle }}</span>
          </q-toolbar-title>
          
          <q-btn
            v-if="$route.name === 'Dashboard'"
            flat
            round
            icon="add"
            @click="showTaskDrawer = true"
            class="q-mr-sm spasta-text"
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
          >
            <q-tooltip>Add new board</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            round
            icon="refresh"
            @click="refreshData"
            class="q-mr-sm spasta-text"
            :loading="isLoading"
          >
            <q-tooltip>Refresh</q-tooltip>
          </q-btn>

          <!-- User Menu -->
          <q-btn-dropdown
            flat
            round
            class="q-ml-sm spasta-text"
          >
            <template v-slot:label>
              <q-avatar size="32px">
                <img 
                  v-if="authStore.user?.picture" 
                  :src="authStore.user.picture" 
                  :alt="authStore.user.name"
                  @error="handleUserPhotoError"
                />
                <div 
                  v-else 
                  class="bg-primary text-white text-weight-bold"
                  style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"
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
      :overlay="$q.screen.lt.md"
      :persistent="$q.screen.gt.sm"
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
        
        <!-- Greeting Card - Show on all pages -->
        <div v-else class="greeting-container">
          <SpastaGreetingCard />
        </div>
        
        <!-- Router View -->
        <router-view 
          v-if="!authStore.loading"
          @add-task="handleAddTask"
          @edit-task="handleEditTask"
          @delete-task="handleDeleteTask"
          @move-task="handleMoveTask"
          @toggle-subtask="handleToggleSubtask"
          @edit-category="handleEditCategory"
        />
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
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, Category } from '../types/task'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const drawerOpen = ref(true)
const showTaskDrawer = ref(false)
const showCategoryDrawer = ref(false)
const showAuthDialog = ref(false)
const editingTask = ref<Task | undefined>()
const editingCategory = ref<Category | undefined>()
const selectedCategory = ref<string | null>(null)
const initialTaskStatus = ref<string>('')

const navigationRoutes = [
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
    name: 'Trading',
    title: 'Trading',
    description: 'Trading dashboard',
    icon: 'trending_up'
  }
]

const currentPageTitle = computed(() => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.title || 'Dashboard'
})

const isLoading = computed(() => {
  return taskStore.loading || categoryStore.loading
})

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
  if (route.name === 'Dashboard') {
    console.log('Refreshing dashboard data...')
    try {
      await Promise.all([
        categoryStore.loadCategories(),
        taskStore.loadTasks()
      ])
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

const handleTaskCreated = (task: Task) => {
  $q.notify({
    type: 'positive',
    message: 'Task created successfully',
    position: 'top-right',
    timeout: 2000
  })
}

const handleTaskUpdated = (task: Task) => {
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
        taskStore.loadTasks()
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
/* Header Styling */
.header-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 16px 24px 0 24px;
}

.header-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.spasta-header {
  background: linear-gradient(135deg, rgba(58, 107, 140, 0.95) 0%, rgba(37, 77, 112, 0.95) 100%);
  border-radius: 20px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(58, 107, 140, 0.3);
  transition: all 0.3s ease;
  min-height: 64px;
  padding: 0 24px;
}

.spasta-header:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 12px 40px rgba(58, 107, 140, 0.4);
}

/* Route text styling */
.route-text {
  font-weight: 500;
  opacity: 0.9;
  color: #EFE4D2;
}

/* Main Content Spacing */
.main-content {
  padding-top: 100px !important; /* Space for detached header */
}

.greeting-container {
  padding: 0 24px 24px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Drawer Styling */
.spasta-drawer {
  background: linear-gradient(145deg, rgba(37, 77, 112, 0.95) 0%, rgba(37, 77, 112, 0.98) 100%);
  border-right: 2px solid rgba(239, 228, 210, 0.1);
  margin-top: 100px; /* Space for detached header */
}

.nav-item {
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: rgba(58, 107, 140, 0.3);
  transform: translateX(4px);
}

.nav-item.q-item--active {
  background: rgba(58, 107, 140, 0.5);
  border-left: 4px solid #EFE4D2;
}

.nav-item .q-icon {
  margin-right: 12px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 12px 16px 0 16px;
  }
  
  .spasta-header {
    border-radius: 16px;
    padding: 0 16px;
    min-height: 56px;
  }
  
  .route-text {
    font-size: 1rem;
  }
  
  .main-content {
    padding-top: 80px !important;
  }
  
  .greeting-container {
    padding: 0 16px 16px 16px;
  }
  
  .spasta-drawer {
    margin-top: 80px;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  .header-container {
    padding: 14px 20px 0 20px;
  }
  
  .greeting-container {
    padding: 0 20px 20px 20px;
  }
  
  .main-content {
    padding-top: 90px !important;
  }
  
  .spasta-drawer {
    margin-top: 90px;
  }
}

/* Smooth transitions for all interactive elements */
.spasta-header .q-btn {
  transition: all 0.2s ease;
}

.spasta-header .q-btn:hover {
  background: rgba(239, 228, 210, 0.1);
  transform: translateY(-1px);
}

/* Enhanced toolbar title styling */
.q-toolbar-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* User avatar hover effect */
.q-btn-dropdown .q-avatar {
  transition: all 0.2s ease;
}

.q-btn-dropdown:hover .q-avatar {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(239, 228, 210, 0.3);
}
</style>