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

    <!-- Rest of template content -->

  </div>
</template>

<script setup lang="ts">
// Script content
</script>

<style scoped>
/* Style content */
</style>