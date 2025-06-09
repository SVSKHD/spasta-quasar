<template>
  <q-drawer
    v-model="drawerVisible"
    side="right"
    overlay
    :width="600"
    class="task-drawer spasta-card"
  >
    <q-scroll-area class="fit">
      <div class="q-pa-lg">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-h6 spasta-text">{{ isEditing ? 'Edit Task' : 'Create New Task' }}</div>
          <q-btn flat round dense icon="close" @click="close" class="spasta-text" />
        </div>

        <q-form @submit="submitForm" class="q-gutter-lg">
          <!-- Basic Information -->
          <div class="form-section">
            <div class="text-subtitle1 spasta-text q-mb-md">Basic Information</div>
            
            <q-input
              v-model="form.title"
              label="Title *"
              outlined
              dense
              :rules="[val => !!val || 'Title is required']"
              class="spasta-input q-mb-md"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="form.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="3"
              class="spasta-input q-mb-md"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="form.photoUrl"
              label="Photo URL (optional)"
              outlined
              dense
              placeholder="https://example.com/image.jpg"
              class="spasta-input q-mb-md"
              color="white"
              label-color="white"
              dark
            >
              <template v-slot:prepend>
                <q-icon name="image" />
              </template>
            </q-input>

            <!-- Photo Preview -->
            <div v-if="form.photoUrl" class="photo-preview q-mb-md">
              <div class="text-caption spasta-text q-mb-sm">Photo Preview:</div>
              <q-img
                :src="form.photoUrl"
                alt="Task photo preview"
                class="rounded-borders"
                style="height: 120px; max-width: 200px"
                fit="cover"
                @error="handlePhotoError"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                    <q-icon name="broken_image" size="md" />
                    <div class="q-ml-sm text-caption">Invalid URL</div>
                  </div>
                </template>
              </q-img>
            </div>
          </div>

          <!-- Task Details -->
          <div class="form-section">
            <div class="text-subtitle1 spasta-text q-mb-md">Task Details</div>
            
            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <q-select
                  v-model="form.category"
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
              <div class="col">
                <q-select
                  v-model="form.status"
                  label="Status"
                  outlined
                  dense
                  :options="statusOptions"
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

            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <q-select
                  v-model="form.priority"
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
                <q-input
                  v-model="form.dueDate"
                  label="Due Date"
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

            <!-- Assignee Section -->
            <div class="assignee-section q-mb-md">
              <div class="text-caption spasta-text q-mb-sm">Assigned To:</div>
              <div class="row q-gutter-md">
                <div class="col">
                  <q-input
                    v-model="form.assignedTo.name"
                    label="Assignee Name"
                    outlined
                    dense
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="form.assignedTo.email"
                    label="Email"
                    outlined
                    dense
                    type="email"
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
              </div>
              <q-input
                v-model="form.assignedTo.photoUrl"
                label="Profile Photo URL (optional)"
                outlined
                dense
                placeholder="https://example.com/avatar.jpg"
                class="spasta-input q-mt-sm"
                color="white"
                label-color="white"
                dark
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- Assignee Preview -->
              <div v-if="form.assignedTo.name" class="assignee-preview q-mt-sm">
                <div class="text-caption spasta-text q-mb-xs">Assignee Preview:</div>
                <div class="row items-center">
                  <q-avatar size="32px" class="q-mr-sm">
                    <img 
                      v-if="form.assignedTo.photoUrl" 
                      :src="form.assignedTo.photoUrl" 
                      :alt="form.assignedTo.name"
                      @error="handleAssigneePhotoError"
                    />
                    <div 
                      v-else 
                      class="bg-primary text-white text-weight-bold"
                      style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"
                    >
                      {{ getInitials(form.assignedTo.name) }}
                    </div>
                  </q-avatar>
                  <div>
                    <div class="text-body2 spasta-text">{{ form.assignedTo.name }}</div>
                    <div class="text-caption spasta-text opacity-70">{{ form.assignedTo.email }}</div>
                  </div>
                </div>
              </div>
            </div>

            <q-select
              v-model="form.tags"
              label="Tags"
              outlined
              dense
              multiple
              use-chips
              use-input
              hide-selected
              fill-input
              new-value-mode="add-unique"
              :options="tagOptions"
              @new-value="createTag"
              class="spasta-input q-mb-md"
              color="white"
              label-color="white"
              dark
            >
              <template v-slot:no-option>
                <q-item class="spasta-card">
                  <q-item-section class="spasta-text">
                    Type to add new tags
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Subtasks Section -->
          <div class="form-section">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 spasta-text">Subtasks</div>
              <q-btn
                flat
                icon="add"
                label="Add Subtask"
                size="sm"
                @click="addSubtask"
                class="spasta-text"
              />
            </div>

            <div v-if="form.subtasks.length === 0" class="text-center q-pa-lg">
              <q-icon name="checklist" size="lg" class="spasta-text opacity-30 q-mb-md" />
              <div class="text-body2 spasta-text opacity-70">No subtasks yet</div>
              <div class="text-caption spasta-text opacity-50">Add subtasks to break down this task</div>
            </div>

            <div v-else class="subtasks-list">
              <div
                v-for="(subtask, index) in form.subtasks"
                :key="subtask.id"
                class="subtask-item q-mb-sm"
              >
                <q-card flat bordered class="spasta-card-light">
                  <q-card-section class="q-py-sm q-px-md">
                    <div class="row items-center q-gutter-sm">
                      <q-checkbox
                        v-model="subtask.completed"
                        size="sm"
                        color="positive"
                      />
                      <q-input
                        v-model="subtask.title"
                        placeholder="Subtask title..."
                        outlined
                        dense
                        class="col spasta-input"
                        color="white"
                        label-color="white"
                        dark
                        :class="{ 'text-strike': subtask.completed }"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="sm"
                        @click="removeSubtask(index)"
                        class="text-negative"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions q-pt-lg">
            <div class="row q-gutter-md">
              <q-btn 
                flat 
                label="Cancel" 
                @click="close" 
                class="spasta-text col" 
                icon="close"
                size="lg"
              />
              <q-btn 
                type="submit" 
                color="white" 
                text-color="grey-8"
                :label="isEditing ? 'Update Task' : 'Create Task'"
                :loading="submitting"
                class="col"
                :icon="isEditing ? 'save' : 'add'"
                size="lg"
              />
            </div>
          </div>
        </q-form>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import type { Task, TaskPriority, Subtask, TaskAssignee } from '../types/task'

