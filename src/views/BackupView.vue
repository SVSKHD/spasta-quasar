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
                v-if="githubService.isConnected()"
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
                v-if="!githubService.isConnected()"
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
    <div v-if="githubService.isConnected()" class="connection-status q-mb-md">
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
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                icon="info"
                @click="showRateLimit"
                class="spasta-text"
                size="sm"
              >
                <q-tooltip>API Rate Limit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                icon="logout"
                label="Disconnect"
                @click="disconnectGitHub"
                class="spasta-text"
                size="sm"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Not Connected State -->
    <div v-if="!githubService.isConnected()" class="not-connected q-mb-md">
      <q-card class="spasta-card">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="github" size="xl" class="spasta-text opacity-30 q-mb-lg" />
          <div class="text-h6 spasta-text q-mb-md">Connect to GitHub</div>
          <div class="text-body2 spasta-text opacity-70 q-mb-lg">
            Connect your GitHub account to manage repository backups, view commit history, and download your code.
          </div>
          
          <div class="connection-benefits q-mb-lg">
            <div class="text-subtitle2 spasta-text q-mb-sm">What you can do:</div>
            <div class="row justify-center">
              <div class="col-auto">
                <q-list class="text-left">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="backup" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">Backup repositories</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="download" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">Download as ZIP</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="history" color="warning" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">View commit history</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="schedule" color="purple" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">Schedule automatic backups</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
          
          <q-btn
            color="positive"
            icon="link"
            label="Connect GitHub Account"
            @click="connectGitHub"
            size="lg"
            class="q-px-xl"
          />
          
          <div class="text-caption spasta-text opacity-50 q-mt-md">
            We only request the minimum permissions needed for backup functionality
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Repository Stats -->
    <div v-if="githubService.isConnected()" class="repo-stats q-mb-lg">
      <div class="row q-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="folder" size="lg" color="primary" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold spasta-text">{{ repositories.length }}</div>
              <div class="text-body2 spasta-text opacity-70">Total Repositories</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="backup" size="lg" color="positive" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-positive">{{ backedUpCount }}</div>
              <div class="text-body2 spasta-text opacity-70">Backed Up</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="schedule" size="lg" color="warning" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-warning">{{ pendingCount }}</div>
              <div class="text-body2 spasta-text opacity-70">Pending</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="block" size="lg" color="negative" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-negative">{{ excludedCount }}</div>
              <div class="text-body2 spasta-text opacity-70">Excluded</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Repository Management -->
    <div v-if="githubService.isConnected()" class="repo-management">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 spasta-text">Repository Management</div>
            <div class="row items-center q-gutter-sm">
              <q-input
                v-model="searchQuery"
                placeholder="Search repositories..."
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
                v-model="filterStatus"
                :options="statusFilterOptions"
                outlined
                dense
                label="Filter by status"
                class="spasta-input"
                color="white"
                label-color="white"
                dark
                clearable
              />
            </div>
          </div>

          <!-- Repository Table -->
          <SpastaTable
            :rows="filteredRepositories"
            :columns="repositoryColumns"
            :loading="loading"
            row-key="id"
            class="repo-table"
            @action="handleRepositoryAction"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettingsDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">Backup Settings</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-toggle
              v-model="settings.autoBackup"
              label="Enable automatic backups"
              color="positive"
              class="spasta-text"
            />

            <q-select
              v-if="settings.autoBackup"
              v-model="settings.backupFrequency"
              label="Backup frequency"
              outlined
              dense
              :options="[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' }
              ]"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-toggle
              v-model="settings.includePrivate"
              label="Include private repositories"
              color="warning"
              class="spasta-text"
            />

            <q-toggle
              v-model="settings.compressBackups"
              label="Compress backups"
              color="info"
              class="spasta-text"
            />

            <q-input
              v-model="settings.backupLocation"
              label="Backup location"
              outlined
              dense
              placeholder="/path/to/backups"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showSettingsDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Save Settings" 
            color="white" 
            text-color="grey-8"
            @click="saveSettings"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Backup Progress Dialog -->
    <q-dialog v-model="showBackupProgress" persistent>
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Creating Backup</div>
          <div class="text-body2 spasta-text opacity-70">{{ currentBackupRepo?.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="backup-progress-content">
            <q-linear-progress
              :value="backupProgress / 100"
              color="positive"
              track-color="grey-3"
              size="8px"
              rounded
              class="q-mb-md"
            />
            
            <div class="text-center">
              <div class="text-h6 spasta-text">{{ backupProgress }}%</div>
              <div class="text-body2 spasta-text opacity-70">{{ backupStatus }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { githubService, type GitHubRepository, type GitHubUser } from '../services/githubService'

const $q = useQuasar()
const repositories = ref<GitHubRepository[]>([])
const githubUser = ref<GitHubUser | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const showSettingsDialog = ref(false)
const showBackupProgress = ref(false)
const currentBackupRepo = ref<GitHubRepository | null>(null)
const backupProgress = ref(0)
const backupStatus = ref('')

const settings = ref({
  autoBackup: false,
  backupFrequency: 'weekly',
  includePrivate: true,
  compressBackups: true,
  backupLocation: '/backups'
})

const statusFilterOptions = [
  'All',
  'Backed Up',
  'Pending',
  'Excluded',
  'Failed'
]

const repositoryColumns = [
  {
    name: 'name',
    label: 'Repository',
    field: 'name',
    align: 'left',
    sortable: true,
    style: 'min-width: 200px'
  },
  {
    name: 'language',
    label: 'Language',
    field: 'language',
    align: 'center',
    type: 'chip',
    chipColors: {
      'JavaScript': 'warning',
      'TypeScript': 'info',
      'Python': 'positive',
      'Java': 'negative',
      'C++': 'purple',
      'Go': 'teal',
      'Rust': 'brown',
      'PHP': 'indigo'
    }
  },
  {
    name: 'visibility',
    label: 'Visibility',
    field: (row: GitHubRepository) => row.private ? 'Private' : 'Public',
    align: 'center',
    type: 'chip',
    chipColors: {
      'Private': 'negative',
      'Public': 'positive'
    }
  },
  {
    name: 'size',
    label: 'Size',
    field: (row: GitHubRepository) => formatSize(row.size * 1024),
    align: 'right'
  },
  {
    name: 'updated',
    label: 'Last Updated',
    field: 'updated_at',
    align: 'center',
    type: 'date',
    dateFormat: 'relative'
  },
  {
    name: 'status',
    label: 'Backup Status',
    field: (row: GitHubRepository) => getBackupStatus(row.id),
    align: 'center',
    type: 'chip',
    chipColors: {
      'Backed Up': 'positive',
      'Pending': 'warning',
      'Excluded': 'negative',
      'Failed': 'negative'
    }
  },
  {
    name: 'actions',
    label: 'Actions',
    field: '',
    align: 'center',
    type: 'actions',
    actions: [
      {
        name: 'backup',
        icon: 'backup',
        color: 'positive',
        tooltip: 'Create backup'
      },
      {
        name: 'download',
        icon: 'download',
        color: 'info',
        tooltip: 'Download ZIP'
      },
      {
        name: 'view',
        icon: 'open_in_new',
        color: 'primary',
        tooltip: 'View on GitHub'
      },
      {
        name: 'exclude',
        icon: 'block',
        color: 'negative',
        tooltip: 'Exclude from backups'
      }
    ]
  }
]

const filteredRepositories = computed(() => {
  let filtered = repositories.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(repo => 
      repo.name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query) ||
      repo.language?.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value && filterStatus.value !== 'All') {
    filtered = filtered.filter(repo => getBackupStatus(repo.id) === filterStatus.value)
  }

  return filtered
})

const backedUpCount = computed(() => {
  return repositories.value.filter(repo => getBackupStatus(repo.id) === 'Backed Up').length
})

const pendingCount = computed(() => {
  return repositories.value.filter(repo => getBackupStatus(repo.id) === 'Pending').length
})

const excludedCount = computed(() => {
  return repositories.value.filter(repo => getBackupStatus(repo.id) === 'Excluded').length
})

const connectGitHub = () => {
  try {
    githubService.initiateOAuth()
  } catch (error) {
    console.error('GitHub connection error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to connect to GitHub. Please try again.',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const disconnectGitHub = () => {
  $q.dialog({
    title: 'Disconnect GitHub',
    message: 'Are you sure you want to disconnect your GitHub account?',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(() => {
    githubService.logout()
    repositories.value = []
    githubUser.value = null
    
    $q.notify({
      type: 'info',
      message: 'GitHub account disconnected',
      position: 'top-right',
      timeout: 2000
    })
  })
}

const syncRepositories = async () => {
  if (!githubService.isConnected()) return

  loading.value = true
  try {
    repositories.value = await githubService.getRepositories({
      type: 'owner',
      sort: 'updated',
      per_page: 100
    })
    
    $q.notify({
      type: 'positive',
      message: `Synced ${repositories.value.length} repositories`,
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Sync error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to sync repositories',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleRepositoryAction = async (action: string, repository: GitHubRepository) => {
  switch (action) {
    case 'backup':
      await createBackup(repository)
      break
    case 'download':
      await downloadRepository(repository)
      break
    case 'view':
      window.open(repository.html_url, '_blank')
      break
    case 'exclude':
      excludeRepository(repository)
      break
  }
}

const createBackup = async (repository: GitHubRepository) => {
  currentBackupRepo.value = repository
  backupProgress.value = 0
  backupStatus.value = 'Initializing backup...'
  showBackupProgress.value = true

  try {
    // Simulate backup progress
    const progressSteps = [
      { progress: 20, status: 'Fetching repository data...' },
      { progress: 40, status: 'Downloading repository...' },
      { progress: 60, status: 'Compressing files...' },
      { progress: 80, status: 'Uploading backup...' },
      { progress: 100, status: 'Backup completed!' }
    ]

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      backupProgress.value = step.progress
      backupStatus.value = step.status
    }

    const result = await githubService.createBackup(repository)
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `Backup created for ${repository.name}`,
        position: 'top-right',
        timeout: 3000
      })
    } else {
      throw new Error(result.error || 'Backup failed')
    }
  } catch (error) {
    console.error('Backup error:', error)
    $q.notify({
      type: 'negative',
      message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    showBackupProgress.value = false
    currentBackupRepo.value = null
  }
}

const downloadRepository = async (repository: GitHubRepository) => {
  try {
    const [owner, repo] = repository.full_name.split('/')
    const blob = await githubService.downloadRepository(owner, repo, repository.default_branch)
    
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${repository.name}-${repository.default_branch}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      $q.notify({
        type: 'positive',
        message: `Downloaded ${repository.name}`,
        position: 'top-right',
        timeout: 2000
      })
    }
  } catch (error) {
    console.error('Download error:', error)
    $q.notify({
      type: 'negative',
      message: 'Download failed',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const excludeRepository = (repository: GitHubRepository) => {
  // Store exclusion in localStorage
  const excluded = JSON.parse(localStorage.getItem('excluded_repos') || '[]')
  if (!excluded.includes(repository.id)) {
    excluded.push(repository.id)
    localStorage.setItem('excluded_repos', JSON.stringify(excluded))
    
    $q.notify({
      type: 'info',
      message: `${repository.name} excluded from backups`,
      position: 'top-right',
      timeout: 2000
    })
  }
}

const getBackupStatus = (repoId: number): string => {
  const excluded = JSON.parse(localStorage.getItem('excluded_repos') || '[]')
  if (excluded.includes(repoId)) return 'Excluded'
  
  const backups = githubService.getBackupHistory()
  const hasBackup = backups.some((backup: any) => backup.repository.id === repoId)
  
  return hasBackup ? 'Backed Up' : 'Pending'
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const showRateLimit = async () => {
  try {
    const rateLimit = await githubService.getRateLimit()
    if (rateLimit) {
      $q.notify({
        type: 'info',
        message: `API Rate Limit: ${rateLimit.rate.remaining}/${rateLimit.rate.limit} remaining`,
        position: 'top-right',
        timeout: 3000
      })
    }
  } catch (error) {
    console.error('Rate limit error:', error)
  }
}

const saveSettings = () => {
  localStorage.setItem('backup_settings', JSON.stringify(settings.value))
  showSettingsDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: 'Settings saved',
    position: 'top-right',
    timeout: 2000
  })
}

const loadSettings = () => {
  const stored = localStorage.getItem('backup_settings')
  if (stored) {
    settings.value = { ...settings.value, ...JSON.parse(stored) }
  }
}

// Handle OAuth callback
const handleOAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  
  if (code && state) {
    loading.value = true
    try {
      const success = await githubService.handleOAuthCallback(code, state)
      if (success) {
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        
        githubUser.value = githubService.getUser()
        await syncRepositories()
        
        $q.notify({
          type: 'positive',
          message: 'Successfully connected to GitHub!',
          position: 'top-right',
          timeout: 3000
        })
      } else {
        throw new Error('OAuth callback failed')
      }
    } catch (error) {
      console.error('OAuth error:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to connect to GitHub',
        position: 'top-right',
        timeout: 3000
      })
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  loadSettings()
  
  // Check if user is already connected
  if (githubService.isConnected()) {
    githubUser.value = githubService.getUser()
    await syncRepositories()
  }
  
  // Handle OAuth callback
  await handleOAuthCallback()
})

// Watch for connection changes
watch(() => githubService.isConnected(), (connected) => {
  if (connected) {
    githubUser.value = githubService.getUser()
  } else {
    githubUser.value = null
    repositories.value = []
  }
})
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

.connection-status {
  border-left: 4px solid #21BA45;
}

.not-connected {
  border-left: 4px solid #F2C037;
}

.connection-benefits {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.backup-progress-content {
  text-align: center;
  padding: 20px 0;
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
}
</style>