<template>
  <div class="expenses-view q-pa-lg">
    <!-- Expenses Header -->
    <div class="header-section q-mb-xl">
      <q-card class="spasta-card header-card">
        <q-card-section class="q-pa-xl">
          <div class="row items-center justify-between">
            <div class="header-title">
              <div class="text-h5 spasta-text text-weight-medium">
                <q-icon name="account_balance_wallet" class="q-mr-md icon-lg" />
                Expense Tracker
              </div>
              <div class="text-body2 spasta-text opacity-70 q-mt-sm">
                Track your income and expenses with detailed analytics
              </div>
            </div>
            <div class="header-actions row q-gutter-md">
              <q-toggle
                v-model="showInUSD"
                color="positive"
                :label="showInUSD ? 'USD' : 'INR'"
                class="currency-toggle spasta-text"
              />
              <q-btn
                flat
                icon="refresh"
                label="Refresh"
                @click="refreshData"
                class="spasta-text action-btn"
                :loading="financeStore.loading"
                size="md"
              />
              <q-btn
                flat
                icon="add"
                label="Add Expense"
                @click="showExpenseDialog = true"
                class="spasta-text action-btn"
                size="md"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Finance Stats -->
    <div class="stats-section q-mb-xl">
      <div class="row q-gutter-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center q-pa-xl">
              <div class="stat-icon-container q-mb-lg">
                <q-icon name="trending_up" size="xl" color="positive" class="stat-icon" />
              </div>
              <div class="text-h4 text-weight-bold text-positive q-mb-sm stat-value">
                {{ formatCurrency(financeStore.financeStats.totalIncome) }}
              </div>
              <div class="text-body2 spasta-text opacity-70 stat-label">Total Income</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center q-pa-xl">
              <div class="stat-icon-container q-mb-lg">
                <q-icon name="trending_down" size="xl" color="negative" class="stat-icon" />
              </div>
              <div class="text-h4 text-weight-bold text-negative q-mb-sm stat-value">
                {{ formatCurrency(financeStore.financeStats.totalExpenses) }}
              </div>
              <div class="text-body2 spasta-text opacity-70 stat-label">Total Expenses</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center q-pa-xl">
              <div class="stat-icon-container q-mb-lg">
                <q-icon 
                  name="account_balance" 
                  size="xl" 
                  :color="financeStore.financeStats.netIncome >= 0 ? 'positive' : 'negative'" 
                  class="stat-icon" 
                />
              </div>
              <div 
                class="text-h4 text-weight-bold q-mb-sm stat-value" 
                :class="financeStore.financeStats.netIncome >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ formatCurrency(financeStore.financeStats.netIncome) }}
              </div>
              <div class="text-body2 spasta-text opacity-70 stat-label">Net Income</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center q-pa-xl">
              <div class="stat-icon-container q-mb-lg">
                <q-icon name="savings" size="xl" color="info" class="stat-icon" />
              </div>
              <div class="text-h4 text-weight-bold text-info q-mb-sm stat-value">
                {{ financeStore.financeStats.savingsRate.toFixed(1) }}%
              </div>
              <div class="text-body2 spasta-text opacity-70 stat-label">Savings Rate</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="table-section">
      <q-card class="spasta-card table-card">
        <q-card-section class="q-pa-xl">
          <!-- Table Header -->
          <div class="table-header q-mb-xl">
            <div class="row items-center justify-between">
              <div class="table-title">
                <div class="text-h6 spasta-text text-weight-medium q-mb-sm">Recent Expenses</div>
                <div class="text-body2 spasta-text opacity-70">
                  Manage and track all your financial transactions
                </div>
              </div>
              <div class="table-controls row items-center q-gutter-md">
                <q-input
                  v-model="searchQuery"
                  placeholder="Search expenses..."
                  outlined
                  dense
                  class="spasta-input search-input"
                  color="white"
                  label-color="white"
                  dark
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
                <q-select
                  v-model="filterCategory"
                  :options="categoryFilterOptions"
                  outlined
                  dense
                  label="Filter by category"
                  class="spasta-input filter-select"
                  color="white"
                  label-color="white"
                  dark
                  clearable
                />
              </div>
            </div>
          </div>

          <!-- Table Container -->
          <div class="table-container">
            <SpastaTable
              :rows="filteredExpenses"
              :columns="expenseColumns"
              :loading="financeStore.loading"
              row-key="id"
              class="expenses-table"
              @action="handleExpenseAction"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Add/Edit Expense Dialog -->
    <q-dialog v-model="showExpenseDialog" persistent>
      <q-card class="spasta-card expense-dialog" style="min-width: 600px; max-width: 700px">
        <q-card-section class="dialog-header q-pa-xl q-pb-lg">
          <div class="text-h6 spasta-text text-weight-medium">
            {{ editingExpense ? 'Edit Expense' : 'Add New Expense' }}
          </div>
          <div class="text-body2 spasta-text opacity-70 q-mt-sm">
            {{ editingExpense ? 'Update expense details' : 'Enter expense information below' }}
          </div>
        </q-card-section>

        <q-card-section class="dialog-content q-pa-xl q-pt-none">
          <q-form @submit="saveExpense" class="expense-form">
            <!-- Basic Information -->
            <div class="form-section q-mb-xl">
              <div class="section-title text-subtitle1 spasta-text text-weight-medium q-mb-lg">
                Basic Information
              </div>
              
              <div class="form-row q-mb-lg">
                <q-input
                  v-model="expenseForm.title"
                  label="Title *"
                  outlined
                  required
                  class="spasta-input form-input"
                  color="white"
                  label-color="white"
                  dark
                  :rules="[val => !!val || 'Title is required']"
                />
              </div>

              <div class="form-row q-mb-lg">
                <q-input
                  v-model="expenseForm.description"
                  label="Description"
                  outlined
                  type="textarea"
                  rows="3"
                  class="spasta-input form-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <!-- Amount and Type -->
            <div class="form-section q-mb-xl">
              <div class="section-title text-subtitle1 spasta-text text-weight-medium q-mb-lg">
                Amount & Type
              </div>
              
              <div class="row q-gutter-lg q-mb-lg">
                <div class="col">
                  <q-input
                    v-model.number="expenseForm.amount"
                    label="Amount *"
                    outlined
                    type="number"
                    step="0.01"
                    required
                    class="spasta-input form-input"
                    color="white"
                    label-color="white"
                    dark
                    :rules="[val => val > 0 || 'Amount must be greater than 0']"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="showInUSD ? 'attach_money' : 'currency_rupee'" />
                    </template>
                  </q-input>
                </div>
                <div class="col">
                  <q-select
                    v-model="expenseForm.type"
                    label="Type *"
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
                    class="spasta-input form-input"
                    color="white"
                    label-color="white"
                    dark
                  >
                    <template v-slot:prepend>
                      <q-icon :name="expenseForm.type === 'income' ? 'trending_up' : 'trending_down'" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>

            <!-- Category and Date -->
            <div class="form-section q-mb-xl">
              <div class="section-title text-subtitle1 spasta-text text-weight-medium q-mb-lg">
                Category & Date
              </div>
              
              <div class="row q-gutter-lg q-mb-lg">
                <div class="col">
                  <q-select
                    v-model="expenseForm.category"
                    label="Category *"
                    outlined
                    :options="categoryOptions"
                    required
                    class="spasta-input form-input"
                    color="white"
                    label-color="white"
                    dark
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" />
                    </template>
                  </q-select>
                </div>
                <div class="col">
                  <q-input
                    v-model="expenseForm.date"
                    label="Date *"
                    outlined
                    type="date"
                    required
                    class="spasta-input form-input"
                    color="white"
                    label-color="white"
                    dark
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-section">
              <div class="section-title text-subtitle1 spasta-text text-weight-medium q-mb-lg">
                Tags (Optional)
              </div>
              
              <div class="form-row">
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
                  :options="tagOptions"
                  @new-value="createTag"
                  class="spasta-input form-input"
                  color="white"
                  label-color="white"
                  dark
                >
                  <template v-slot:prepend>
                    <q-icon name="local_offer" />
                  </template>
                  <template v-slot:no-option>
                    <q-item class="spasta-card">
                      <q-item-section class="spasta-text">
                        Type to add new tags
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions class="dialog-actions q-pa-xl q-pt-lg">
          <div class="row full-width q-gutter-lg">
            <q-btn 
              flat 
              label="Cancel" 
              @click="closeExpenseDialog" 
              class="spasta-text col dialog-btn cancel-btn"
              size="lg"
              icon="close"
            />
            <q-btn 
              flat 
              :label="editingExpense ? 'Update Expense' : 'Add Expense'"
              color="white" 
              text-color="grey-8"
              @click="saveExpense"
              :disable="!expenseForm.title || !expenseForm.amount || expenseForm.amount <= 0"
              :loading="savingExpense"
              class="col dialog-btn save-btn"
              size="lg"
              :icon="editingExpense ? 'save' : 'add'"
            />
          </div>
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
const showExpenseDialog = ref(false)
const editingExpense = ref<Expense | null>(null)
const savingExpense = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const showInUSD = ref(false)
const usdToInrRate = ref(83.5) // 1 USD = 83.5 INR (approximate)

