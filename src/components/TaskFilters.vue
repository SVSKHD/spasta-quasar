<template>
  <q-card class="filter-card">
    <q-card-section>
      <div class="row q-gutter-md items-end">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="localFilter.search"
            label="Search tasks..."
            outlined
            dense
            debounce="300"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="localFilter.status"
            label="Status"
            outlined
            dense
            clearable
            :options="statusOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="localFilter.priority"
            label="Priority"
            outlined
            dense
            clearable
            :options="priorityOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="localFilter.tag"
            label="Tag"
            outlined
            dense
            clearable
            :options="tagOptions"
          />
        </div>

        <div class="col-auto">
          <q-btn
            flat
            icon="clear_all"
            label="Clear"
            @click="clearAllFilters"
            :disable="!hasActiveFilters"
          />
        </div>
      </div>

      <div v-if="hasActiveFilters" class="q-mt-md">
        <div class="text-caption text-grey-6 q-mb-xs">Active filters:</div>
        <div class="row q-gutter-xs">
          <q-chip
            v-if="localFilter.search"
            removable
            @remove="localFilter.search = ''"
            color="primary"
            text-color="white"
            size="sm"
          >
            Search: "{{ localFilter.search }}"
          </q-chip>
          
          <q-chip
            v-if="localFilter.status"
            removable
            @remove="localFilter.status = undefined"
            color="primary"
            text-color="white"
            size="sm"
          >
            Status: {{ getStatusLabel(localFilter.status) }}
          </q-chip>
          
          <q-chip
            v-if="localFilter.priority"
            removable
            @remove="localFilter.priority = undefined"
            color="primary"
            text-color="white"
            size="sm"
          >
            Priority: {{ localFilter.priority }}
          </q-chip>
          
          <q-chip
            v-if="localFilter.tag"
            removable
            @remove="localFilter.tag = undefined"
            color="primary"
            text-color="white"
            size="sm"
          >
            Tag: #{{ localFilter.tag }}
          </q-chip>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import type { TaskFilter, TaskStatus, TaskPriority } from '../types/task'

const taskStore = useTaskStore()

const localFilter = ref<TaskFilter>({ ...taskStore.filter })

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Done', value: 'done' }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const tagOptions = computed(() => taskStore.allTags)

const hasActiveFilters = computed(() => {
  return !!(
    localFilter.value.search ||
    localFilter.value.status ||
    localFilter.value.priority ||
    localFilter.value.tag
  )
})

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'in-progress': return 'In Progress'
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const clearAllFilters = () => {
  localFilter.value = {
    search: '',
    status: undefined,
    priority: undefined,
    category: undefined,
    tag: undefined
  }
}

// Watch for changes and update the store
watch(localFilter, (newFilter) => {
  taskStore.setFilter(newFilter)
}, { deep: true })

// Watch for store changes and update local filter
watch(() => taskStore.filter, (newFilter) => {
  localFilter.value = { ...newFilter }
}, { deep: true })
</script>

<style scoped>
.filter-card {
  border-radius: 12px;
}
</style>