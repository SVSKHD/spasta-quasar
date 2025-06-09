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

    <!-- Rest of the template content -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import type { Expense } from '../types/finance'

// Rest of the script content
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

/* Rest of the style content */
</style>