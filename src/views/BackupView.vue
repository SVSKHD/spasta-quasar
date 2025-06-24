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

    <!-- Backup Stats -->
    <div v-if="githubConnected" class="backup-stats q-mb-lg">
      <div class="row q-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="folder_open" size="lg" color="primary" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold spasta-text">{{ repositories.length }}</div>
              <div class="text-body2 spasta-text opacity-70">Total Repos</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="backup" size="lg" color="positive" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-positive">{{ backedUpRepos.length }}</div>
              <div class="text-body2 spasta-text opacity-70">Backed Up</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="schedule" size="lg" color="warning" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-warning">{{ pendingBackups.length }}</div>
              <div class="text-body2 spasta-text opacity-70">Pending</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="block" size="lg" color="negative" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-negative">{{ excludedRepos.length }}</div>
              <div class="text-body2 spasta-text opacity-70">Excluded</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Repository List -->
    <div v-if="githubConnected" class="repository-list">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 spasta-text">Repositories</div>
            <div class="row items-center spacing-sm">
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
                :options="filterOptions"
                outlined
                dense
                label="Filter"
                class="spasta-input"
                color="white"
                label-color="white"
                dark
              />
            </div>
          </div>

          <SpastaTable
            :rows="filteredRepositories"
            :columns="repoColumns"
            :pagination="{ rowsPerPage: 10 }"
            :loading="loading"
            @action="handleRepoAction"
          >
            <template #cell-name="{ props }">
              <div class="repo-name">
                <div class="row items-center">
                  <q-icon 
                    :name="props.row.private ? 'lock' : 'public'" 
                    :color="props.row.private ? 'warning' : 'positive'"
                    size="sm" 
                    class="q-mr-sm" 
                  />
                  <div>
                    <div class="text-body1 spasta-text text-weight-medium">{{ props.row.name }}</div>
                    <div class="text-caption spasta-text opacity-70">{{ props.row.description || 'No description' }}</div>
                  </div>
                </div>
              </div>
            </template>

            <template #cell-language="{ props }">
              <q-chip
                v-if="props.row.language"
                :color="getLanguageColor(props.row.language)"
                text-color="white"
                size="sm"
                :label="props.row.language"
              />
              <span v-else class="spasta-text opacity-50">-</span>
            </template>

            <template #cell-status="{ props }">
              <q-chip
                :color="getStatusColor(props.row.backupStatus)"
                text-color="white"
                size="sm"
                :label="getStatusLabel(props.row.backupStatus)"
                :icon="getStatusIcon(props.row.backupStatus)"
              />
            </template>

            <template #cell-lastBackup="{ props }">
              <div v-if="props.row.lastBackup" class="text-body2 spasta-text">
                {{ formatDate(props.row.lastBackup) }}
              </div>
              <span v-else class="spasta-text opacity-50">Never</span>
            </template>

            <template #cell-size="{ props }">
              <div class="text-body2 spasta-text">{{ formatSize(props.row.size) }}</div>
            </template>
          </SpastaTable>
        </q-card-section>
      </q-card>
    </div>

    <!-- No GitHub Connection -->
    <div v-else class="no-connection">
      <q-card class="spasta-card">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="github" size="xl" class="spasta-text opacity-30 q-mb-lg" />
          <div class="text-h6 spasta-text q-mb-md">Connect to GitHub</div>
          <div class="text-body2 spasta-text opacity-70 q-mb-lg">
            Connect your GitHub account to manage repository backups and sync your code
          </div>
          <q-btn
            color="white"
            text-color="grey-8"
            icon="link"
            label="Connect GitHub Account"
            @click="connectGitHub"
            class="q-px-lg"
            size="lg"
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
          <div class="q-gutter-md">
            <q-toggle
              v-model="settings.autoBackup"
              label="Automatic Backup"
              color="positive"
              class="spasta-text"
            />
            
            <q-select
              v-model="settings.backupFrequency"
              label="Backup Frequency"
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

            <q-input
              v-model="settings.backupLocation"
              label="Backup Location"
              outlined
              dense
              class="spasta-input"
              color="white"
              label-color="white"
              dark
              placeholder="e.g., /backups/github"
            />

            <q-toggle
              v-model="settings.includePrivate"
              label="Include Private Repositories"
              color="warning"
              class="spasta-text"
            />

            <q-toggle
              v-model="settings.compressBackups"
              label="Compress Backups"
              color="info"
              class="spasta-text"
            />
          </div>
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
          <div class="text-h6 spasta-text">Backing Up Repository</div>
          <div class="text-body2 spasta-text opacity-70">{{ currentBackupRepo?.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-linear-progress
            :value="backupProgress"
            color="positive"
            track-color="grey-3"
            size="12px"
            rounded
            class="q-mb-md"
          />
          <div class="text-center">
            <div class="text-body2 spasta-text">{{ Math.round(backupProgress * 100) }}% Complete</div>
            <div class="text-caption spasta-text opacity-70">{{ backupStatusMessage }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

interface GitHubUser {
  login: string
  avatar_url: string
  name: string
  email: string
}

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  language: string
  size: number
  updated_at: string
  clone_url: string
  backupStatus: 'backed-up' | 'pending' | 'excluded' | 'failed'
  lastBackup?: string
  backupSize?: number
}

const $q = useQuasar()
const loading = ref(false)
const githubConnected = ref(false)
const githubUser = ref<GitHubUser | null>(null)
const repositories = ref<Repository[]>([])
const searchQuery = ref('')
const filterStatus = ref('all')
const showSettingsDialog = ref(false)
const showBackupProgress = ref(false)
const currentBackupRepo = ref<Repository | null>(null)
const backupProgress = ref(0)
const backupStatusMessage = ref('')

const settings = ref({
  autoBackup: true,
  backupFrequency: 'weekly',
  backupLocation: '/backups/github',
  includePrivate: true,
  compressBackups: true
})

const filterOptions = [
  { label: 'All Repositories', value: 'all' },
  { label: 'Backed Up', value: 'backed-up' },
  { label: 'Pending Backup', value: 'pending' },
  { label: 'Excluded', value: 'excluded' },
  { label: 'Failed', value: 'failed' }
]

const repoColumns = [
  {
    name: 'name',
    label: 'Repository',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'language',
    label: 'Language',
    field: 'language',
    align: 'center',
    sortable: true
  },
  {
    name: 'status',
    label: 'Backup Status',
    field: 'backupStatus',
    align: 'center',
    sortable: true
  },
  {
    name: 'lastBackup',
    label: 'Last Backup',
    field: 'lastBackup',
    align: 'center',
    sortable: true
  },
  {
    name: 'size',
    label: 'Size',
    field: 'size',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    type: 'actions',
    actions: [
      {
        name: 'backup',
        icon: 'backup',
        color: 'positive',
        tooltip: 'Backup Repository',
        condition: (row: Repository) => row.backupStatus !== 'backed-up'
      },
      {
        name: 'exclude',
        icon: 'block',
        color: 'negative',
        tooltip: 'Exclude from Backup',
        condition: (row: Repository) => row.backupStatus !== 'excluded'
      },
      {
        name: 'include',
        icon: 'add_circle',
        color: 'positive',
        tooltip: 'Include in Backup',
        condition: (row: Repository) => row.backupStatus === 'excluded'
      },
      {
        name: 'view',
        icon: 'open_in_new',
        color: 'primary',
        tooltip: 'View on GitHub'
      }
    ]
  }
]

const filteredRepositories = computed(() => {
  let filtered = repositories.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(repo => 
      repo.name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query) ||
      repo.language?.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(repo => repo.backupStatus === filterStatus.value)
  }

  return filtered
})

const backedUpRepos = computed(() => {
  return repositories.value.filter(repo => repo.backupStatus === 'backed-up')
})

const pendingBackups = computed(() => {
  return repositories.value.filter(repo => repo.backupStatus === 'pending')
})

const excludedRepos = computed(() => {
  return repositories.value.filter(repo => repo.backupStatus === 'excluded')
})

const connectGitHub = () => {
  // Simulate GitHub OAuth connection
  $q.notify({
    type: 'info',
    message: 'GitHub OAuth integration would be implemented here',
    position: 'top-right',
    timeout: 3000
  })
  
  // For demo purposes, simulate connection
  setTimeout(() => {
    githubConnected.value = true
    githubUser.value = {
      login: 'demo-user',
      avatar_url: 'https://github.com/github.png',
      name: 'Demo User',
      email: 'demo@example.com'
    }
    loadDemoRepositories()
    
    $q.notify({
      type: 'positive',
      message: 'Connected to GitHub successfully',
      position: 'top-right',
      timeout: 2000
    })
  }, 1500)
}

const disconnectGitHub = () => {
  githubConnected.value = false
  githubUser.value = null
  repositories.value = []
  
  $q.notify({
    type: 'info',
    message: 'Disconnected from GitHub',
    position: 'top-right',
    timeout: 2000
  })
}

const loadDemoRepositories = () => {
  repositories.value = [
    {
      id: 1,
      name: 'spasta-app',
      full_name: 'demo-user/spasta-app',
      description: 'Task management dashboard with Vue.js and Quasar',
      private: false,
      language: 'TypeScript',
      size: 2048,
      updated_at: new Date().toISOString(),
      clone_url: 'https://github.com/demo-user/spasta-app.git',
      backupStatus: 'backed-up',
      lastBackup: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      name: 'portfolio-website',
      full_name: 'demo-user/portfolio-website',
      description: 'Personal portfolio website built with React',
      private: false,
      language: 'JavaScript',
      size: 1024,
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      clone_url: 'https://github.com/demo-user/portfolio-website.git',
      backupStatus: 'pending'
    },
    {
      id: 3,
      name: 'api-server',
      full_name: 'demo-user/api-server',
      description: 'RESTful API server with Node.js and Express',
      private: true,
      language: 'JavaScript',
      size: 512,
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      clone_url: 'https://github.com/demo-user/api-server.git',
      backupStatus: 'backed-up',
      lastBackup: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 4,
      name: 'mobile-app',
      full_name: 'demo-user/mobile-app',
      description: 'Cross-platform mobile app with React Native',
      private: false,
      language: 'TypeScript',
      size: 3072,
      updated_at: new Date(Date.now() - 345600000).toISOString(),
      clone_url: 'https://github.com/demo-user/mobile-app.git',
      backupStatus: 'excluded'
    },
    {
      id: 5,
      name: 'data-analysis',
      full_name: 'demo-user/data-analysis',
      description: 'Data analysis scripts and notebooks',
      private: true,
      language: 'Python',
      size: 256,
      updated_at: new Date(Date.now() - 432000000).toISOString(),
      clone_url: 'https://github.com/demo-user/data-analysis.git',
      backupStatus: 'failed'
    }
  ]
}

const syncRepositories = async () => {
  if (!githubConnected.value) return
  
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    loadDemoRepositories()
    loading.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Repositories synced successfully',
      position: 'top-right',
      timeout: 2000
    })
  }, 1500)
}

