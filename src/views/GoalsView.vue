<template>
  <div class="goals-view q-pa-md">
    <!-- Goals Header -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h5 spasta-text">
                <q-icon name="flag" class="q-mr-sm icon-lg" />
                Financial Goals
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  icon="refresh"
                  label="Refresh"
                  @click="refreshData"
                  class="spasta-text"
                  :loading="financeStore.loading"
                />
                <q-btn
                  flat
                  icon="add"
                  label="Add Goal"
                  @click="showGoalDialog = true"
                  class="spasta-text"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Goals Stats -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="flag" size="lg" color="primary" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold spasta-text">{{ financeStore.activeGoals.length }}</div>
            <div class="text-body2 spasta-text opacity-70">Active Goals</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="trending_up" size="lg" color="positive" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-positive">{{ financeStore.financeStats.goalsProgress.toFixed(1) }}%</div>
            <div class="text-body2 spasta-text opacity-70">Average Progress</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="account_balance" size="lg" color="info" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-info">${{ totalGoalAmount.toLocaleString() }}</div>
            <div class="text-body2 spasta-text opacity-70">Total Target</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="savings" size="lg" color="warning" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-warning">${{ totalSavedAmount.toLocaleString() }}</div>
            <div class="text-body2 spasta-text opacity-70">Total Saved</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Goals Grid -->
    <div class="row q-gutter-md">
      <div v-for="goal in financeStore.goals" :key="goal.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="spasta-card goal-card">
          <q-card-section>
            <div class="row items-start justify-between q-mb-md">
              <div class="goal-header">
                <div class="text-h6 text-weight-medium spasta-text q-mb-xs">{{ goal.title }}</div>
                <div class="text-body2 spasta-text opacity-80">{{ goal.description }}</div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                size="sm"
                @click="showGoalMenu(goal)"
                class="spasta-text"
              />
            </div>

            <!-- Goal Progress -->
            <div class="goal-progress q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2 spasta-text">Progress</div>
                <div class="text-body2 spasta-text">
                  ${{ goal.currentAmount.toLocaleString() }} / ${{ goal.targetAmount.toLocaleString() }}
                </div>
              </div>
              <q-linear-progress
                :value="goal.currentAmount / goal.targetAmount"
                :color="getProgressColor(goal.currentAmount / goal.targetAmount)"
                track-color="grey-3"
                size="12px"
                rounded
              />
              <div class="text-caption spasta-text q-mt-xs">
                {{ ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) }}% complete
              </div>
            </div>

            <!-- Goal Details -->
            <div class="goal-details q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <q-chip
                  :color="getPriorityColor(goal.priority)"
                  text-color="white"
                  size="sm"
                  :label="goal.priority"
                  class="text-capitalize"
                />
                <q-chip
                  :color="getStatusColor(goal.status)"
                  text-color="white"
                  size="sm"
                  :label="goal.status"
                  class="text-capitalize"
                />
              </div>
              
              <div v-if="goal.targetDate" class="text-caption spasta-text opacity-70">
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                Target: {{ formatDate(goal.targetDate) }}
              </div>
            </div>

            <!-- Milestones -->
            <div v-if="goal.milestones.length > 0" class="milestones q-mb-md">
              <div class="text-body2 spasta-text q-mb-sm">Milestones</div>
              <div v-for="milestone in goal.milestones.slice(0, 3)" :key="milestone.id" class="milestone-item q-mb-xs">
                <div class="row items-center">
                  <q-checkbox
                    :model-value="milestone.completed"
                    size="xs"
                    color="positive"
                    class="q-mr-sm"
                    @click="toggleMilestone(goal.id, milestone.id)"
                  />
                  <span 
                    class="text-caption spasta-text"
                    :class="{ 'text-strike opacity-60': milestone.completed }"
                  >
                    {{ milestone.title }} (${{ milestone.amount.toLocaleString() }})
                  </span>
                </div>
              </div>
              <div v-if="goal.milestones.length > 3" class="text-caption spasta-text opacity-50">
                +{{ goal.milestones.length - 3 }} more milestones...
              </div>
            </div>

            <!-- Actions -->
            <div class="goal-actions">
              <q-btn
                flat
                icon="add"
                label="Add Funds"
                size="sm"
                @click="showContributionDialog(goal)"
                class="spasta-text q-mr-sm"
              />
              <q-btn
                flat
                icon="edit"
                label="Edit"
                size="sm"
                @click="editGoal(goal)"
                class="spasta-text"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Add New Goal Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card 
          class="spasta-card add-goal-card cursor-pointer"
          @click="showGoalDialog = true"
        >
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="add" size="xl" color="primary" class="q-mb-lg" />
            <div class="text-h6 text-weight-medium text-primary q-mb-sm">
              Create New Goal
            </div>
            <div class="text-body2 spasta-text">
              Set a new financial target and track your progress
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Add/Edit Goal Dialog -->
    <q-dialog v-model="showGoalDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveGoal" class="q-gutter-md">
            <q-input
              v-model="goalForm.title"
              label="Goal Title"
              outlined
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="goalForm.description"
              label="Description"
              outlined
              type="textarea"
              rows="2"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model.number="goalForm.targetAmount"
                  label="Target Amount"
                  outlined
                  type="number"
                  step="0.01"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="goalForm.currentAmount"
                  label="Current Amount"
                  outlined
                  type="number"
                  step="0.01"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="goalForm.priority"
                  label="Priority"
                  outlined
                  :options="[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' }
                  ]"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-select
                  v-model="goalForm.category"
                  label="Category"
                  outlined
                  :options="goalCategories"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <q-input
              v-model="goalForm.targetDate"
              label="Target Date (optional)"
              outlined
              type="date"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeGoalDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="saveGoal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Contribution Dialog -->
    <q-dialog v-model="showContributionDialogVisible">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Contribution</div>
          <div class="text-body2 spasta-text opacity-70">{{ selectedGoal?.title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model.number="contributionAmount"
            label="Contribution Amount"
            outlined
            type="number"
            step="0.01"
            required
            class="spasta-input"
            color="white"
            label-color="white"
            dark
          />
          
          <div v-if="selectedGoal" class="q-mt-md">
            <div class="text-body2 spasta-text q-mb-xs">Progress after contribution:</div>
            <div class="text-h6 spasta-text">
              ${{ (selectedGoal.currentAmount + (contributionAmount || 0)).toLocaleString() }} / ${{ selectedGoal.targetAmount.toLocaleString() }}
            </div>
            <q-linear-progress
              :value="Math.min((selectedGoal.currentAmount + (contributionAmount || 0)) / selectedGoal.targetAmount, 1)"
              color="positive"
              track-color="grey-3"
              size="8px"
              rounded
              class="q-mt-xs"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showContributionDialogVisible = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Add Contribution" 
            color="white" 
            text-color="grey-8"
            @click="addContribution"
            :disable="!contributionAmount || contributionAmount <= 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Goal Menu -->
    <q-menu v-model="goalMenuVisible" class="spasta-card">
      <q-list style="min-width: 120px">
        <q-item 
          clickable 
          v-close-popup
          @click="selectedGoalForMenu && editGoal(selectedGoalForMenu)"
          class="spasta-text"
        >
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item 
          clickable 
          v-close-popup
          @click="selectedGoalForMenu && deleteGoal(selectedGoalForMenu.id)"
          class="text-negative"
        >
          <q-item-section avatar>
            <q-icon name="delete" />
          </q-item-section>
          <q-item-section>Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import type { Goal } from '../types/finance'

const $q = useQuasar()
const financeStore = useFinanceStore()
const showGoalDialog = ref(false)
const showContributionDialogVisible = ref(false)
const goalMenuVisible = ref(false)
const editingGoal = ref<Goal | null>(null)
const selectedGoal = ref<Goal | null>(null)
const selectedGoalForMenu = ref<Goal | null>(null)
const contributionAmount = ref(0)

const goalForm = ref({
  title: '',
  description: '',
  targetAmount: 0,
  currentAmount: 0,
  targetDate: '',
  category: '',
  priority: 'medium' as 'low' | 'medium' | 'high'
})

const goalCategories = [
  'Emergency Fund',
  'Vacation',
  'Home Down Payment',
  'Car Purchase',
  'Education',
  'Retirement',
  'Investment',
  'Debt Payoff',
  'Other'
]

const totalGoalAmount = computed(() => {
  return financeStore.goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
})

const totalSavedAmount = computed(() => {
  return financeStore.goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
})

const getProgressColor = (progress: number) => {
  if (progress >= 1) return 'positive'
  if (progress >= 0.75) return 'info'
  if (progress >= 0.5) return 'warning'
  return 'negative'
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'positive'
    default: return 'grey'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'positive'
    case 'active': return 'primary'
    case 'paused': return 'warning'
    default: return 'grey'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const refreshData = async () => {
  await financeStore.loadFinanceData()
  $q.notify({
    type: 'info',
    message: 'Data refreshed',
    position: 'top-right',
    timeout: 1500
  })
}

const showGoalMenu = (goal: Goal) => {
  selectedGoalForMenu.value = goal
  goalMenuVisible.value = true
}

const editGoal = (goal: Goal) => {
  editingGoal.value = goal
  goalForm.value = {
    title: goal.title,
    description: goal.description || '',
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    targetDate: goal.targetDate || '',
    category: goal.category,
    priority: goal.priority
  }
  showGoalDialog.value = true
}

const saveGoal = async () => {
  try {
    const goalData = {
      ...goalForm.value,
      status: 'active' as const,
      milestones: editingGoal.value?.milestones || []
    }

    if (editingGoal.value) {
      await financeStore.updateGoal(editingGoal.value.id, goalData)
      $q.notify({
        type: 'positive',
        message: 'Goal updated successfully',
        position: 'top-right',
        timeout: 2000
      })
    } else {
      await financeStore.addGoal(goalData)
      $q.notify({
        type: 'positive',
        message: 'Goal created successfully',
        position: 'top-right',
        timeout: 2000
      })
    }
    closeGoalDialog()
  } catch (error) {
    console.error('Error saving goal:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving goal',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const deleteGoal = (goalId: string) => {
  $q.dialog({
    title: 'Delete Goal',
    message: 'Are you sure you want to delete this goal?',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(async () => {
    const success = await financeStore.deleteGoal(goalId)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Goal deleted successfully',
        position: 'top-right',
        timeout: 2000
      })
    }
  })
}

const showContributionDialog = (goal: Goal) => {
  selectedGoal.value = goal
  contributionAmount.value = 0
  showContributionDialogVisible.value = true
}

const addContribution = async () => {
  if (selectedGoal.value && contributionAmount.value > 0) {
    const success = await financeStore.addGoalContribution(selectedGoal.value.id, contributionAmount.value)
    if (success) {
      $q.notify({
        type: 'positive',
        message: `$${contributionAmount.value.toLocaleString()} added to ${selectedGoal.value.title}`,
        position: 'top-right',
        timeout: 2000
      })
      showContributionDialogVisible.value = false
    }
  }
}

const toggleMilestone = async (goalId: string, milestoneId: string) => {
  const goal = financeStore.goals.find(g => g.id === goalId)
  if (!goal) return

  const milestone = goal.milestones.find(m => m.id === milestoneId)
  if (!milestone) return

  milestone.completed = !milestone.completed
  if (milestone.completed) {
    milestone.completedAt = new Date().toISOString()
  } else {
    milestone.completedAt = undefined
  }

  await financeStore.updateGoal(goalId, { milestones: goal.milestones })
}

const closeGoalDialog = () => {
  showGoalDialog.value = false
  editingGoal.value = null
  goalForm.value = {
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: '',
    priority: 'medium'
  }
}

onMounted(() => {
  financeStore.loadFinanceData()
})
</script>

<style scoped>
.goals-view {
  height: calc(100vh - 50px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.goal-card {
  transition: all 0.3s ease;
  min-height: 300px;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(114, 92, 173, 0.4);
}

.add-goal-card {
  border: 2px dashed rgba(239, 228, 210, 0.3);
  background: rgba(58, 107, 140, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.add-goal-card:hover {
  border-color: rgba(239, 228, 210, 0.5);
  background: rgba(58, 107, 140, 0.2);
}

.goal-header {
  flex: 1;
}

.goal-progress {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.milestone-item {
  padding: 4px 0;
}

.text-strike {
  text-decoration: line-through;
}

.goal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .goals-view {
    padding: 12px;
  }
  
  .goal-card {
    min-height: auto;
  }
  
  .add-goal-card {
    min-height: 200px;
  }
}
</style>