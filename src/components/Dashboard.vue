<template>
  <div class="dashboard-content">
    <!-- Category Board Component -->
    <SpastaCategoryBoard
      @add-task="(status, category) => $emit('add-task', status, category)"
      @edit-task="(task) => $emit('edit-task', task)"
      @delete-task="(taskId) => $emit('delete-task', taskId)"
      @move-task="(taskId, newStatus) => $emit('move-task', taskId, newStatus)"
      @toggle-subtask="(taskId, subtaskId) => $emit('toggle-subtask', taskId, subtaskId)"
      @edit-category="(category) => $emit('edit-category', category)"
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
.dashboard-content {
  min-height: 100vh;
  width: 100%;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 0;
  }
}
</style>