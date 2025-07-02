<template>
  <div class="overview-view">
    <!-- Overview Content Grid -->
    <div class="overview-grid">
      <!-- Quick Stats Section -->
      <div class="stats-section">
        <q-card class="spasta-card stats-card">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 spasta-text q-mb-md">
              <q-icon name="analytics" class="q-mr-sm icon-lg" />
              Quick Stats
            </div>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value text-h4 text-positive">{{ taskStore.taskStats.total }}</div>
                <div class="stat-label text-caption spasta-text opacity-70">Total Tasks</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 text-warning">{{ taskStore.taskStats.inProgress }}</div>
                <div class="stat-label text-caption spasta-text opacity-70">In Progress</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 text-info">${{ financeStore.financeStats.monthlyExpenses.toLocaleString() }}</div>
                <div class="stat-label text-caption spasta-text opacity-70">Monthly Expenses</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 text-purple">{{ financeStore.activeGoals.length }}</div>
                <div class="stat-label text-caption spasta-text opacity-70">Active Goals</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity Section -->
      <div class="activity-section">
        <q-card class="spasta-card activity-card">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 spasta-text q-mb-md">
              <q-icon name="history" class="q-mr-sm icon-lg" />
              Recent Activity
            </div>
            
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item q-mb-md">
                <div class="row items-center">
                  <q-icon :name="activity.icon" :color="activity.color" size="sm" class="q-mr-sm" />
                  <div class="activity-content">
                    <div class="text-body2 spasta-text">{{ activity.title }}</div>
                    <div class="text-caption spasta-text opacity-70">{{ activity.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions Section -->
      <div class="actions-section">
        <q-card class="spasta-card actions-card">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 spasta-text q-mb-md">
              <q-icon name="flash_on" class="q-mr-sm icon-lg" />
              Quick Actions
            </div>
            
            <div class="actions-grid">
              <q-btn
                flat
                class="action-btn spasta-text"
                @click="navigateTo('Dashboard')"
              >
                <div class="action-content">
                  <q-icon name="dashboard" size="lg" class="q-mb-sm" />
                  <div class="text-body2">Tasks</div>
                </div>
              </q-btn>
              
              <q-btn
                flat
                class="action-btn spasta-text"
                @click="navigateTo('Notes')"
              >
                <div class="action-content">
                  <q-icon name="note" size="lg" class="q-mb-sm" />
                  <div class="text-body2">Notes</div>
                </div>
              </q-btn>
              
              <q-btn
                flat
                class="action-btn spasta-text"
                @click="navigateTo('Expenses')"
              >
                <div class="action-content">
                  <q-icon name="account_balance_wallet" size="lg" class="q-mb-sm" />
                  <div class="text-body2">Expenses</div>
                </div>
              </q-btn>
              
              <q-btn
                flat
                class="action-btn spasta-text"
                @click="navigateTo('Calendar')"
              >
                <div class="action-content">
                  <q-icon name="event" size="lg" class="q-mb-sm" />
                  <div class="text-body2">Calendar</div>
                </div>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <q-card class="spasta-card progress-card">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 spasta-text q-mb-md">
              <q-icon name="trending_up" class="q-mr-sm icon-lg" />
              Progress Overview
            </div>
            
            <div class="progress-items">
              <div class="progress-item q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-body2 spasta-text">Task Completion</div>
                  <div class="text-caption spasta-text">{{ taskCompletionRate }}%</div>
                </div>
                <q-linear-progress
                  :value="taskCompletionRate / 100"
                  color="positive"
                  track-color="grey-3"
                  size="8px"
                  rounded
                />
              </div>
              
              <div class="progress-item q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-body2 spasta-text">Budget Usage</div>
                  <div class="text-caption spasta-text">{{ budgetUsage }}%</div>
                </div>
                <q-linear-progress
                  :value="budgetUsage / 100"
                  :color="budgetUsage > 80 ? 'negative' : budgetUsage > 60 ? 'warning' : 'info'"
                  track-color="grey-3"
                  size="8px"
                  rounded
                />
              </div>
              
              <div class="progress-item">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-body2 spasta-text">Goals Progress</div>
                  <div class="text-caption spasta-text">{{ goalsProgress }}%</div>
                </div>
                <q-linear-progress
                  :value="goalsProgress / 100"
                  color="purple"
                  track-color="grey-3"
                  size="8px"
                  rounded
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../stores/taskStore'
import { useFinanceStore } from '../stores/financeStore'

const router = useRouter()
const taskStore = useTaskStore()
const financeStore = useFinanceStore()

const taskCompletionRate = computed(() => {
  const total = taskStore.taskStats.total
  const done = taskStore.taskStats.done
  return total > 0 ? Math.round((done / total) * 100) : 0
})

const budgetUsage = computed(() => {
  return Math.round(financeStore.financeStats.budgetUtilization)
})

const goalsProgress = computed(() => {
  return Math.round(financeStore.financeStats.goalsProgress)
})

const recentActivities = computed(() => [
  {
    id: 1,
    title: 'Task completed: Project Planning',
    time: '2 hours ago',
    icon: 'check_circle',
    color: 'positive'
  },
  {
    id: 2,
    title: 'New expense added: $85.50',
    time: '4 hours ago',
    icon: 'account_balance_wallet',
    color: 'warning'
  },
  {
    id: 3,
    title: 'Goal milestone reached',
    time: '1 day ago',
    icon: 'flag',
    color: 'purple'
  },
  {
    id: 4,
    title: 'Note created: Meeting Notes',
    time: '2 days ago',
    icon: 'note',
    color: 'info'
  }
])

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}

onMounted(() => {
  // Load data if not already loaded
  if (taskStore.tasks.length === 0) {
    taskStore.loadTasks()
  }
  if (financeStore.expenses.length === 0) {
    financeStore.loadFinanceData()
  }
})
</script>

<style scoped>
.overview-view {
  height: 100%;
  width: 100%;
  padding: 8px;
  overflow-y: auto;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;
  grid-template-areas:
    "stats stats"
    "activity actions"
    "progress progress";
}

.stats-section {
  grid-area: stats;
}

.activity-section {
  grid-area: activity;
}

.actions-section {
  grid-area: actions;
}

.progress-section {
  grid-area: progress;
}

.stats-card,
.activity-card,
.actions-card,
.progress-card {
  height: 100%;
  width: 100%;
  border-radius: 16px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  background: linear-gradient(135deg, rgba(58, 107, 140, 0.15) 0%, rgba(37, 77, 112, 0.15) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover,
.activity-card:hover,
.actions-card:hover,
.progress-card:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 6px 20px rgba(58, 107, 140, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(239, 228, 210, 0.1);
  transform: translateY(-2px);
  border-color: rgba(239, 228, 210, 0.2);
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 1.75rem;
  line-height: 1.2;
}

.stat-label {
  font-weight: 500;
  font-size: 0.85rem;
  line-height: 1.3;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 12px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.activity-item:hover {
  background: rgba(239, 228, 210, 0.1);
  transform: translateY(-2px);
  border-color: rgba(239, 228, 210, 0.2);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-btn {
  height: 100px;
  border: 1px solid rgba(239, 228, 210, 0.2);
  border-radius: 12px;
  background: rgba(239, 228, 210, 0.05);
  transition: all 0.2s ease;
  padding: 0 !important;
}

.action-btn:hover {
  background: rgba(239, 228, 210, 0.15);
  border-color: rgba(239, 228, 210, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(58, 107, 140, 0.3);
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 16px;
}

.action-content .q-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.action-content .text-body2 {
  font-size: 1rem;
  font-weight: 500;
}

.progress-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  padding: 16px;
  background: rgba(239, 228, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  transition: all 0.2s ease;
}

.progress-item:hover {
  background: rgba(239, 228, 210, 0.1);
  border-color: rgba(239, 228, 210, 0.2);
}

/* Tablet responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .action-btn {
    height: 80px;
  }
  
  .action-content .q-icon {
    font-size: 1.75rem;
    margin-bottom: 8px;
  }
  
  .action-content .text-body2 {
    font-size: 0.9rem;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .overview-view {
    padding: 4px;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "stats"
      "activity"
      "actions"
      "progress";
    gap: 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .action-btn {
    height: 70px;
  }
  
  .action-content {
    padding: 12px;
  }
  
  .action-content .q-icon {
    font-size: 1.5rem;
    margin-bottom: 6px;
  }
  
  .action-content .text-body2 {
    font-size: 0.85rem;
  }
  
  .progress-item {
    padding: 12px;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .overview-view {
    padding: 2px;
  }
  
  .overview-grid {
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .stat-item {
    padding: 10px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .action-btn {
    height: 60px;
  }
  
  .action-content .q-icon {
    font-size: 1.25rem;
    margin-bottom: 4px;
  }
  
  .action-content .text-body2 {
    font-size: 0.8rem;
  }
}

/* Scrollbar styling */
.overview-view::-webkit-scrollbar,
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.overview-view::-webkit-scrollbar-track,
.activity-list::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 6px;
}

.overview-view::-webkit-scrollbar-thumb,
.activity-list::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.overview-view::-webkit-scrollbar-thumb:hover,
.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}
</style>