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
          <!-- Step 1: Board Information -->
          <div class="form-section">
            <div class="section-header q-mb-md">
              <q-icon name="info" class="q-mr-sm" color="primary" />
              <span class="text-subtitle1 spasta-text">Step 1: Board Information</span>
            </div>
            
            <q-input
              v-model="form.name"
              label="Board Name *"
              outlined
              dense
              :rules="[val => !!val || 'Board name is required']"
              class="spasta-input q-mb-md"
              color="white"
              label-color="white"
              dark
              placeholder="e.g., Development Team, Marketing Campaign"
            />

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
              placeholder="Describe what this board is for..."
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="form.icon"
                  label="Board Icon"
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
              <div class="col">
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
            </div>

            <!-- Board Preview -->
            <div class="board-preview q-mt-md">
              <div class="text-caption spasta-text q-mb-sm">Board Preview:</div>
              <q-card flat class="spasta-card-light q-pa-md">
                <div class="row items-center">
                  <q-icon :name="form.icon" :color="form.color" size="md" class="q-mr-sm" />
                  <div>
                    <div class="text-body1 spasta-text text-weight-medium">
                      {{ form.name || 'Board Name' }}
                    </div>
                    <div class="text-caption spasta-text opacity-70">
                      {{ form.description || 'Board description will appear here' }}
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <!-- Step 2: Workflow Design -->
          <div class="form-section">
            <div class="section-header q-mb-md">
              <q-icon name="account_tree" class="q-mr-sm" color="primary" />
              <span class="text-subtitle1 spasta-text">Step 2: Workflow Design</span>
            </div>
            
            <div class="workflow-info q-mb-md">
              <q-banner class="spasta-card-light">
                <template v-slot:avatar>
                  <q-icon name="info" color="info" />
                </template>
                <div class="text-body2 spasta-text">
                  Design your workflow by defining the stages tasks will move through. 
                  Start with basic stages and customize as needed.
                </div>
              </q-banner>
            </div>

            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-body1 spasta-text text-weight-medium">Workflow Stages</div>
                <div class="text-caption spasta-text opacity-70">
                  Define how tasks flow through your board (minimum 2 stages required)
                </div>
              </div>
              <q-btn
                flat
                icon="add"
                label="Add Stage"
                size="sm"
                @click="addStatus"
                class="spasta-text"
                :disable="form.statuses.length >= 8"
              />
            </div>

            <!-- Quick Templates -->
            <div class="workflow-templates q-mb-md">
              <div class="text-caption spasta-text q-mb-sm">Quick Templates:</div>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  size="sm"
                  label="Basic (To Do → Done)"
                  @click="applyTemplate('basic')"
                  class="spasta-text template-btn"
                />
                <q-btn
                  flat
                  size="sm"
                  label="Development (To Do → In Progress → Review → Done)"
                  @click="applyTemplate('development')"
                  class="spasta-text template-btn"
                />
                <q-btn
                  flat
                  size="sm"
                  label="Marketing (Ideas → Planning → Execution → Review → Published)"
                  @click="applyTemplate('marketing')"
                  class="spasta-text template-btn"
                />
              </div>
            </div>

            <!-- Status Configuration -->
            <div v-if="form.statuses.length === 0" class="empty-workflow text-center q-pa-lg">
              <q-icon name="view_column" size="lg" class="spasta-text opacity-30 q-mb-md" />
              <div class="text-body2 spasta-text opacity-70">No workflow stages defined</div>
              <div class="text-caption spasta-text opacity-50">Use a template above or add stages manually</div>
            </div>

            <div v-else class="status-list">
              <div
                v-for="(status, index) in form.statuses"
                :key="index"
                class="status-item q-mb-md"
              >
                <q-card flat bordered class="spasta-card-light">
                  <q-card-section class="q-py-md q-px-lg">
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="text-body2 spasta-text text-weight-medium">
                        Stage {{ index + 1 }}
                        <q-chip 
                          v-if="index === 0" 
                          size="xs" 
                          label="Start" 
                          color="positive" 
                          text-color="white" 
                          class="q-ml-sm"
                        />
                        <q-chip 
                          v-if="index === form.statuses.length - 1" 
                          size="xs" 
                          label="End" 
                          color="info" 
                          text-color="white" 
                          class="q-ml-sm"
                        />
                      </div>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        size="sm"
                        @click="removeStatus(index)"
                        :disable="form.statuses.length <= 2"
                      >
                        <q-tooltip>Remove stage</q-tooltip>
                      </q-btn>
                    </div>
                    
                    <div class="row q-gutter-md items-end">
                      <div class="col-4">
                        <q-input
                          v-model="status.label"
                          label="Stage Name"
                          outlined
                          dense
                          class="spasta-input"
                          color="white"
                          label-color="white"
                          dark
                          placeholder="e.g., In Progress"
                        />
                      </div>
                      <div class="col-3">
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
                        >
                          <template v-slot:selected>
                            <div class="row items-center">
                              <q-icon :name="status.icon" class="q-mr-xs" />
                              <span>{{ getIconLabel(status.icon) }}</span>
                            </div>
                          </template>
                        </q-select>
                      </div>
                      <div class="col-3">
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
                        >
                          <template v-slot:selected>
                            <div class="row items-center">
                              <q-icon name="circle" :color="status.color" class="q-mr-xs" />
                              <span>{{ getColorLabel(status.color) }}</span>
                            </div>
                          </template>
                        </q-select>
                      </div>
                      <div class="col-auto">
                        <!-- Move buttons -->
                        <div class="column q-gutter-xs">
                          <q-btn
                            flat
                            round
                            dense
                            icon="keyboard_arrow_up"
                            size="xs"
                            @click="moveStatus(index, -1)"
                            :disable="index === 0"
                            class="spasta-text"
                          >
                            <q-tooltip>Move up</q-tooltip>
                          </q-btn>
                          <q-btn
                            flat
                            round
                            dense
                            icon="keyboard_arrow_down"
                            size="xs"
                            @click="moveStatus(index, 1)"
                            :disable="index === form.statuses.length - 1"
                            class="spasta-text"
                          >
                            <q-tooltip>Move down</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </div>

                    <!-- Stage Preview -->
                    <div class="stage-preview q-mt-sm">
                      <q-chip 
                        :color="status.color" 
                        text-color="white" 
                        size="sm"
                        :icon="status.icon"
                        :label="status.label || 'Stage Name'"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Workflow Preview -->
            <div v-if="form.statuses.length > 0" class="workflow-preview q-mt-md">
              <div class="text-caption spasta-text q-mb-sm">Workflow Preview:</div>
              <q-card flat class="spasta-card-light q-pa-md">
                <div class="row items-center justify-center q-gutter-sm">
                  <template v-for="(status, index) in form.statuses" :key="index">
                    <q-chip 
                      :color="status.color" 
                      text-color="white" 
                      size="sm"
                      :icon="status.icon"
                      :label="status.label || `Stage ${index + 1}`"
                    />
                    <q-icon 
                      v-if="index < form.statuses.length - 1"
                      name="arrow_forward" 
                      class="spasta-text opacity-50" 
                    />
                  </template>
                </div>
              </q-card>
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
                :label="isEditing ? 'Update Board' : 'Create Board'"
                :loading="submitting"
                :disable="!authStore.isAuthenticated || !form.name || form.statuses.length < 2"
                class="col"
                :icon="isEditing ? 'save' : 'add'"
                size="lg"
              />
            </div>
            
            <!-- Validation Messages -->
            <div v-if="!form.name" class="text-caption text-warning q-mt-sm">
              <q-icon name="warning" class="q-mr-xs" />
              Board name is required
            </div>
            <div v-if="form.statuses.length < 2" class="text-caption text-warning q-mt-sm">
              <q-icon name="warning" class="q-mr-xs" />
              At least 2 workflow stages are required
            </div>
            <div v-if="!authStore.isAuthenticated" class="text-caption text-negative q-mt-sm">
              <q-icon name="error" class="q-mr-xs" />
              You must be logged in to create or update boards
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
import { useAuthStore } from '../stores/authStore'
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
const authStore = useAuthStore()
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
  { label: 'Research', value: 'science' },
  { label: 'Project', value: 'assignment' },
  { label: 'Team', value: 'groups' }
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
  { label: 'Archive', value: 'archive' },
  { label: 'Flag', value: 'flag' },
  { label: 'Star', value: 'star' },
  { label: 'Build', value: 'build' }
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