interface Props {
  modelValue: boolean
  task?: Task
  initialStatus?: string
  initialCategory?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'task-created', task: Task): void
  (e: 'task-updated', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const submitting = ref(false)

const isEditing = computed(() => !!props.task)

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const defaultForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium' as TaskPriority,
  category: '',
  dueDate: '',
  tags: [] as string[],
  subtasks: [] as Subtask[],
  photoUrl: '',
  assignedTo: {
    id: '',
    name: '',
    email: '',
    photoUrl: ''
  } as TaskAssignee
}

const form = ref({ ...defaultForm })

const categoryOptions = computed(() => {
  return categoryStore.categories.map(cat => ({
    label: cat.name,
    value: cat.name
  }))
})

const statusOptions = computed(() => {
  if (!form.value.category) {
    return [
      { label: 'To Do', value: 'todo' },
      { label: 'In Progress', value: 'in-progress' },
      { label: 'Done', value: 'done' }
    ]
  }
  
  const category = categoryStore.getCategoryByName(form.value.category)
  if (category) {
    return category.statuses.map(status => ({
      label: status.label,
      value: status.name
    }))
  }
  
  return []
})

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const tagOptions = computed(() => {
  return taskStore.allTags.filter(tag => !form.value.tags.includes(tag))
})

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const handlePhotoError = () => {
  console.warn('Invalid photo URL:', form.value.photoUrl)
}

const handleAssigneePhotoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const createTag = (val: string, done: (item?: any) => void) => {
  if (val.length > 0) {
    done(val)
  }
}

const addSubtask = () => {
  const newSubtask: Subtask = {
    id: Date.now().toString(),
    title: '',
    completed: false,
    createdAt: new Date().toISOString()
  }
  form.value.subtasks.push(newSubtask)
}

const removeSubtask = (index: number) => {
  form.value.subtasks.splice(index, 1)
}

const resetForm = () => {
  form.value = { 
    ...defaultForm, 
    subtasks: [],
    assignedTo: {
      id: '',
      name: '',
      email: '',
      photoUrl: ''
    }
  }
}

const loadTaskData = () => {
  if (props.task) {
    form.value = {
      title: props.task.title,
      description: props.task.description,
      status: props.task.status,
      priority: props.task.priority,
      category: props.task.category,
      dueDate: props.task.dueDate || '',
      tags: [...props.task.tags],
      subtasks: [...(props.task.subtasks || [])],
      photoUrl: props.task.photoUrl || '',
      assignedTo: props.task.assignedTo ? { ...props.task.assignedTo } : {
        id: '',
        name: '',
        email: '',
        photoUrl: ''
      }
    }
  } else {
    resetForm()
    // Pre-fill with initial values
    if (props.initialCategory) {
      form.value.category = props.initialCategory
    }
    if (props.initialStatus) {
      form.value.status = props.initialStatus
    }
  }
}

const submitForm = async () => {
  submitting.value = true
  
  try {
    // Clean up assignedTo if no name is provided
    const taskData = {
      ...form.value,
      assignedTo: form.value.assignedTo.name ? {
        ...form.value.assignedTo,
        id: form.value.assignedTo.id || Date.now().toString()
      } : undefined
    }

    if (isEditing.value && props.task) {
      const updatedTask = taskStore.updateTask(props.task.id, taskData)
      if (updatedTask) {
        emit('task-updated', updatedTask)
      }
    } else {
      const newTask = taskStore.addTask(taskData)
      if (newTask) {
        emit('task-created', newTask)
      }
    }
    
    close()
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    submitting.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadTaskData()
  }
})

watch(() => props.task, () => {
  if (props.modelValue) {
    loadTaskData()
  }
})
</script>

<style scoped>
.task-drawer {
  background: linear-gradient(145deg, rgba(11, 29, 81, 0.95) 0%, rgba(11, 29, 81, 0.98) 100%);
  border-left: 2px solid rgba(255, 227, 169, 0.2);
}

.form-section {
  background: rgba(255, 227, 169, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 227, 169, 0.1);
}

.form-actions {
  border-top: 1px solid rgba(255, 227, 169, 0.1);
}

.subtask-item {
  transition: all 0.2s ease;
}

.text-strike {
  text-decoration: line-through;
  opacity: 0.6;
}

.photo-preview {
  border-radius: 8px;
  overflow: hidden;
}

.assignee-section {
  background: rgba(255, 227, 169, 0.03);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 227, 169, 0.05);
}

.assignee-preview {
  background: rgba(255, 227, 169, 0.05);
  border-radius: 6px;
  padding: 8px;
}

.q-btn {
  border-radius: 8px;
}
</style>