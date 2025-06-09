<template>
  <div class="expenses-view q-pa-md">
    <!-- Expenses Header -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h5 spasta-text">
                <q-icon name="account_balance_wallet" class="q-mr-sm icon-lg" />
                Expense Tracker
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
                  label="Add Expense"
                  @click="showExpenseDialog = true"
                  class="spasta-text"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Finance Stats -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="trending_up" size="lg" color="positive" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-positive">${{ financeStore.financeStats.totalIncome.toLocaleString() }}</div>
            <div class="text-body2 spasta-text opacity-70">Total Income</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="trending_down" size="lg" color="negative" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-negative">${{ financeStore.financeStats.totalExpenses.toLocaleString() }}</div>
            <div class="text-body2 spasta-text opacity-70">Total Expenses</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="account_balance" size="lg" :color="financeStore.financeStats.netIncome >= 0 ? 'positive' : 'negative'" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold" :class="financeStore.financeStats.netIncome >= 0 ? 'text-positive' : 'text-negative'">
              ${{ financeStore.financeStats.netIncome.toLocaleString() }}
            </div>
            <div class="text-body2 spasta-text opacity-70">Net Income</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="spasta-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="savings" size="lg" color="info" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-info">{{ financeStore.financeStats.savingsRate.toFixed(1) }}%</div>
            <div class="text-body2 spasta-text opacity-70">Savings Rate</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Expenses Tabs -->
    <div class="row">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-tabs
            v-model="activeTab"
            dense
            class="spasta-tabs"
            active-color="white"
            indicator-color="white"
            align="left"
          >
            <q-tab name="overview" icon="dashboard" label="Overview" class="spasta-text" />
            <q-tab name="expenses" icon="receipt" label="Expenses" class="spasta-text" />
            <q-tab name="categories" icon="category" label="Categories" class="spasta-text" />
            <q-tab name="budgets" icon="pie_chart" label="Budgets" class="spasta-text" />
            <q-tab name="analytics" icon="analytics" label="Analytics" class="spasta-text" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated class="spasta-tab-panels">
            <!-- Overview Tab -->
            <q-tab-panel name="overview">
              <div class="overview-content">
                <!-- Monthly Summary -->
                <div class="row q-gutter-md q-mb-lg">
                  <div class="col-12 col-md-6">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">This Month</div>
                        <div class="row q-gutter-md">
                          <div class="col">
                            <div class="text-h5 text-positive">${{ financeStore.financeStats.monthlyIncome.toLocaleString() }}</div>
                            <div class="text-body2 spasta-text opacity-70">Income</div>
                          </div>
                          <div class="col">
                            <div class="text-h5 text-negative">${{ financeStore.financeStats.monthlyExpenses.toLocaleString() }}</div>
                            <div class="text-body2 spasta-text opacity-70">Expenses</div>
                          </div>
                        </div>
                        <q-linear-progress
                          :value="financeStore.financeStats.budgetUtilization / 100"
                          color="warning"
                          track-color="grey-3"
                          size="8px"
                          rounded
                          class="q-mt-md"
                        />
                        <div class="text-caption spasta-text q-mt-xs">
                          Budget Utilization: {{ financeStore.financeStats.budgetUtilization.toFixed(1) }}%
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Expense Categories</div>
                        <div v-for="(amount, category) in financeStore.expensesByCategory" :key="category" class="category-item q-mb-sm">
                          <div class="row items-center justify-between">
                            <div class="text-body2 spasta-text">{{ category }}</div>
                            <div class="text-weight-bold spasta-text">${{ amount.toLocaleString() }}</div>
                          </div>
                          <q-linear-progress
                            :value="amount / Math.max(...Object.values(financeStore.expensesByCategory))"
                            color="primary"
                            track-color="grey-3"
                            size="4px"
                            rounded
                            class="q-mt-xs"
                          />
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Recent Expenses -->
                <div class="row">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Recent Transactions</div>
                        <q-list>
                          <q-item v-for="expense in financeStore.recentExpenses" :key="expense.id" class="spasta-text">
                            <q-item-section avatar>
                              <q-icon 
                                :name="expense.type === 'income' ? 'trending_up' : 'trending_down'" 
                                :color="expense.type === 'income' ? 'positive' : 'negative'" 
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ expense.title }}</q-item-label>
                              <q-item-label caption class="spasta-text opacity-70">{{ expense.category }} • {{ formatDate(expense.date) }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-item-label :class="expense.type === 'income' ? 'text-positive' : 'text-negative'">
                                {{ expense.type === 'income' ? '+' : '-' }}${{ expense.amount.toLocaleString() }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Expenses Tab -->
            <q-tab-panel name="expenses">
              <div class="expenses-content">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-h6 spasta-text">All Transactions</div>
                  <q-btn
                    flat
                    icon="add"
                    label="Add Transaction"
                    @click="showExpenseDialog = true"
                    class="spasta-text"
                  />
                </div>

                <q-table
                  :rows="financeStore.expenses"
                  :columns="expenseColumns"
                  row-key="id"
                  flat
                  dark
                  class="spasta-table"
                  :pagination="{ rowsPerPage: 15 }"
                >
                  <template v-slot:body-cell-type="props">
                    <q-td :props="props">
                      <q-chip
                        :color="props.value === 'income' ? 'positive' : 'negative'"
                        text-color="white"
                        size="sm"
                        :label="props.value === 'income' ? 'Income' : 'Expense'"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-amount="props">
                    <q-td :props="props">
                      <div :class="props.row.type === 'income' ? 'text-positive' : 'text-negative'" class="text-weight-medium">
                        {{ props.row.type === 'income' ? '+' : '-' }}${{ props.value.toLocaleString() }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        size="sm"
                        @click="editExpense(props.row)"
                        class="spasta-text q-mr-xs"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="sm"
                        @click="deleteExpense(props.row.id)"
                        class="text-negative"
                      />
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- Categories Tab -->
            <q-tab-panel name="categories">
              <div class="categories-content">
                <div class="text-h6 spasta-text q-mb-md">Expense Categories</div>
                <div class="row q-gutter-md">
                  <div v-for="category in financeStore.expenseCategories" :key="category.id" class="col-12 col-sm-6 col-md-4">
                    <q-card class="spasta-card category-card">
                      <q-card-section>
                        <div class="row items-center q-mb-md">
                          <q-icon :name="category.icon" :color="category.color" size="md" class="q-mr-sm" />
                          <div class="text-h6 spasta-text">{{ category.name }}</div>
                        </div>
                        <div v-if="category.budget" class="budget-info">
                          <div class="text-body2 spasta-text opacity-70 q-mb-xs">Monthly Budget</div>
                          <div class="text-h6 spasta-text">${{ category.budget.toLocaleString() }}</div>
                          <div class="text-caption spasta-text opacity-70">
                            Spent: ${{ (financeStore.expensesByCategory[category.name] || 0).toLocaleString() }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Budgets Tab -->
            <q-tab-panel name="budgets">
              <div class="budgets-content">
                <div class="text-h6 spasta-text q-mb-md">Budget Overview</div>
                <div class="row q-gutter-md">
                  <div v-for="budget in financeStore.budgets" :key="budget.id" class="col-12 col-md-6">
                    <q-card class="spasta-card budget-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">{{ budget.category }}</div>
                        <div class="budget-progress q-mb-md">
                          <div class="row items-center justify-between q-mb-xs">
                            <div class="text-body2 spasta-text">Spent</div>
                            <div class="text-body2 spasta-text">${{ budget.spent.toLocaleString() }} / ${{ budget.amount.toLocaleString() }}</div>
                          </div>
                          <q-linear-progress
                            :value="budget.spent / budget.amount"
                            :color="budget.spent / budget.amount > 0.8 ? 'negative' : budget.spent / budget.amount > 0.6 ? 'warning' : 'positive'"
                            track-color="grey-3"
                            size="12px"
                            rounded
                          />
                          <div class="text-caption spasta-text q-mt-xs">
                            {{ ((budget.spent / budget.amount) * 100).toFixed(1) }}% used
                          </div>
                        </div>
                        <div class="text-body2 spasta-text">
                          Remaining: <span class="text-weight-bold">${{ budget.remaining.toLocaleString() }}</span>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Analytics Tab -->
            <q-tab-panel name="analytics">
              <div class="analytics-content">
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Spending Trends</div>
                        <div class="trend-item q-mb-md">
                          <div class="text-body2 spasta-text q-mb-xs">Average Monthly Spending</div>
                          <div class="text-h5 spasta-text">${{ (financeStore.financeStats.totalExpenses / 12).toFixed(0) }}</div>
                        </div>
                        <div class="trend-item q-mb-md">
                          <div class="text-body2 spasta-text q-mb-xs">Largest Expense Category</div>
                          <div class="text-h6 spasta-text">
                            {{ Object.keys(financeStore.expensesByCategory).reduce((a, b) => 
                              financeStore.expensesByCategory[a] > financeStore.expensesByCategory[b] ? a : b, '') }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Financial Health</div>
                        <div class="health-metric q-mb-md">
                          <div class="text-body2 spasta-text q-mb-xs">Savings Rate</div>
                          <q-linear-progress
                            :value="financeStore.financeStats.savingsRate / 100"
                            :color="financeStore.financeStats.savingsRate > 20 ? 'positive' : financeStore.financeStats.savingsRate > 10 ? 'warning' : 'negative'"
                            track-color="grey-3"
                            size="8px"
                            rounded
                          />
                          <div class="text-caption spasta-text q-mt-xs">
                            {{ financeStore.financeStats.savingsRate.toFixed(1) }}% (Recommended: 20%+)
                          </div>
                        </div>
                        <div class="health-metric">
                          <div class="text-body2 spasta-text q-mb-xs">Budget Adherence</div>
                          <q-linear-progress
                            :value="Math.min(financeStore.financeStats.budgetUtilization / 100, 1)"
                            :color="financeStore.financeStats.budgetUtilization > 100 ? 'negative' : financeStore.financeStats.budgetUtilization > 80 ? 'warning' : 'positive'"
                            track-color="grey-3"
                            size="8px"
                            rounded
                          />
                          <div class="text-caption spasta-text q-mt-xs">
                            {{ financeStore.financeStats.budgetUtilization.toFixed(1) }}% of budget used
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Add/Edit Expense Dialog -->
    <q-dialog v-model="showExpenseDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ editingExpense ? 'Edit Transaction' : 'Add Transaction' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveExpense" class="q-gutter-md">
            <q-input
              v-model="expenseForm.title"
              label="Title"
              outlined
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="expenseForm.description"
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
                  v-model.number="expenseForm.amount"
                  label="Amount"
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
                <q-select
                  v-model="expenseForm.type"
                  label="Type"
                  outlined
                  :options="[
                    { label: 'Expense', value: 'expense' },
                    { label: 'Income', value: 'income' }
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
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="expenseForm.category"
                  label="Category"
                  outlined
                  :options="categoryOptions"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-input
                  v-model="expenseForm.date"
                  label="Date"
                  outlined
                  type="date"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <q-select
              v-model="expenseForm.tags"
              label="Tags"
              outlined
              multiple
              use-chips
              use-input
              hide-selected
              fill-input
              new-value-mode="add-unique"
              :options="[]"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeExpenseDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="saveExpense"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import type { Expense } from '../types/finance'

const $q = useQuasar()
const financeStore = useFinanceStore()
const activeTab = ref('overview')
const showExpenseDialog = ref(false)
const editingExpense = ref<Expense | null>(null)

const expenseForm = ref({
  title: '',
  description: '',
  amount: 0,
  category: '',
  date: new Date().toISOString().split('T')[0],
  type: 'expense' as 'expense' | 'income',
  tags: [] as string[]
})

const expenseColumns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'type', align: 'center' as const },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' as const },
  { name: 'category', label: 'Category', field: 'category', align: 'left' as const },
  { name: 'date', label: 'Date', field: 'date', align: 'center' as const, format: (val: string) => formatDate(val) },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const }
]

const categoryOptions = computed(() => {
  return financeStore.expenseCategories.map(cat => cat.name)
})

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

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  expenseForm.value = {
    title: expense.title,
    description: expense.description || '',
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    type: expense.type,
    tags: [...expense.tags]
  }
  showExpenseDialog.value = true
}

const saveExpense = async () => {
  try {
    if (editingExpense.value) {
      await financeStore.updateExpense(editingExpense.value.id, expenseForm.value)
      $q.notify({
        type: 'positive',
        message: 'Transaction updated successfully',
        position: 'top-right',
        timeout: 2000
      })
    } else {
      await financeStore.addExpense(expenseForm.value)
      $q.notify({
        type: 'positive',
        message: 'Transaction added successfully',
        position: 'top-right',
        timeout: 2000
      })
    }
    closeExpenseDialog()
  } catch (error) {
    console.error('Error saving expense:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving transaction',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const deleteExpense = (expenseId: string) => {
  $q.dialog({
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction?',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(async () => {
    const success = await financeStore.deleteExpense(expenseId)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Transaction deleted successfully',
        position: 'top-right',
        timeout: 2000
      })
    }
  })
}

const closeExpenseDialog = () => {
  showExpenseDialog.value = false
  editingExpense.value = null
  expenseForm.value = {
    title: '',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    tags: []
  }
}

onMounted(() => {
  financeStore.loadFinanceData()
})
</script>

<style scoped>
.expenses-view {
  height: calc(100vh - 50px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.budget-card {
  transition: all 0.3s ease;
}

.budget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.category-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.trend-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.health-metric {
  padding: 12px 0;
}

.spasta-tabs {
  background-color: rgba(114, 92, 173, 0.3);
}

.spasta-tabs :deep(.q-tab) {
  color: #EFE4D2;
}

.spasta-tabs :deep(.q-tab--active) {
  background-color: rgba(239, 228, 210, 0.2);
}

.spasta-tab-panels {
  background-color: transparent;
  min-height: 500px;
}

.spasta-table :deep(.q-table__top) {
  background: transparent;
}

.spasta-table :deep(.q-table thead th) {
  background: rgba(114, 92, 173, 0.3);
  color: #EFE4D2;
  font-weight: 600;
}

.spasta-table :deep(.q-table tbody td) {
  color: #EFE4D2;
}

.spasta-table :deep(.q-table tbody tr:hover) {
  background: rgba(114, 92, 173, 0.2);
}

/* Tab content spacing */
.overview-content,
.expenses-content,
.categories-content,
.budgets-content,
.analytics-content {
  padding: 20px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .spasta-tabs {
    font-size: 12px;
  }
  
  .spasta-tabs :deep(.q-tab) {
    min-width: auto;
    padding: 8px 12px;
  }
  
  .overview-content,
  .expenses-content,
  .categories-content,
  .budgets-content,
  .analytics-content {
    padding: 12px;
  }
}
</style>