const expenseForm = ref({
  title: '',
  description: '',
  amount: 0,
  category: '',
  date: new Date().toISOString().split('T')[0],
  type: 'expense' as 'expense' | 'income',
  tags: [] as string[]
})

const categoryOptions = [
  'Food & Dining',
  'Transportation', 
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Income',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Business',
  'Investment',
  'Other'
]

const categoryFilterOptions = computed(() => {
  const options = ['All Categories', ...categoryOptions]
  return options
})

const tagOptions = computed(() => {
  const allTags = new Set<string>()
  financeStore.expenses.forEach(expense => {
    expense.tags.forEach(tag => allTags.add(tag))
  })
  return Array.from(allTags).filter(tag => !expenseForm.value.tags.includes(tag))
})

const filteredExpenses = computed(() => {
  let filtered = financeStore.expenses

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(expense => 
      expense.title.toLowerCase().includes(query) ||
      expense.description?.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query) ||
      expense.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Filter by category
  if (filterCategory.value && filterCategory.value !== 'All Categories') {
    filtered = filtered.filter(expense => expense.category === filterCategory.value)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const expenseColumns = [
  {
    name: 'title',
    label: 'Title',
    field: 'title',
    align: 'left',
    sortable: true,
    style: 'min-width: 200px'
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right',
    type: 'currency',
    format: (val: number) => formatCurrency(val)
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center',
    type: 'chip',
    chipColors: {
      'expense': 'negative',
      'income': 'positive'
    }
  },
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'center',
    type: 'chip',
    chipColors: {
      'Food & Dining': 'orange',
      'Transportation': 'blue',
      'Shopping': 'purple',
      'Entertainment': 'pink',
      'Bills & Utilities': 'red',
      'Healthcare': 'green',
      'Income': 'positive'
    }
  },
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'center',
    type: 'date'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: '',
    align: 'center',
    type: 'actions',
    actions: [
      {
        name: 'edit',
        icon: 'edit',
        color: 'primary',
        tooltip: 'Edit expense'
      },
      {
        name: 'delete',
        icon: 'delete',
        color: 'negative',
        tooltip: 'Delete expense'
      }
    ]
  }
]

const formatCurrency = (amount: number) => {
  if (showInUSD.value) {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  } else {
    // Convert to INR if the amount is stored in USD
    const amountInInr = amount * usdToInrRate.value
    return `₹${amountInInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }
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

const handleExpenseAction = async (action: string, expense: Expense) => {
  switch (action) {
    case 'edit':
      editExpense(expense)
      break
    case 'delete':
      await deleteExpense(expense)
      break
  }
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

const deleteExpense = async (expense: Expense) => {
  $q.dialog({
    title: 'Delete Expense',
    message: `Are you sure you want to delete "${expense.title}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    class: 'spasta-card',
    ok: {
      label: 'Delete',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancel',
      color: 'white',
      flat: true
    }
  }).onOk(async () => {
    try {
      const success = await financeStore.deleteExpense(expense.id)
      if (success) {
        $q.notify({
          type: 'positive',
          message: `Expense "${expense.title}" deleted successfully`,
          position: 'top-right',
          timeout: 3000
        })
      } else {
        throw new Error('Failed to delete expense')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      $q.notify({
        type: 'negative',
        message: 'Error deleting expense. Please try again.',
        position: 'top-right',
        timeout: 3000
      })
    }
  })
}

const saveExpense = async () => {
  if (!expenseForm.value.title || !expenseForm.value.amount || expenseForm.value.amount <= 0) {
    return
  }

  savingExpense.value = true
  
  try {
    const expenseData = {
      title: expenseForm.value.title,
      description: expenseForm.value.description,
      amount: expenseForm.value.amount,
      category: expenseForm.value.category,
      date: expenseForm.value.date,
      type: expenseForm.value.type,
      tags: expenseForm.value.tags
    }

    if (editingExpense.value) {
      const updatedExpense = await financeStore.updateExpense(editingExpense.value.id, expenseData)
      if (updatedExpense) {
        $q.notify({
          type: 'positive',
          message: 'Expense updated successfully',
          position: 'top-right',
          timeout: 2000
        })
      } else {
        throw new Error('Failed to update expense')
      }
    } else {
      const newExpense = await financeStore.addExpense(expenseData)
      if (newExpense) {
        $q.notify({
          type: 'positive',
          message: 'Expense added successfully',
          position: 'top-right',
          timeout: 2000
        })
      } else {
        throw new Error('Failed to add expense')
      }
    }
    
    closeExpenseDialog()
  } catch (error) {
    console.error('Error saving expense:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving expense. Please try again.',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    savingExpense.value = false
  }
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

const createTag = (val: string, done: (item?: any) => void) => {
  if (val.length > 0) {
    done(val)
  }
}

onMounted(() => {
  financeStore.loadFinanceData()
})
</script>

<style scoped>
.expenses-view {
  height: calc(100vh - 50px);
  padding: 32px;
}

/* Header Section */
.header-section {
  margin-bottom: 48px;
}

.header-card {
  border-radius: 24px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-card:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 8px 32px rgba(58, 107, 140, 0.3);
}

.header-title {
  flex: 1;
}

.header-actions {
  gap: 16px;
}

.action-btn {
  border-radius: 16px;
  padding: 12px 24px;
  border: 1px solid rgba(239, 228, 210, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: rgba(239, 228, 210, 0.1);
  border-color: rgba(239, 228, 210, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(58, 107, 140, 0.3);
}

/* Stats Section */
.stats-section {
  margin-bottom: 48px;
}

.stat-card {
  border-radius: 20px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 200px;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(58, 107, 140, 0.4);
  border-color: rgba(239, 228, 210, 0.4);
}

.stat-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.stat-icon {
  padding: 16px;
  background: rgba(239, 228, 210, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(239, 228, 210, 0.2);
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  line-height: 1.2;
}

.stat-label {
  font-weight: 500;
  font-size: 1rem;
}

/* Table Section */
.table-card {
  border-radius: 24px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-card:hover {
  border-color: rgba(239, 228, 210, 0.3);
  box-shadow: 0 8px 32px rgba(58, 107, 140, 0.2);
}

.table-header {
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.table-title {
  flex: 1;
}

.table-controls {
  gap: 20px;
}

.search-input {
  min-width: 280px;
}

.filter-select {
  min-width: 220px;
}

.table-container {
  border-radius: 16px;
  overflow: hidden;
}

.expenses-table {
  min-height: 400px;
}

/* Dialog Styling */
.expense-dialog {
  border-radius: 24px;
  border: 2px solid rgba(239, 228, 210, 0.3);
  max-height: 90vh;
  overflow: hidden;
}

.dialog-header {
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  background: rgba(58, 107, 140, 0.05);
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: rgba(239, 228, 210, 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.section-title {
  color: #EFE4D2;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.form-row {
  margin-bottom: 20px;
}

.form-input {
  border-radius: 12px;
}

.dialog-actions {
  border-top: 1px solid rgba(239, 228, 210, 0.1);
  background: rgba(58, 107, 140, 0.05);
}

.dialog-btn {
  border-radius: 16px;
  padding: 16px 32px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cancel-btn {
  border: 1px solid rgba(239, 228, 210, 0.3);
}

.cancel-btn:hover {
  background: rgba(239, 228, 210, 0.1);
  border-color: rgba(239, 228, 210, 0.5);
}

.save-btn {
  border: 1px solid rgba(239, 228, 210, 0.2);
}

.save-btn:hover {
  box-shadow: 0 6px 20px rgba(239, 228, 210, 0.3);
  transform: translateY(-2px);
}

/* Input Styling */
.spasta-input {
  border-radius: 12px;
}

.spasta-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 1px solid rgba(239, 228, 210, 0.3);
  background: rgba(239, 228, 210, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.spasta-input :deep(.q-field__control):hover {
  border-color: rgba(239, 228, 210, 0.5);
  background: rgba(239, 228, 210, 0.1);
  box-shadow: 0 4px 16px rgba(239, 228, 210, 0.1);
}

.spasta-input.q-field--focused :deep(.q-field__control) {
  border-color: #EFE4D2;
  box-shadow: 0 0 0 2px rgba(239, 228, 210, 0.2);
  background: rgba(239, 228, 210, 0.15);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .expenses-view {
    padding: 16px;
  }
  
  .header-section {
    margin-bottom: 32px;
  }
  
  .stats-section {
    margin-bottom: 32px;
  }
  
  .header-card,
  .table-card,
  .expense-dialog {
    border-radius: 16px;
  }
  
  .stat-card {
    border-radius: 16px;
    min-height: 160px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-input,
  .filter-select {
    min-width: auto;
    width: 100%;
  }
  
  .dialog-actions .row {
    flex-direction: column;
    gap: 16px;
  }
  
  .dialog-btn {
    width: 100%;
    margin: 0;
  }
  
  .expense-dialog {
    min-width: 95vw;
    max-width: 95vw;
  }
  
  .form-section {
    padding: 16px;
  }
}

/* Extra Small Screens */
@media (max-width: 480px) {
  .expenses-view {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
  }
  
  .header-card .q-card-section,
  .table-card .q-card-section {
    padding: 20px;
  }
  
  .stat-card .q-card-section {
    padding: 20px;
  }
}

/* Scrollbar Styling */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 6px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}

.currency-toggle :deep(.q-toggle__label) {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 1rem;
  color: #EFE4D2;
  padding-left: 8px;
}
</style>