<template>
  <div class="category-board-container">
    <!-- Category Boards Grid -->
    <div v-if="!selectedCategory" class="category-boards">
      <div class="row items-center justify-between q-mb-xl">
        <div class="text-h5 text-weight-medium spasta-text">
          <q-icon name="dashboard" class="q-mr-sm" />
          Project Boards
        </div>
        <q-btn
          flat
          icon="add"
          label="New Board"
          @click="$emit('edit-category', undefined)"
          class="spasta-text"
        />
      </div>
      
      <!-- Loading State -->
      <div v-if="categoryStore.loading" class="text-center q-pa-lg">
        <q-spinner-dots size="50px" color="white" />
        <div class="text-body2 spasta-text q-mt-md">Loading categories...</div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="categoryStore.categories.length === 0" class="text-center q-pa-xl">
        <q-icon name="category" size="xl" class="spasta-text opacity-30 q-mb-lg" />
        <div class="text-h6 spasta-text q-mb-md">No Project Boards Yet</div>
        <div class="text-body2 spasta-text opacity-70 q-mb-lg">
          Create your first project board to organize your tasks
        </div>
        <q-btn
          color="white"
          text-color="grey-8"
          icon="add"
          label="Create Your First Board"
          @click="$emit('edit-category', undefined)"
          class="q-px-lg"
        />
      </div>
      
      <!-- Categories Grid -->
      <div v-else class="boards-grid spacing-lg">
        <q-card
          v-for="category in categoryStore.categories"
          :key="category.id"
          class="category-card cursor-pointer spasta-card"
          @click="selectCategory(category)"
        >
          <q-card-section class="spasta-text q-pa-lg">
            <div class="row items-center justify-between q-mb-lg">
              <div class="row items-center">
                <q-icon :name="category.icon" size="md" class="q-mr-sm" color="white" />
                <div class="text-h6 text-weight-medium">{{ category.name }}</div>
              </div>
              <div class="row items-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  size="sm"
                  @click.stop="$emit('edit-category', category)"
                  class="spasta-text action-btn"
                >
                  <q-tooltip>Edit board</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  size="sm"
                  @click.stop="handleDeleteCategory(category)"
                  class="text-negative action-btn"
                >
                  <q-tooltip>Delete board</q-tooltip>
                </q-btn>
              </div>
            </div>
            
            <div class="text-body2 q-mb-lg opacity-90">
              {{ category.description }}
            </div>
            
            <div class="row items-center justify-between">
              <div class="text-caption">
                {{ getCategoryTaskCount(category.name) }} tasks
              </div>
              <div class="row spacing-sm">
                <q-chip
                  v-for="status in category.statuses.slice(0, 3)"
                  :key="status.id"
                  size="xs"
                  :label="status.label"
                  color="white"
                  text-color="grey-8"
                />
              </div>
            </div>
          </q-card-section>
          
          <q-card-actions class="q-pa-lg q-pt-none">
            <q-btn
              flat
              icon="arrow_forward"
              label="Open Board"
              color="white"
              class="full-width spasta-text"
            />
          </q-card-actions>
        </q-card>
        
        <!-- Add New Category Card -->
        <q-card 
          class="category-card add-category-card cursor-pointer spasta-card-light"
          @click="$emit('edit-category', undefined)"
        >
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="add" size="xl" color="primary" class="q-mb-lg" />
            <div class="text-h6 text-weight-medium text-primary q-mb-sm">
              Create New Board
            </div>
            <div class="text-body2 spasta-text">
              Add a new project board with custom workflow
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Category Flow View -->
    <div v-else class="category-flow">
      <!-- Category Header -->
      <div class="category-header q-mb-xl">
        <q-card flat class="spasta-card">
          <q-card-section class="q-pa-lg">
            <div class="row items-center spacing-md">
              <q-btn
                flat
                round
                icon="arrow_back"
                @click="clearCategorySelection"
                class="q-mr-md spasta-text action-btn"
              />
              <q-icon 
                :name="selectedCategoryData?.icon" 
                color="white" 
                size="md" 
                class="q-mr-sm" 
              />
              <div>
                <div class="text-h5 text-weight-medium spasta-text">{{ selectedCategoryData?.name }}</div>
                <div class="text-body2 spasta-text opacity-80">{{ selectedCategoryData?.description }}</div>
              </div>
              <q-space />
              <div class="row items-center q-gutter-sm">
                <q-btn
                  flat
                  icon="edit"
                  label="Edit Board"
                  @click="$emit('edit-category', selectedCategoryData || undefined)"
                  class="spasta-text action-btn"
                />
                <q-btn
                  flat
                  icon="delete"
                  label="Delete Board"
                  @click="handleDeleteCategory(selectedCategoryData!)"
                  class="text-negative action-btn"
                />
                <q-chip 
                  :label="`${categoryTasks.length} tasks`" 
                  color="white" 
                  text-color="grey-8" 
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Task Flow Columns -->
      <div class="task-flow">
        <div class="flow-container spacing-lg">
          <SpastaTaskColumn
            v-for="status in selectedCategoryData?.statuses || []"
            :key="status.id"
            :status="status.name"
            :status-config="status"
            :tasks="getTasksForStatus(status.name)"
            @add-task="handleAddTask"
            @edit-task="handleEditTask"
            @delete-task="handleDeleteTask"
            @move-task="handleMoveTask"
            @toggle-subtask="handleToggleSubtask"
            class="flow-column"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, Category } from '../types/task'

