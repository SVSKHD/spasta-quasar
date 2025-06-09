<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px; max-width: 800px" class="spasta-card">
      <q-card-section class="row items-center q-pb-none q-pa-lg">
        <div class="text-h6 spasta-text">Create New Board</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" class="spasta-text" />
      </q-card-section>

      <q-form @submit="submitForm" class="q-gutter-lg">
        <q-card-section class="q-pa-lg">
          <div class="row q-gutter-lg q-mb-lg">
            <div class="col">
              <q-input
                v-model="form.name"
                label="Board Name *"
                outlined
                dense
                :rules="[val => !!val || 'Board name is required']"
                autofocus
                class="spasta-input"
                color="white"
                label-color="white"
                dark
              />
            </div>
            <div class="col">
              <q-select
                v-model="form.icon"
                label="Icon"
                outlined
                dense
                :options="iconOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="spasta-input"
                color="white"
                label-color="white"
                dark
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="spasta-card">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.value" color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <q-input
            v-model="form.description"
            label="Description"
            outlined
            dense
            type="textarea"
            rows="2"
            class="spasta-input q-mb-lg"
            color="white"
            label-color="white"
            dark
          />

          <q-select
            v-model="form.color"
            label="Color Theme"
            outlined
            dense
            :options="colorOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            class="spasta-input q-mb-xl"
            color="white"
            label-color="white"
            dark
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="spasta-card">
                <q-item-section avatar>
                  <q-icon name="circle" :color="scope.opt.value" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="spasta-text">{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-separator class="q-my-xl" />

          <div class="text-h6 q-mb-md spasta-text">Workflow Statuses</div>
          <div class="text-body2 spasta-text opacity-80 q-mb-lg">
            Define the workflow stages for this board. You can customize the labels and add custom statuses.
          </div>

          <div class="status-list">
            <div
              v-for="(status, index) in form.statuses"
              :key="index"
              class="status-item q-mb-lg"
            >
              <q-card flat bordered class="spasta-card-light">
                <q-card-section class="q-py-md q-px-lg">
                  <div class="row q-gutter-lg items-center">
                    <div class="col-3">
                      <q-input
                        v-model="status.label"
                        label="Status Label"
                        outlined
                        dense
                        class="spasta-input"
                        color="white"
                        label-color="white"
                        dark
                      />
                    </div>
                    <div class="col-2">
                      <q-select
                        v-model="status.icon"
                        label="Icon"
                        outlined
                        dense
                        :options="statusIconOptions"
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
                    <div class="col-2">
                      <q-select
                        v-model="status.color"
                        label="Color"
                        outlined
                        dense
                        :options="statusColorOptions"
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
                    <div class="col-auto">
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        @click="removeStatus(index)"
                        :disable="form.statuses.length <= 2"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-btn
            flat
            icon="add"
            label="Add Custom Status"
            color="white"
            @click="addStatus"
            class="q-mt-lg spasta-text"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancel" @click="close" class="spasta-text q-mr-md" />
          <q-btn 
            type="submit" 
            color="white" 
            text-color="grey-8"
            label="Create Board"
            :loading="submitting"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategoryStore } from '../stores/categoryStore'
import type { Category, CategoryStatus } from '../types/task'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'category-created', category: Category): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const categoryStore = useCategoryStore()
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const defaultForm = {
  name: '',
  description: '',
  icon: 'work',
  color: 'primary',
  statuses: [
    { name: 'todo', label: 'To Do', color: 'grey', icon: 'radio_button_unchecked', order: 1 },
    { name: 'in-progress', label: 'In Progress', color: 'primary', icon: 'hourglass_empty', order: 2 },
    { name: 'done', label: 'Done', color: 'positive', icon: 'check_circle', order: 3 }
  ] as Omit<CategoryStatus, 'id'>[]
}

const form = ref({ ...defaultForm, statuses: [...defaultForm.statuses] })

const iconOptions = [
  { label: 'Work', value: 'work' },
  { label: 'Code', value: 'code' },
  { label: 'Design', value: 'palette' },
  { label: 'Marketing', value: 'campaign' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'Support', value: 'support' },
  { label: 'Finance', value: 'account_balance' },
  { label: 'HR', value: 'people' },
  { label: 'Operations', value: 'settings' },
  { label: 'Research', value: 'science' }
]

const colorOptions = [
  { label: 'Blue', value: 'primary' },
  { label: 'Teal', value: 'secondary' },
  { label: 'Purple', value: 'accent' },
  { label: 'Green', value: 'positive' },
  { label: 'Red', value: 'negative' },
  { label: 'Orange', value: 'warning' },
  { label: 'Cyan', value: 'info' },
  { label: 'Pink', value: 'pink' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Brown', value: 'brown' }
]

const statusIconOptions = [
  { label: 'Circle', value: 'radio_button_unchecked' },
  { label: 'Hourglass', value: 'hourglass_empty' },
  { label: 'Check', value: 'check_circle' },
  { label: 'Play', value: 'play_arrow' },
  { label: 'Pause', value: 'pause' },
  { label: 'Review', value: 'rate_review' },
  { label: 'Test', value: 'bug_report' },
  { label: 'Deploy', value: 'rocket_launch' },
  { label: 'Archive', value: 'archive' }
]

const statusColorOptions = [
  { label: 'Grey', value: 'grey' },
  { label: 'Blue', value: 'primary' },
  { label: 'Green', value: 'positive' },
  { label: 'Orange', value: 'warning' },
  { label: 'Red', value: 'negative' },
  { label: 'Purple', value: 'purple' },
  { label: 'Teal', value: 'teal' },
  { label: 'Pink', value: 'pink' }
]

const addStatus = () => {
  const newOrder = form.value.statuses.length + 1
  form.value.statuses.push({
    name: `custom-${newOrder}`,
    label: `Custom Status ${newOrder}`,
    color: 'info',
    icon: 'radio_button_unchecked',
    order: newOrder
  })
}

const removeStatus = (index: number) => {
  form.value.statuses.splice(index, 1)
  // Update order
  form.value.statuses.forEach((status, idx) => {
    status.order = idx + 1
  })
}

const resetForm = () => {
  form.value = { ...defaultForm, statuses: [...defaultForm.statuses] }
}

const submitForm = async () => {
  submitting.value = true
  
  try {
    const categoryData = {
      name: form.value.name,
      description: form.value.description,
      icon: form.value.icon,
      color: form.value.color,
      statuses: form.value.statuses.map((status, index) => ({
        id: `${Date.now()}-${index}`,
        ...status,
        order: index + 1
      }))
    }
    
    const newCategory = await categoryStore.addCategory(categoryData)
    if (newCategory) {
      emit('category-created', newCategory)
    }
    close()
  } catch (error) {
    console.error('Error creating category:', error)
  } finally {
    submitting.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}
</script>

<style scoped>
.status-item {
  transition: all 0.3s ease;
}

.status-list {
  max-height: 300px;
  overflow-y: auto;
}

/* Enhanced form styling */
.q-card-section {
  padding: 24px !important;
}

.q-card-actions {
  padding: 24px !important;
  border-top: 1px solid rgba(255, 227, 169, 0.1);
}

/* Better button and input spacing */
.q-btn {
  border-radius: 8px;
  padding: 8px 16px;
}
</style>