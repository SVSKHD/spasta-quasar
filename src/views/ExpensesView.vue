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

    <!-- Expense Dialog -->
    <q-dialog v-model="showExpenseDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Expense</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="addExpense" class="q-gutter-md">
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

            <q-select
              v-model="expenseForm.category"
              label="Category"
              outlined
              :options="['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare']"
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

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
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showExpenseDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Add" 
            color="white" 
            text-color="grey-8"
            @click="addExpense"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'

const $q = useQuasar()
const financeStore = useFinanceStore()
const showExpenseDialog = ref(false)

const expenseForm = ref({
  title: '',
  amount: 0,
  category: '',
  date: new Date().toISOString().split('T')[0]
})

const refreshData = async () => {
  await financeStore.loadFinanceData()
  $q.notify({
    type: 'info',
    message: 'Data refreshed',
    position: 'top-right',
    timeout: 1500
  })
}

const addExpense = async () => {
  try {
    const expenseData = {
      ...expenseForm.value,
      description: '',
      type: 'expense' as const,
      tags: []
    }

    await financeStore.addExpense(expenseData)
    
    $q.notify({
      type: 'positive',
      message: 'Expense added successfully',
      position: 'top-right',
      timeout: 2000
    })

    showExpenseDialog.value = false
    expenseForm.value = {
      title: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('Error adding expense:', error)
    $q.notify({
      type: 'negative',
      message: 'Error adding expense',
      position: 'top-right',
      timeout: 3000
    })
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
</style>