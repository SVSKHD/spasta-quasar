<template>
  <div class="overview-view">
    <!-- Overview Header -->
    <div class="overview-header q-pa-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="overview-title">
              <div class="text-h5 spasta-text">
                <q-icon name="widgets" class="q-mr-sm icon-lg" />
                Overview Dashboard
              </div>
              <div class="text-body2 spasta-text opacity-70">
                Customize your workspace with resizable widgets
              </div>
            </div>
            
            <div class="overview-controls row items-center spacing-md">
              <q-btn
                flat
                icon="add"
                label="Add Widget"
                @click="showAddWidgetDialog = true"
                class="spasta-text"
              />
              <q-btn
                flat
                icon="settings"
                label="Layout"
                @click="showLayoutDialog = true"
                class="spasta-text"
              />
              <q-btn
                flat
                icon="refresh"
                @click="refreshData"
                class="spasta-text"
                :loading="isLoading"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Overview Content -->
    <div class="overview-content q-pa-md q-pt-none">
      <q-card class="spasta-card">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="construction" size="xl" class="spasta-text opacity-30 q-mb-md" />
          <div class="text-h6 spasta-text opacity-70">Overview Dashboard Coming Soon</div>
          <div class="text-body2 spasta-text opacity-50">
            This will be a customizable dashboard with widgets for tasks, expenses, goals, and more.
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Add Widget Dialog -->
    <q-dialog v-model="showAddWidgetDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Widget</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 spasta-text">Widget functionality coming soon!</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showAddWidgetDialog = false" class="spasta-text" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Layout Dialog -->
    <q-dialog v-model="showLayoutDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Layout Settings</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 spasta-text">Layout customization coming soon!</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showLayoutDialog = false" class="spasta-text" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const showAddWidgetDialog = ref(false)
const showLayoutDialog = ref(false)
const isLoading = ref(false)

const refreshData = async () => {
  isLoading.value = true
  
  // Simulate loading
  setTimeout(() => {
    isLoading.value = false
    $q.notify({
      type: 'info',
      message: 'Data refreshed',
      position: 'top-right',
      timeout: 1500
    })
  }, 1000)
}
</script>

<style scoped>
.overview-view {
  height: calc(100vh - 50px);
}

.overview-header {
  padding-bottom: 0;
}

.overview-controls {
  gap: 16px;
}

.overview-content {
  flex: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .overview-view {
    padding: 12px;
  }
  
  .overview-controls {
    flex-direction: column;
    gap: 12px;
  }
}
</style>