<template>
  <div class="dashboard-view">
    <SpastaDashboard
      @add-task="(status: string, category?: string) => $emit('add-task', status, category)"
      @edit-task="(task: Task) => $emit('edit-task', task)"
      @delete-task="(taskId: string) => $emit('delete-task', taskId)"
      @move-task="(taskId: string, newStatus: string) => $emit('move-task', taskId, newStatus)"
      @toggle-subtask="(taskId: string, subtaskId: string) => $emit('toggle-subtask', taskId, subtaskId)"
      @edit-category="(category?: Category) => $emit('edit-category', category)"
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
  (e: 'edit-category', category?: Category): void
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