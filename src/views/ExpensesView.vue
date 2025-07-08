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

    <!-- Expenses Table -->
    <div class="expenses-table q-mb-lg">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 spasta-text">Recent Expenses</div>
            <div class="row items-center q-gutter-sm">
              <q-input
                v-model="searchQuery"
                placeholder="Search expenses..."
                outlined
                dense
                class="spasta-input"
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
                class="spasta-input"
                color="white"
                label-color="white"
                dark
                clearable
              />
            </div>
          </div>

          <!-- Expenses Table -->
          <SpastaTable
            :rows="filteredExpenses"
            :columns="expenseColumns"
            :loading="financeStore.loading"
            row-key="id"
            class="expenses-table"
            @action="handleExpenseAction"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Add/Edit Expense Dialog -->
    <q-dialog v-model="showExpenseDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ editingExpense ? 'Edit Expense' : 'Add Expense' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveExpense" class="q-gutter-md">
            <q-input
              v-model="expenseForm.title"
              label="Title *"
              outlined
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
              :rules="[val => !!val || 'Title is required']"
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
                  label="Amount *"
                  outlined
                  type="number"
                  step="0.01"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                  :rules="[val => val > 0 || 'Amount must be greater than 0']"
                />
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
                  label="Category *"
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
                  label="Date *"
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
              :options="tagOptions"
              @new-value="createTag"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            >
              <template v-slot:no-option>
                <q-item class="spasta-card">
                  <q-item-section class="spasta-text">
                    Type to add new tags
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="dialog-button-group">
          <q-btn flat label="Cancel" @click="closeExpenseDialog" class="spasta-text" />
          <q-btn 
            flat 
            :label="editingExpense ? 'Update' : 'Add'"
            color="white" 
            text-color="grey-8"
            @click="saveExpense"
            :disable="!expenseForm.title || !expenseForm.amount || expenseForm.amount <= 0"
            :loading="savingExpense"
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
const showExpenseDialog = ref(false)
const editingExpense = ref<Expense | null>(null)
const savingExpense = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')

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
    currencySymbol: '$'
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
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.expenses-table {
  min-height: 400px;
}

.dialog-button-group {
  padding: 24px;
  border-top: 1px solid rgba(239, 228, 210, 0.1);
  gap: 16px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .expenses-view {
    padding: 12px;
  }
  
  .dialog-button-group {
    flex-direction: column;
  }
  
  .dialog-button-group .q-btn {
    width: 100%;
  }
}
</style>