interface Emits {
  (e: 'add-task', status: string, category?: string): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', taskId: string): void
  (e: 'move-task', taskId: string, newStatus: string): void
  (e: 'toggle-subtask', taskId: string, subtaskId: string): void
  (e: 'edit-category', category?: Category): void
}

const emit = defineEmits<Emits>()

const $q = useQuasar()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const selectedCategory = ref<string | null>(null)

const selectedCategoryData = computed(() => {
  if (!selectedCategory.value) return null
  return categoryStore.getCategoryByName(selectedCategory.value)
})

const categoryTasks = computed(() => {
  if (!selectedCategory.value) return []
  return taskStore.tasks.filter(task => task.category === selectedCategory.value)
})

const getCategoryTaskCount = (categoryName: string) => {
  return taskStore.tasks.filter(task => task.category === categoryName).length
}

const getTasksForStatus = (status: string) => {
  return categoryTasks.value.filter(task => task.status === status)
}

const selectCategory = (category: Category) => {
  selectedCategory.value = category.name
}

const clearCategorySelection = () => {
  selectedCategory.value = null
}

const handleAddTask = (status: string) => {
  emit('add-task', status, selectedCategory.value || undefined)
}

const handleEditTask = (task: Task) => {
  emit('edit-task', task)
}

const handleDeleteTask = async (taskId: string) => {
  console.log('CategoryBoard: Deleting task:', taskId)
  const success = await taskStore.deleteTask(taskId)
  if (success) {
    console.log('CategoryBoard: Task deleted successfully')
  } else {
    console.error('CategoryBoard: Failed to delete task')
  }
}

const handleMoveTask = async (taskId: string, newStatus: string) => {
  console.log('CategoryBoard: Moving task:', taskId, 'to status:', newStatus)
  const result = await taskStore.updateTask(taskId, { status: newStatus })
  if (result) {
    console.log('CategoryBoard: Task moved successfully')
  } else {
    console.error('CategoryBoard: Failed to move task')
  }
}

const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
  console.log('CategoryBoard: Toggling subtask:', subtaskId, 'for task:', taskId)
  await taskStore.toggleSubtask(taskId, subtaskId)
}

