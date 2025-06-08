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
      
      <!-- Debug Info -->
      <div v-if="categoryStore.loading" class="text-center q-pa-lg">
        <q-spinner-dots size="50px" color="white" />
        <div class="text-body2 spasta-text q-mt-md">Loading categories...</div>
      </div>
      
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
              <q-btn
                flat
                round
                dense
                icon="edit"
                size="sm"
                @click.stop="$emit('edit-category', category)"
                class="spasta-text"
              />
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
                class="q-mr-md spasta-text"
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
              <q-btn
                flat
                icon="edit"
                label="Edit Board"
                @click="$emit('edit-category', selectedCategoryData)"
                class="spasta-text q-mr-sm"
              />
              <q-chip 
                :label="`${categoryTasks.length} tasks`" 
                color="white" 
                text-color="grey-8" 
              />
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
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
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

const taskStore = useTaskStore()
const categoryStore = useCategoryStore()

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

const handleDeleteTask = (taskId: string) => {
  emit('delete-task', taskId)
}

const handleMoveTask = (taskId: string, newStatus: string) => {
  emit('move-task', taskId, newStatus)
}

const handleToggleSubtask = (taskId: string, subtaskId: string) => {
  emit('toggle-subtask', taskId, subtaskId)
}

onMounted(() => {
  console.log('CategoryBoard mounted, categories:', categoryStore.categories.length)
  console.log('Category store loading:', categoryStore.loading)
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
  min-width: fit-content;
  padding: 0 16px;
}

.flow-column {
  flex: 0 0 380px;
  min-width: 380px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .category-boards {
    padding: 20px;
  }
  
  .category-flow {
    padding: 20px;
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
}

/* Smooth scrollbar for task flow */
.task-flow::-webkit-scrollbar {
  height: 10px;
}

.task-flow::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 6px;
}

.task-flow::-webkit-scrollbar-thumb {
  background: #3A6B8C;
  border-radius: 6px;
}

.task-flow::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}
</style>