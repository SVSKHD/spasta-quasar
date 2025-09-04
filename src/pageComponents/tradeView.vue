<template>
  <div>
    <h4 class="text-white q-mb-md">Trade View</h4>

    <spasta-tabs :tabs="tabs" default-tab="brokers">
      <!-- Broker Details -->
      <template #panel-brokers>
        <div class="q-gutter-md">
          <q-card class="bg-secondary text-white rounded-borders">
            <q-card-section>
              <div class="text-h6">Broker: IC Markets</div>
              <div class="text-body2">Type: ECN</div>
              <div class="text-body2">Leverage: 1:500</div>
              <div class="text-body2">Spread: Raw (0.0 pips + commission)</div>
              <div class="text-body2">Regulation: ASIC, CySEC</div>
            </q-card-section>
          </q-card>

          <q-card class="bg-secondary text-white rounded-borders">
            <q-card-section>
              <div class="text-h6">Broker: Exness</div>
              <div class="text-body2">Type: Market Maker</div>
              <div class="text-body2">Leverage: Unlimited</div>
              <div class="text-body2">Spread: Variable (0.3–1.0 pips avg)</div>
              <div class="text-body2">Regulation: FCA, CySEC</div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- Trading Accounts -->
      <template #panel-accounts>
        <q-list bordered class="bg-primary text-white rounded-borders">
          <q-item>
            <q-item-section>
              <q-item-label>Account 1: Live ECN</q-item-label>
              <q-item-label caption
                >Balance: $10,500 | Currency: USD</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Account 2: Demo Standard</q-item-label>
              <q-item-label caption
                >Balance: $50,000 | Currency: USD</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
      </template>

      <!-- Settings -->
      <template #panel-settings>
        <q-form class="q-gutter-md">
          <q-input filled v-model="leverage" label="Preferred Leverage" />
          <q-input filled v-model="currency" label="Account Currency" />
          <q-btn color="secondary" label="Save Settings" />
        </q-form>
      </template>
    </spasta-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tabs = [
  { name: "brokers", label: "Brokers", icon: "store" },
  { name: "accounts", label: "Accounts", icon: "account_balance_wallet" },
  { name: "settings", label: "Settings", icon: "settings" },
];

const leverage = ref("1:100");
const currency = ref("USD");
</script>
