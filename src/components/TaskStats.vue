<template>
  <div class="row q-gutter-md">
    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="stat-card">
        <q-card-section class="text-center">
          <q-icon name="assignment" size="lg" color="primary" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold text-primary">{{ stats.total }}</div>
          <div class="text-body2 text-grey-6">Total Tasks</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="stat-card">
        <q-card-section class="text-center">
          <q-icon name="radio_button_unchecked" size="lg" color="grey" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold text-grey">{{ stats.todo }}</div>
          <div class="text-body2 text-grey-6">To Do</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="stat-card">
        <q-card-section class="text-center">
          <q-icon name="hourglass_empty" size="lg" color="primary" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold text-primary">{{ stats.inProgress }}</div>
          <div class="text-body2 text-grey-6">In Progress</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="stat-card">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="lg" color="positive" class="q-mb-sm" />
          <div class="text-h4 text-weight-bold text-positive">{{ stats.done }}</div>
          <div class="text-body2 text-grey-6">Completed</div>
        </q-card-section>
      </q-card>
    </div>

    <div v-if="stats.overdue > 0" class="col-12">
      <q-banner class="bg-negative text-white rounded-borders">
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        <div class="text-weight-medium">
          {{ stats.overdue }} task{{ stats.overdue > 1 ? 's' : '' }} overdue
        </div>
        <div class="text-caption">Review your deadlines and update task priorities</div>
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskStats } from '../types/task'

interface Props {
  stats: TaskStats
}

defineProps<Props>()
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
</style>