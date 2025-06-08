<template>
  <q-drawer
    v-model="drawerVisible"
    side="right"
    overlay
    :width="700"
    class="category-drawer spasta-card"
  >
    <q-scroll-area class="fit">
      <div class="q-pa-lg">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-h6 spasta-text">{{ isEditing ? 'Edit Board' : 'Create New Board' }}</div>
          <q-btn flat round dense icon="close" @click="close" class="spasta-text" />
        </div>

        <q-form @submit="submitForm" class="q-gutter-lg">
          <!-- Basic Information -->
          <div class="form-section">
            <div class="text-subtitle1 spasta-text q-mb-md">Basic Information</div>
            
            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <q-input
                  v-model="form.name"
                  label="Board Name *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Board name is required']"
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
              class="spasta-input q-mb-md"
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
              class="spasta-input"
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
          </div>

          <!-- Workflow Statuses -->
          <div class="form-section">
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-subtitle1 spasta-text">Workflow Statuses</div>
                <div class="text-body2 spasta-text opacity-70">
                  Define the workflow stages for this board
                </div>
              </div>
              <q-btn
                flat
                icon="add"
                label="Add Status"
                size="sm"
                @click="addStatus"
                class="spasta-text"
              />
            </div>

            <div v-if="form.statuses.length === 0" class="text-center q-pa-lg">
              <q-icon name="view_column" size="lg" class="spasta-text opacity-30 q-mb-md" />
              <div class="text-body2 spasta-text opacity-70">No workflow statuses</div>
              <div class="text-caption spasta-text opacity-50">Add statuses to define your workflow</div>
            </div>

            <div v-else class="status-list">
              <div
                v-for="(status, index) in form.statuses"
                :key="index"
                class="status-item q-mb-md"
              >
                <q-card flat bordered class="spasta-card-light">
                  <q-card-section class="q-py-md q-px-lg">
                    <div class="row q-gutter-md items-center">
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
          </div>

          <!-- Actions -->
          <div class="form-actions q-pt-lg">
            <div class="row q-gutter-md">
              <q-btn 
                flat 
                label="Cancel" 
                @click="close" 
                class="spasta-text col" 
              />
              <q-btn 
                type="submit" 
                color="white" 
                text-color="grey-8"
                :label="isEditing ? 'Update Board' : 'Create Board'"
                :loading="submitting"
                class="col"
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
import { useQuasar } from 'quasar'
import { useCategoryStore } from '../stores/categoryStore'
import type { Category, CategoryStatus } from '../types/task'

interface Props {
  modelValue: boolean
  category?: Category
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'category-created', category: Category): void
  (e: 'category-updated', category: Category): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()
const categoryStore = useCategoryStore()
const submitting = ref(false)

const isEditing = computed(() => !!props.category)

const drawerVisible = computed({
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

const loadCategoryData = () => {
  if (props.category) {
    form.value = {
      name: props.category.name,
      description: props.category.description,
      icon: props.category.icon,
      color: props.category.color,
      statuses: props.category.statuses.map(status => ({
        name: status.name,
        label: status.label,
        color: status.color,
        icon: status.icon,
        order: status.order
      }))
    }
  } else {
    resetForm()
  }
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
    
    console.log('Submitting category form:', categoryData)
    
    if (isEditing.value && props.category) {
      const updatedCategory = await categoryStore.updateCategory(props.category.id, categoryData)
      if (updatedCategory) {
        emit('category-updated', updatedCategory)
        $q.notify({
          type: 'positive',
          message: `Board "${updatedCategory.name}" updated successfully`,
          position: 'top-right',
          timeout: 2000
        })
      }
    } else {
      const newCategory = await categoryStore.addCategory(categoryData)
      if (newCategory) {
        emit('category-created', newCategory)
        $q.notify({
          type: 'positive',
          message: `Board "${newCategory.name}" created successfully`,
          position: 'top-right',
          timeout: 2000
        })
      }
    }
    
    close()
  } catch (error) {
    console.error('Error submitting form:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving board. Please try again.',
      position: 'top-right',
      timeout: 3000
    })
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
    loadCategoryData()
  }
})

watch(() => props.category, () => {
  if (props.modelValue) {
    loadCategoryData()
  }
})
</script>

<style scoped>
.category-drawer {
  background: linear-gradient(145deg, rgba(37, 77, 112, 0.95) 0%, rgba(37, 77, 112, 0.98) 100%);
  border-left: 2px solid rgba(239, 228, 210, 0.2);
}

.form-section {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.form-actions {
  border-top: 1px solid rgba(239, 228, 210, 0.1);
}

.status-item {
  transition: all 0.3s ease;
}

.status-list {
  max-height: 400px;
  overflow-y: auto;
}

.q-btn {
  border-radius: 8px;
}
</style>