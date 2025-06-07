<template>
  <q-card 
    class="task-card cursor-pointer spasta-card" 
    :class="cardClasses"
    @click="$emit('edit', task)"
  >
    <q-card-section class="q-pb-xs q-pa-lg">
      <div class="row items-start justify-between q-mb-md">
        <div class="col">
          <div class="text-h6 text-weight-medium q-mb-sm spasta-text">{{ task.title }}</div>
          <div class="text-body2 spasta-text opacity-80 line-clamp-2 q-mb-sm">{{ task.description }}</div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="more_vert"
          size="sm"
          @click.stop="showMenu = true"
          class="spasta-text q-ml-sm"
        >
          <q-menu v-model="showMenu" class="spasta-card">
            <q-list style="min-width: 120px">
              <q-item 
                clickable 
                v-close-popup
                @click="$emit('edit', task)"
                class="spasta-text"
              >
                <q-item-section avatar>
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item 
                clickable 
                v-close-popup
                @click="$emit('delete', task.id)"
                class="text-negative"
              >
                <q-item-section avatar>
                  <q-icon name="delete" />
                </q-item-section>
                <q-item-section>Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- Task Photo -->
      <div v-if="task.photoUrl" class="task-photo q-mb-md">
        <q-img
          :src="task.photoUrl"
          :alt="task.title"
          class="rounded-borders"
          style="height: 120px; max-width: 100%"
          fit="cover"
          @error="handleImageError"
        >
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
              <q-icon name="broken_image" size="md" />
            </div>
          </template>
        </q-img>
      </div>

      <!-- Subtasks Section -->
      <div v-if="task.subtasks && task.subtasks.length > 0" class="subtasks-section q-mb-md">
        <div class="text-caption spasta-text opacity-70 q-mb-sm">
          <q-icon name="checklist" size="xs" class="q-mr-xs" />
          Subtasks ({{ completedSubtasks }}/{{ task.subtasks.length }})
        </div>
        <q-linear-progress
          :value="subtaskProgress"
          color="positive"
          track-color="grey-3"
          size="4px"
          rounded
          class="q-mb-sm"
        />
        <div class="subtasks-list">
          <div
            v-for="subtask in task.subtasks.slice(0, 3)"
            :key="subtask.id"
            class="subtask-item row items-center q-mb-xs"
            @click.stop="toggleSubtask(subtask.id)"
          >
            <q-checkbox
              :model-value="subtask.completed"
              size="xs"
              color="positive"
              class="q-mr-sm"
            />
            <span 
              class="text-caption spasta-text"
              :class="{ 'text-strike opacity-60': subtask.completed }"
            >
              {{ subtask.title }}
            </span>
          </div>
          <div v-if="task.subtasks.length > 3" class="text-caption spasta-text opacity-50">
            +{{ task.subtasks.length - 3 }} more...
          </div>
        </div>
      </div>

      <div class="row items-center justify-between q-mb-md spacing-sm">
        <q-chip
          :color="priorityColor"
          text-color="white"
          size="sm"
          :label="task.priority"
          class="text-capitalize"
        />
        <q-chip
          outline
          :color="statusColor"
          size="sm"
          :label="statusLabel"
          class="text-capitalize"
        />
      </div>

      <div class="row items-center justify-between q-mb-md">
        <q-chip
          outline
          color="white"
          text-color="grey-8"
          size="sm"
          :label="task.category"
        />
        <div v-if="task.dueDate" class="text-caption spasta-text" :class="dueDateClass">
          <q-icon name="schedule" size="xs" class="q-mr-xs" />
          {{ formatDate(task.dueDate) }}
        </div>
      </div>

      <!-- Assigned User -->
      <div v-if="task.assignedTo" class="row items-center justify-between q-mb-md">
        <div class="row items-center">
          <q-avatar size="24px" class="q-mr-sm">
            <img 
              v-if="task.assignedTo.photoUrl" 
              :src="task.assignedTo.photoUrl" 
              :alt="task.assignedTo.name"
              @error="handleAssigneeImageError"
            />
            <div 
              v-else 
              class="bg-primary text-white text-weight-bold text-caption"
              style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"
            >
              {{ getInitials(task.assignedTo.name) }}
            </div>
          </q-avatar>
          <span class="text-caption spasta-text">{{ task.assignedTo.name }}</span>
        </div>
      </div>

      <div v-if="task.tags.length" class="q-mt-md">
        <q-chip
          v-for="tag in task.tags"
          :key="tag"
          size="xs"
          outline
          color="white"
          text-color="grey-8"
          :label="`#${tag}`"
          class="q-mr-xs q-mb-xs"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '../types/task'

interface Props {
  task: Task
}

interface Emits {
  (e: 'edit', task: Task): void
  (e: 'delete', taskId: string): void
  (e: 'toggle-subtask', taskId: string, subtaskId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showMenu = ref(false)

const completedSubtasks = computed(() => {
  return props.task.subtasks?.filter(subtask => subtask.completed).length || 0
})

const subtaskProgress = computed(() => {
  if (!props.task.subtasks || props.task.subtasks.length === 0) return 0
  return completedSubtasks.value / props.task.subtasks.length
})

const cardClasses = computed(() => {
  const classes = ['transition-all', 'hover:shadow-lg']
  
  if (props.task.priority === 'high') {
    classes.push('border-l-4', 'border-l-negative')
  } else if (props.task.priority === 'medium') {
    classes.push('border-l-4', 'border-l-warning')
  }
  
  return classes
})

const priorityColor = computed(() => {
  switch (props.task.priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'positive'
    default: return 'grey'
  }
})

const statusColor = computed(() => {
  switch (props.task.status) {
    case 'todo': return 'grey'
    case 'in-progress': return 'primary'
    case 'done': return 'positive'
    default: return 'grey'
  }
})

const statusLabel = computed(() => {
  switch (props.task.status) {
    case 'in-progress': return 'In Progress'
    default: return props.task.status
  }
})

const dueDateClass = computed(() => {
  if (!props.task.dueDate) return ''
  
  const dueDate = new Date(props.task.dueDate)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-negative'
  if (diffDays <= 2) return 'text-warning'
  return 'spasta-text'
})

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const handleImageError = () => {
  // Remove the photo URL if it fails to load
  // This could be handled by emitting an event to update the task
  console.warn('Failed to load task image:', props.task.photoUrl)
}

const handleAssigneeImageError = (event: Event) => {
  // Hide the broken image and show initials instead
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const toggleSubtask = (subtaskId: string) => {
  emit('toggle-subtask', props.task.id, subtaskId)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>

<style scoped>
.task-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  border: 1px solid rgba(255, 227, 169, 0.2);
  margin: 4px;
}

.task-card:hover {
  transform: translateY(-4px);
  border-color: #FFE3A9;
  box-shadow: 0 12px 32px rgba(114, 92, 173, 0.4);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced spacing for card content */
.q-card-section {
  padding: 20px !important;
}

/* Better chip spacing */
.q-chip {
  margin: 2px;
}

/* Task photo styling */
.task-photo {
  border-radius: 8px;
  overflow: hidden;
}

/* Subtasks styling */
.subtasks-section {
  background: rgba(255, 227, 169, 0.05);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 227, 169, 0.1);
}

.subtask-item {
  cursor: pointer;
  padding: 2px 0;
  transition: all 0.2s ease;
}

.subtask-item:hover {
  background: rgba(255, 227, 169, 0.1);
  border-radius: 4px;
  padding: 2px 4px;
}

.text-strike {
  text-decoration: line-through;
}
</style>