const handleRepoAction = (actionName: string, repo: Repository) => {
  switch (actionName) {
    case 'backup':
      backupRepository(repo)
      break
    case 'exclude':
      excludeRepository(repo)
      break
    case 'include':
      includeRepository(repo)
      break
    case 'view':
      window.open(`https://github.com/${repo.full_name}`, '_blank')
      break
  }
}

const backupRepository = async (repo: Repository) => {
  currentBackupRepo.value = repo
  showBackupProgress.value = true
  backupProgress.value = 0
  backupStatusMessage.value = 'Initializing backup...'
  
  // Simulate backup process
  const steps = [
    'Cloning repository...',
    'Compressing files...',
    'Uploading to backup location...',
    'Verifying backup integrity...',
    'Backup completed!'
  ]
  
  for (let i = 0; i < steps.length; i++) {
    backupStatusMessage.value = steps[i]
    backupProgress.value = (i + 1) / steps.length
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Update repository status
  repo.backupStatus = 'backed-up'
  repo.lastBackup = new Date().toISOString()
  
  showBackupProgress.value = false
  
  $q.notify({
    type: 'positive',
    message: `Repository "${repo.name}" backed up successfully`,
    position: 'top-right',
    timeout: 2000
  })
}

const excludeRepository = (repo: Repository) => {
  repo.backupStatus = 'excluded'
  
  $q.notify({
    type: 'info',
    message: `Repository "${repo.name}" excluded from backups`,
    position: 'top-right',
    timeout: 2000
  })
}

const includeRepository = (repo: Repository) => {
  repo.backupStatus = 'pending'
  
  $q.notify({
    type: 'positive',
    message: `Repository "${repo.name}" included in backups`,
    position: 'top-right',
    timeout: 2000
  })
}

const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    'TypeScript': 'primary',
    'JavaScript': 'warning',
    'Python': 'positive',
    'Java': 'negative',
    'C++': 'purple',
    'Go': 'teal',
    'Rust': 'brown',
    'PHP': 'indigo'
  }
  return colors[language] || 'grey'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'backed-up': return 'positive'
    case 'pending': return 'warning'
    case 'excluded': return 'negative'
    case 'failed': return 'red'
    default: return 'grey'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'backed-up': return 'Backed Up'
    case 'pending': return 'Pending'
    case 'excluded': return 'Excluded'
    case 'failed': return 'Failed'
    default: return 'Unknown'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'backed-up': return 'check_circle'
    case 'pending': return 'schedule'
    case 'excluded': return 'block'
    case 'failed': return 'error'
    default: return 'help'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const formatSize = (sizeInKB: number) => {
  if (sizeInKB < 1024) return `${sizeInKB} KB`
  if (sizeInKB < 1024 * 1024) return `${(sizeInKB / 1024).toFixed(1)} MB`
  return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`
}

const saveSettings = () => {
  // Save settings to localStorage or backend
  localStorage.setItem('backup_settings', JSON.stringify(settings.value))
  showSettingsDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: 'Settings saved successfully',
    position: 'top-right',
    timeout: 2000
  })
}

onMounted(() => {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem('backup_settings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
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