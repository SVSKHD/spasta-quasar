<template>
  <div class="backup-view q-pa-md">
    <!-- Backup Header -->
    <div class="backup-header q-mb-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="backup-title">
              <div class="text-h5 spasta-text">
                <q-icon name="backup" class="q-mr-sm icon-lg" />
                Code Backup Manager
              </div>
              <div class="text-body2 spasta-text opacity-70">
                Manage your GitHub repositories and backup preferences
              </div>
            </div>
            
            <div class="backup-controls row items-center spacing-md">
              <q-btn
                flat
                icon="refresh"
                label="Sync Repos"
                @click="syncRepositories"
                class="spasta-text"
                :loading="loading"
              />
              <q-btn
                flat
                icon="settings"
                label="Settings"
                @click="showSettingsDialog = true"
                class="spasta-text"
              />
              <q-btn
                v-if="!githubConnected"
                flat
                icon="link"
                label="Connect GitHub"
                @click="connectGitHub"
                class="spasta-text"
                color="positive"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- GitHub Connection Status -->
    <div v-if="githubConnected" class="connection-status q-mb-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-avatar size="40px" class="q-mr-md">
                <img v-if="githubUser?.avatar_url" :src="githubUser.avatar_url" :alt="githubUser.login" />
                <q-icon v-else name="person" />
              </q-avatar>
              <div>
                <div class="text-body1 spasta-text text-weight-medium">
                  Connected to GitHub
                </div>
                <div class="text-caption spasta-text opacity-70">
                  {{ githubUser?.login }} • {{ repositories.length }} repositories
                </div>
              </div>
            </div>
            <q-btn
              flat
              icon="logout"
              label="Disconnect"
              @click="disconnectGitHub"
              class="spasta-text"
              size="sm"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Rest of template content -->

  </div>
</template>

<script setup lang="ts">
// Script content remains the same
</script>

<style scoped>
.backup-view {
  height: calc(100vh - 50px);
}

.backup-controls {
  gap: 16px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.repo-name {
  min-width: 200px;
}

.connection-status {
  border-left: 4px solid #21BA45;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .backup-view {
    padding: 12px;
  }
  
  .backup-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .repo-name {
    min-width: auto;
  }
}
</style>