const getIconLabel = (iconValue: string) => {
  return statusIconOptions.find(opt => opt.value === iconValue)?.label || iconValue
}

const getColorLabel = (colorValue: string) => {
  return statusColorOptions.find(opt => opt.value === colorValue)?.label || colorValue
}

const addStatus = () => {
  const newOrder = form.value.statuses.length + 1
  form.value.statuses.push({
    name: `custom-${newOrder}`,
    label: `Custom Stage ${newOrder}`,
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

const moveStatus = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < form.value.statuses.length) {
    const temp = form.value.statuses[index]
    form.value.statuses[index] = form.value.statuses[newIndex]
    form.value.statuses[newIndex] = temp
    
    // Update order
    form.value.statuses.forEach((status, idx) => {
      status.order = idx + 1
    })
  }
}

const applyTemplate = (template: string) => {
  switch (template) {
    case 'basic':
      form.value.statuses = [
        { name: 'todo', label: 'To Do', color: 'grey', icon: 'radio_button_unchecked', order: 1 },
        { name: 'done', label: 'Done', color: 'positive', icon: 'check_circle', order: 2 }
      ]
      break
    case 'development':
      form.value.statuses = [
        { name: 'todo', label: 'To Do', color: 'grey', icon: 'radio_button_unchecked', order: 1 },
        { name: 'in-progress', label: 'In Progress', color: 'primary', icon: 'play_arrow', order: 2 },
        { name: 'review', label: 'Review', color: 'warning', icon: 'rate_review', order: 3 },
        { name: 'done', label: 'Done', color: 'positive', icon: 'check_circle', order: 4 }
      ]
      break
    case 'marketing':
      form.value.statuses = [
        { name: 'ideas', label: 'Ideas', color: 'purple', icon: 'lightbulb', order: 1 },
        { name: 'planning', label: 'Planning', color: 'info', icon: 'assignment', order: 2 },
        { name: 'execution', label: 'Execution', color: 'primary', icon: 'play_arrow', order: 3 },
        { name: 'review', label: 'Review', color: 'warning', icon: 'rate_review', order: 4 },
        { name: 'published', label: 'Published', color: 'positive', icon: 'publish', order: 5 }
      ]
      break
  }
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
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'negative',
      message: 'You must be logged in to create or update boards',
      position: 'top-right',
      timeout: 3000
    })
    return
  }

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
      console.log('Creating new category...')
      const newCategory = await categoryStore.addCategory(categoryData)
      if (newCategory) {
        console.log('Category created successfully, emitting event:', newCategory)
        emit('category-created', newCategory)
        $q.notify({
          type: 'positive',
          message: `Board "${newCategory.name}" created successfully`,
          position: 'top-right',
          timeout: 2000
        })
      } else {
        throw new Error('Failed to create category')
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

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
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

.board-preview,
.workflow-preview {
  background: rgba(239, 228, 210, 0.03);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(239, 228, 210, 0.05);
}

.stage-preview {
  display: flex;
  justify-content: flex-start;
  padding-top: 8px;
}

.workflow-info {
  margin-bottom: 16px;
}

.workflow-templates {
  background: rgba(239, 228, 210, 0.03);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(239, 228, 210, 0.05);
}

.template-btn {
  border: 1px solid rgba(239, 228, 210, 0.2);
  border-radius: 6px;
  font-size: 11px;
  padding: 4px 8px;
}

.template-btn:hover {
  background: rgba(239, 228, 210, 0.1);
  border-color: rgba(239, 228, 210, 0.4);
}

.empty-workflow {
  background: rgba(239, 228, 210, 0.03);
  border: 2px dashed rgba(239, 228, 210, 0.2);
  border-radius: 8px;
}

.q-btn {
  border-radius: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .category-drawer {
    width: 100vw !important;
  }
  
  .workflow-templates .row {
    flex-direction: column;
  }
  
  .template-btn {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>