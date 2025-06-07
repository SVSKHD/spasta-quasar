<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px; max-width: 600px" class="spasta-card">
      <q-card-section class="row items-center q-pb-none q-pa-lg">
        <div class="text-h6 spasta-text">{{ isEditing ? 'Edit Task' : 'Create New Task' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" class="spasta-text" />
      </q-card-section>

      <q-form @submit="submitForm" class="q-gutter-lg">
        <q-card-section class="q-pa-lg">
          <q-input
            v-model="form.title"
            label="Title *"
            outlined
            dense
            :rules="[val => !!val || 'Title is required']"
            autofocus
            class="spasta-input q-mb-lg"
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
            class="spasta-input q-mb-lg"
            color="white"
            label-color="white"
            dark
          />

          <div class="row q-gutter-lg q-mb-lg">
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

          <div class="row q-gutter-lg q-mb-lg">
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
            class="spasta-input"
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
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancel" @click="close" class="spasta-text q-mr-md" />
          <q-btn 
            type="submit" 
            color="white" 
            text-color="grey-8"
            :label="isEditing ? 'Update Task' : 'Create Task'"
            :loading="submitting"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import type { Task, TaskPriority } from '../types/task'

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

const dialogVisible = computed({
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
  tags: [] as string[]
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

const createTag = (val: string, done: (item?: any) => void) => {
  if (val.length > 0) {
    done(val)
  }
}

const resetForm = () => {
  form.value = { ...defaultForm }
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
      tags: [...props.task.tags]
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
    if (isEditing.value && props.task) {
      const updatedTask = taskStore.updateTask(props.task.id, form.value)
      if (updatedTask) {
        emit('task-updated', updatedTask)
      }
    } else {
      const newTask = taskStore.addTask(form.value)
      emit('task-created', newTask)
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
/* Enhanced form styling with better spacing */
.q-form {
  padding: 0;
}

.q-card-section {
  padding: 24px !important;
}

.q-card-actions {
  padding: 24px !important;
  border-top: 1px solid rgba(255, 227, 169, 0.1);
}

/* Better button spacing */
.q-btn {
  border-radius: 8px;
  padding: 8px 16px;
}
</style>