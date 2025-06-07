<template>
  <div class="task-column spasta-card-light">
    <div class="column-header q-pa-lg">
      <div class="row items-center justify-between">
        <div class="column-title">
          <q-icon 
            :name="statusConfig?.icon || columnIcon" 
            :color="statusConfig?.color || columnColor" 
            size="sm" 
            class="q-mr-sm" 
          />
          <span class="text-h6 text-weight-medium spasta-text">{{ statusConfig?.label || columnTitle }}</span>
          <q-chip 
            :label="tasks.length" 
            size="sm" 
            :color="statusConfig?.color || columnColor" 
            text-color="white"
            class="q-ml-sm"
          />
        </div>
        <q-btn
          flat
          round
          dense
          icon="add"
          :color="statusConfig?.color || columnColor"
          @click="$emit('add-task', status)"
          class="spasta-text"
        >
          <q-tooltip>Add new task</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="column-content q-px-lg q-pb-lg">
      <draggable
        v-model="localTasks"
        group="tasks"
        item-key="id"
        @change="handleDragChange"
        class="task-list"
        :class="{ 'drag-area-empty': tasks.length === 0 }"
        :animation="200"
        ghost-class="task-ghost"
        chosen-class="task-chosen"
        drag-class="task-drag"
      >
        <template #item="{ element: task }">
          <div class="task-item q-mb-lg">
            <SpastaTaskCard
              :task="task"
              @edit="$emit('edit-task', task)"
              @delete="$emit('delete-task', $event)"
              @toggle-subtask="$emit('toggle-subtask', $event, arguments[1])"
            />
          </div>
        </template>
        <template #footer>
          <div v-if="tasks.length === 0" class="empty-state text-center q-pa-xl">
            <q-icon 
              :name="statusConfig?.icon || columnIcon" 
              size="xl" 
              :color="statusConfig?.color || columnColor" 
              class="q-mb-md opacity-30" 
            />
            <div class="text-body2 spasta-text q-mb-sm">No {{ (statusConfig?.label || columnTitle).toLowerCase() }} tasks</div>
            <div class="text-caption spasta-text opacity-70">Drag tasks here or click + to add</div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Task, CategoryStatus } from '../types/task'

interface Props {
  status: string
  tasks: Task[]
  statusConfig?: CategoryStatus
}

interface Emits {
  (e: 'add-task', status: string): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', taskId: string): void
  (e: 'move-task', taskId: string, newStatus: string): void
  (e: 'toggle-subtask', taskId: string, subtaskId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localTasks = ref([...props.tasks])

watch(() => props.tasks, (newTasks) => {
  localTasks.value = [...newTasks]
}, { deep: true })

const columnConfig = computed(() => {
  if (props.statusConfig) {
    return {
      title: props.statusConfig.label,
      icon: props.statusConfig.icon,
      color: props.statusConfig.color
    }
  }
  
  // Fallback for default statuses
  switch (props.status) {
    case 'todo':
      return {
        title: 'To Do',
        icon: 'radio_button_unchecked',
        color: 'grey'
      }
    case 'in-progress':
      return {
        title: 'In Progress',
        icon: 'hourglass_empty',
        color: 'primary'
      }
    case 'done':
      return {
        title: 'Done',
        icon: 'check_circle',
        color: 'positive'
      }
    default:
      return {
        title: props.status.charAt(0).toUpperCase() + props.status.slice(1),
        icon: 'help',
        color: 'grey'
      }
  }
})

const columnTitle = computed(() => columnConfig.value.title)
const columnIcon = computed(() => columnConfig.value.icon)
const columnColor = computed(() => columnConfig.value.color)

const handleDragChange = (event: any) => {
  if (event.added) {
    const task = event.added.element
    emit('move-task', task.id, props.status)
  }
}
</script>

<style scoped>
.task-column {
  border-radius: 20px;
  min-height: 600px;
  width: 100%;
  max-width: 400px;
  border: 2px solid rgba(255, 227, 169, 0.2);
  margin: 0 12px;
}

.column-header {
  border-bottom: 1px solid rgba(255, 227, 169, 0.2);
  border-radius: 20px 20px 0 0;
}

.task-list {
  min-height: 120px;
  padding: 8px;
}

.drag-area-empty {
  min-height: 300px;
  border: 2px dashed rgba(255, 227, 169, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}

.empty-state {
  opacity: 0.6;
}

.task-item {
  transition: all 0.3s ease;
  padding: 4px;
}

/* Drag and drop styling */
.task-ghost {
  opacity: 0.5;
  background: rgba(255, 227, 169, 0.1);
  border: 2px dashed #FFE3A9;
  border-radius: 12px;
}

.task-chosen {
  transform: rotate(2deg);
  box-shadow: 0 8px 32px rgba(114, 92, 173, 0.4);
}

.task-drag {
  transform: rotate(5deg);
  opacity: 0.8;
  z-index: 1000;
}

/* Enhanced drag area feedback */
.task-list:hover {
  background: rgba(255, 227, 169, 0.05);
  border-radius: 12px;
}

.drag-area-empty:hover {
  border-color: rgba(255, 227, 169, 0.5);
  background: rgba(255, 227, 169, 0.05);
}

@media (max-width: 768px) {
  .task-column {
    max-width: none;
    min-height: 400px;
    margin: 0 8px 16px 8px;
  }
  
  .column-header {
    padding: 16px !important;
  }
  
  .column-content {
    padding: 16px !important;
  }
}
</style>