const handleDeleteCategory = async (category: Category) => {
  const taskCount = getCategoryTaskCount(category.name)
  
  $q.dialog({
    title: 'Delete Board',
    message: `Are you sure you want to delete "${category.name}"? ${taskCount > 0 ? `This will also delete ${taskCount} task${taskCount > 1 ? 's' : ''} in this board.` : ''}`,
    persistent: true,
    class: 'spasta-card',
    ok: {
      label: 'Delete',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancel',
      color: 'white',
      flat: true
    }
  }).onOk(async () => {
    try {
      console.log('Deleting category and related tasks:', category.name)
      
      // First, delete all tasks in this category
      const tasksToDelete = taskStore.tasks.filter(task => task.category === category.name)
      console.log(`Found ${tasksToDelete.length} tasks to delete`)
      
      for (const task of tasksToDelete) {
        console.log('Deleting task:', task.id, task.title)
        await taskStore.deleteTask(task.id)
      }
      
      // Then delete the category
      console.log('Deleting category:', category.id)
      await categoryStore.deleteCategory(category.id)
      
      // Clear selection if we're currently viewing this category
      if (selectedCategory.value === category.name) {
        selectedCategory.value = null
      }
      
      $q.notify({
        type: 'positive',
        message: `Board "${category.name}" and ${tasksToDelete.length} related task${tasksToDelete.length !== 1 ? 's' : ''} deleted successfully`,
        position: 'top-right',
        timeout: 3000
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      $q.notify({
        type: 'negative',
        message: 'Error deleting board. Please try again.',
        position: 'top-right',
        timeout: 3000
      })
    }
  })
}

// Watch for auth changes and reload categories
watch(() => authStore.isAuthenticated, async (isAuth) => {
  console.log('CategoryBoard: Auth state changed:', isAuth)
  if (isAuth && authStore.user?.id) {
    console.log('CategoryBoard: Loading categories for authenticated user')
    await categoryStore.loadCategories()
  }
})

onMounted(async () => {
  console.log('CategoryBoard mounted')
  console.log('Auth state:', authStore.isAuthenticated)
  console.log('User:', authStore.user?.id)
  console.log('Categories count:', categoryStore.categories.length)
  console.log('Category store loading:', categoryStore.loading)
  
  // Force load categories if user is authenticated but no categories loaded
  if (authStore.isAuthenticated && authStore.user?.id && categoryStore.categories.length === 0 && !categoryStore.loading) {
    console.log('CategoryBoard: Force loading categories')
    await categoryStore.loadCategories()
  }
})
</script>

<style scoped>
.category-board-container {
  width: 100%;
  height: 100%;
}

.category-boards {
  padding: 32px;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
}

.category-card {
  border-radius: 20px;
  transition: all 0.3s ease;
  min-height: 220px;
  border: 2px solid rgba(239, 228, 210, 0.2);
}

.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(58, 107, 140, 0.4);
  border-color: #EFE4D2;
}

.add-category-card {
  border: 2px dashed #3A6B8C;
  background: rgba(58, 107, 140, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-category-card:hover {
  border-color: #EFE4D2;
  background: rgba(58, 107, 140, 0.3);
}

.category-flow {
  padding: 32px;
}

.task-flow {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 32px;
}

.flow-container {
  display: flex;
  gap: 24px;
  min-width: 100%;
  overflow-x: auto;
  padding: 0 16px;
}

.flow-column {
  flex: 0 0 380px;
  min-width: 380px;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

/* Action Button Styling */
.action-btn {
  min-width: 36px !important;
  min-height: 36px !important;
  padding: 6px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  background: rgba(239, 228, 210, 0.2) !important;
  transform: scale(1.05) !important;
}

.action-btn.text-negative:hover {
  background: rgba(244, 67, 54, 0.2) !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .category-boards {
    padding: 12px;
  }
  
  .category-flow {
    padding: 12px;
  }
  
  .boards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .flow-container {
    flex-direction: column;
    gap: 20px;
    padding: 0 8px;
  }
  
  .flow-column {
    flex: none;
    min-width: auto;
    width: 100%;
  }
  
  .action-btn {
    min-width: 32px !important;
    min-height: 32px !important;
    padding: 4px !important;
  }
}

/* Smooth scrollbar for task flow */
.task-flow::-webkit-scrollbar {
  height: 10px;
}

.task-flow::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 8px;
}

.task-flow::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.task-flow::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
  transform: scale(1.1);
}
</style>