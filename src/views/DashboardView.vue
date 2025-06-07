<template>
  <div class="dashboard-view">
    <SpastaDashboard
      @add-task="$emit('add-task', $event, arguments[1])"
      @edit-task="$emit('edit-task', $event)"
      @delete-task="$emit('delete-task', $event)"
      @move-task="$emit('move-task', $event, arguments[1])"
      @toggle-subtask="$emit('toggle-subtask', $event, arguments[1])"
      @edit-category="$emit('edit-category', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task, Category } from '../types/task'

interface Emits {
  (e: 'add-task', status: string, category?: string): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', taskId: string): void
  (e: 'move-task', taskId: string, newStatus: string): void
  (e: 'toggle-subtask', taskId: string, subtaskId: string): void
  (e: 'edit-category', category: Category): void
}

defineEmits<Emits>()
</script>

<style scoped>
.dashboard-view {
  height: 100%;
  width: 100%;
  padding-top: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dashboard-view {
    padding: 0;
  }
}
</style>