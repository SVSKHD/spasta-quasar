<template>
  <div class="monitor-view q-pa-md">
    <!-- Monitor Header -->
    <div class="monitor-header q-mb-md">
      <q-card class="spasta-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between">
            <div class="monitor-title">
              <div class="text-h5 spasta-text">
                <q-icon name="monitor" class="q-mr-sm icon-lg" />
                Project Monitor
              </div>
              <div class="text-body2 spasta-text opacity-70">
                Real-time monitoring of project status and API health
              </div>
            </div>
            
            <div class="monitor-controls row items-center spacing-md">
              <q-btn
                flat
                icon="refresh"
                label="Refresh All"
                @click="refreshAllProjects"
                class="spasta-text"
                :loading="refreshing"
              />
              <q-btn
                flat
                icon="add"
                label="Add Project"
                @click="showAddProjectDialog = true"
                class="spasta-text"
              />
              <q-btn
                flat
                icon="settings"
                label="Settings"
                @click="showSettingsDialog = true"
                class="spasta-text"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- System Overview Stats -->
    <div class="system-stats q-mb-lg">
      <div class="row q-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="folder_open" size="lg" color="primary" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold spasta-text">{{ projects.length }}</div>
              <div class="text-body2 spasta-text opacity-70">Total Projects</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="lg" color="positive" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-positive">{{ healthyProjects }}</div>
              <div class="text-body2 spasta-text opacity-70">Healthy</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="warning" size="lg" color="warning" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-warning">{{ warningProjects }}</div>
              <div class="text-body2 spasta-text opacity-70">Warning</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="spasta-card stat-card">
            <q-card-section class="text-center">
              <q-icon name="error" size="lg" color="negative" class="q-mb-sm" />
              <div class="text-h4 text-weight-bold text-negative">{{ errorProjects }}</div>
              <div class="text-body2 spasta-text opacity-70">Error</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="projects-grid">
      <div class="row q-gutter-md">
        <div v-for="project in projects" :key="project.id" class="col-12 col-md-6 col-lg-4">
          <q-card class="spasta-card project-card" :class="getProjectCardClass(project.status)">
            <q-card-section class="q-pa-lg">
              <!-- Project Header -->
              <div class="row items-start justify-between q-mb-md">
                <div class="project-info">
                  <div class="row items-center q-mb-xs">
                    <q-icon :name="project.icon" :color="getStatusColor(project.status)" size="md" class="q-mr-sm" />
                    <div class="text-h6 text-weight-medium spasta-text project-name">{{ project.name }}</div>
                  </div>
                  <div class="text-body2 spasta-text opacity-80 project-description">{{ project.description }}</div>
                </div>
                <q-btn-dropdown
                  flat
                  round
                  dense
                  icon="more_vert"
                  size="sm"
                  class="spasta-text project-menu-btn"
                  dropdown-icon=""
                >
                  <q-list class="spasta-card">
                    <q-item clickable v-close-popup @click="viewProjectDetails(project)" class="spasta-text">
                      <q-item-section avatar>
                        <q-icon name="visibility" />
                      </q-item-section>
                      <q-item-section>View Details</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="editProject(project)" class="spasta-text">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit Project</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="viewLogs(project)" class="spasta-text">
                      <q-item-section avatar>
                        <q-icon name="article" />
                      </q-item-section>
                      <q-item-section>View Logs</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="viewMetrics(project)" class="spasta-text">
                      <q-item-section avatar>
                        <q-icon name="analytics" />
                      </q-item-section>
                      <q-item-section>View Metrics</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="deleteProject(project.id)" class="text-negative">
                      <q-item-section avatar>
                        <q-icon name="delete" />
                      </q-item-section>
                      <q-item-section>Delete Project</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <!-- Status Badge -->
              <div class="project-status q-mb-md">
                <q-chip
                  :color="getStatusColor(project.status)"
                  text-color="white"
                  size="sm"
                  :icon="getStatusIcon(project.status)"
                  :label="project.status.toUpperCase()"
                  class="status-chip"
                />
                <q-chip
                  outline
                  color="white"
                  text-color="grey-8"
                  size="sm"
                  :label="project.environment"
                  class="q-ml-sm environment-chip"
                />
              </div>

              <!-- Build & Deploy Status -->
              <div class="build-deploy-status q-mb-md">
                <div class="row q-gutter-sm">
                  <div class="col">
                    <div class="build-status">
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="text-caption spasta-text text-weight-medium">Build</div>
                        <q-icon 
                          :name="getBuildStatusIcon(project.buildStatus)" 
                          :color="getBuildStatusColor(project.buildStatus)" 
                          size="sm" 
                        />
                      </div>
                      <div class="text-caption spasta-text opacity-70 build-info">
                        {{ project.buildInfo }}
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="deploy-status">
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="text-caption spasta-text text-weight-medium">Deploy</div>
                        <q-icon 
                          :name="getDeployStatusIcon(project.deployStatus)" 
                          :color="getDeployStatusColor(project.deployStatus)" 
                          size="sm" 
                        />
                      </div>
                      <div class="text-caption spasta-text opacity-70 deploy-info">
                        {{ project.deployInfo }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- API Endpoints -->
              <div class="api-endpoints q-mb-md">
                <div class="text-body2 spasta-text q-mb-sm">API Endpoints</div>
                <div v-for="endpoint in project.endpoints" :key="endpoint.id" class="endpoint-item q-mb-xs">
                  <div class="row items-center justify-between">
                    <div class="endpoint-info">
                      <div class="text-caption spasta-text text-weight-medium endpoint-name">{{ endpoint.name }}</div>
                      <div class="text-caption spasta-text opacity-70 endpoint-path">{{ endpoint.method }} {{ endpoint.path }}</div>
                    </div>
                    <div class="endpoint-status">
                      <q-icon
                        :name="getEndpointStatusIcon(endpoint.status)"
                        :color="getStatusColor(endpoint.status)"
                        size="sm"
                      />
                      <span class="text-caption spasta-text q-ml-xs response-time">{{ endpoint.responseTime }}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Metrics -->
              <div class="project-metrics q-mb-md">
                <div class="row q-gutter-sm">
                  <div class="col">
                    <div class="metric-item text-center">
                      <div class="text-h6 spasta-text metric-value">{{ project.metrics.uptime }}%</div>
                      <div class="text-caption spasta-text opacity-70 metric-label">Uptime</div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="metric-item text-center">
                      <div class="text-h6 spasta-text metric-value">{{ project.metrics.avgResponseTime }}ms</div>
                      <div class="text-caption spasta-text opacity-70 metric-label">Avg Response</div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="metric-item text-center">
                      <div class="text-h6 spasta-text metric-value">{{ project.metrics.errorRate }}%</div>
                      <div class="text-caption spasta-text opacity-70 metric-label">Error Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Last Updated -->
              <div class="project-footer">
                <div class="text-caption spasta-text opacity-60 last-checked">
                  Last checked: {{ formatLastChecked(project.lastChecked) }}
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="q-pa-lg q-pt-none">
              <div class="row full-width q-gutter-sm">
                <!-- Build & Deploy Actions -->
                <div class="col-12 q-mb-sm">
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      icon="build"
                      label="Build"
                      @click="buildProject(project)"
                      class="spasta-text col"
                      size="sm"
                      :loading="project.building"
                      :disable="project.building || project.deploying"
                    />
                    <q-btn
                      flat
                      icon="rocket_launch"
                      label="Deploy"
                      @click="deployProject(project)"
                      class="spasta-text col"
                      size="sm"
                      :loading="project.deploying"
                      :disable="project.building || project.deploying || project.buildStatus === 'failed'"
                    />
                  </div>
                </div>
                
                <!-- Other Actions -->
                <div class="col-12">
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      icon="visibility"
                      label="Details"
                      @click="viewProjectDetails(project)"
                      class="spasta-text col"
                      size="sm"
                    />
                    <q-btn
                      flat
                      icon="refresh"
                      label="Check"
                      @click="checkProject(project)"
                      class="spasta-text col"
                      size="sm"
                      :loading="project.checking"
                    />
                    <q-btn
                      flat
                      round
                      icon="open_in_new"
                      @click="openProject(project)"
                      class="spasta-text"
                      size="sm"
                    >
                      <q-tooltip>Open project</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-card-actions>
          </q-card>
        </div>

        <!-- Add Project Card -->
        <div class="col-12 col-md-6 col-lg-4">
          <q-card 
            class="spasta-card add-project-card cursor-pointer"
            @click="showAddProjectDialog = true"
          >
            <q-card-section class="text-center q-pa-xl">
              <q-icon name="add" size="xl" color="primary" class="q-mb-lg" />
              <div class="text-h6 text-weight-medium text-primary q-mb-sm">
                Add New Project
              </div>
              <div class="text-body2 spasta-text">
                Monitor a new project and its APIs
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Add Project Dialog -->
    <q-dialog v-model="showAddProjectDialog">
      <q-card class="spasta-card" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add New Project</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="addProject" class="q-gutter-md">
            <q-input
              v-model="projectForm.name"
              label="Project Name"
              outlined
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model="projectForm.description"
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
                  v-model="projectForm.url"
                  label="Base URL"
                  outlined
                  required
                  placeholder="https://api.example.com"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-select
                  v-model="projectForm.environment"
                  label="Environment"
                  outlined
                  :options="['Development', 'Staging', 'Production']"
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
                  v-model="projectForm.icon"
                  label="Icon"
                  outlined
                  :options="iconOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="projectForm.checkInterval"
                  label="Check Interval (minutes)"
                  outlined
                  type="number"
                  min="1"
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <!-- Build & Deploy Configuration -->
            <div class="build-deploy-config">
              <div class="text-subtitle2 spasta-text q-mb-sm">Build & Deploy Configuration</div>
              
              <div class="row q-gutter-md">
                <div class="col">
                  <q-input
                    v-model="projectForm.buildCommand"
                    label="Build Command"
                    outlined
                    placeholder="npm run build"
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="projectForm.deployCommand"
                    label="Deploy Command"
                    outlined
                    placeholder="npm run deploy"
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
              </div>

              <div class="row q-gutter-md">
                <div class="col">
                  <q-input
                    v-model="projectForm.buildPath"
                    label="Build Output Path"
                    outlined
                    placeholder="./dist"
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="projectForm.deployUrl"
                    label="Deploy URL"
                    outlined
                    placeholder="https://deploy.example.com"
                    class="spasta-input"
                    color="white"
                    label-color="white"
                    dark
                  />
                </div>
              </div>
            </div>

            <!-- API Endpoints -->
            <div class="endpoints-section">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 spasta-text">API Endpoints</div>
                <q-btn
                  flat
                  icon="add"
                  label="Add Endpoint"
                  size="sm"
                  @click="addEndpoint"
                  class="spasta-text"
                />
              </div>

              <div v-for="(endpoint, index) in projectForm.endpoints" :key="index" class="endpoint-form q-mb-md">
                <q-card flat bordered class="spasta-card-light">
                  <q-card-section class="q-py-sm q-px-md">
                    <div class="row q-gutter-sm items-end">
                      <div class="col-3">
                        <q-input
                          v-model="endpoint.name"
                          label="Name"
                          outlined
                          dense
                          class="spasta-input"
                          color="white"
                          label-color="white"
                          dark
                        />
                      </div>
                      <div class="col-2">
                        <q-select
                          v-model="endpoint.method"
                          label="Method"
                          outlined
                          dense
                          :options="['GET', 'POST', 'PUT', 'DELETE', 'PATCH']"
                          class="spasta-input"
                          color="white"
                          label-color="white"
                          dark
                        />
                      </div>
                      <div class="col-5">
                        <q-input
                          v-model="endpoint.path"
                          label="Path"
                          outlined
                          dense
                          placeholder="/api/health"
                          class="spasta-input"
                          color="white"
                          label-color="white"
                          dark
                        />
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          size="sm"
                          @click="removeEndpoint(index)"
                          class="text-negative"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeAddProjectDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Add Project" 
            color="white" 
            text-color="grey-8"
            @click="addProject"
            :disable="!projectForm.name || !projectForm.url"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettingsDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Monitor Settings</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input
              v-model.number="settings.defaultCheckInterval"
              label="Default Check Interval (minutes)"
              outlined
              type="number"
              min="1"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model.number="settings.timeout"
              label="Request Timeout (seconds)"
              outlined
              type="number"
              min="1"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-toggle
              v-model="settings.notifications"
              label="Enable notifications"
              color="positive"
              class="spasta-text"
            />

            <q-toggle
              v-model="settings.autoRefresh"
              label="Auto refresh dashboard"
              color="positive"
              class="spasta-text"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

interface Endpoint {
  id: string
  name: string
  method: string
  path: string
  status: 'healthy' | 'warning' | 'error'
  responseTime: number
  lastChecked: string
}

interface Project {
  id: string
  name: string
  description: string
  url: string
  environment: string
  icon: string
  status: 'healthy' | 'warning' | 'error'
  buildStatus: 'success' | 'failed' | 'building' | 'pending'
  deployStatus: 'deployed' | 'failed' | 'deploying' | 'pending'
  buildInfo: string
  deployInfo: string
  buildCommand?: string
  deployCommand?: string
  buildPath?: string
  deployUrl?: string
  endpoints: Endpoint[]
  metrics: {
    uptime: number
    avgResponseTime: number
    errorRate: number
  }
  checkInterval: number
  lastChecked: string
  checking?: boolean
  building?: boolean
  deploying?: boolean
}

const $q = useQuasar()
const projects = ref<Project[]>([])
const refreshing = ref(false)
const showAddProjectDialog = ref(false)
const showSettingsDialog = ref(false)
let autoRefreshInterval: NodeJS.Timeout | null = null

const projectForm = ref({
  name: '',
  description: '',
  url: '',
  environment: 'Development',
  icon: 'web',
  checkInterval: 5,
  buildCommand: 'npm run build',
  deployCommand: 'npm run deploy',
  buildPath: './dist',
  deployUrl: '',
  endpoints: [
    { name: 'Health Check', method: 'GET', path: '/health' }
  ]
})

const settings = ref({
  defaultCheckInterval: 5,
  timeout: 30,
  notifications: true,
  autoRefresh: true
})

const iconOptions = [
  { label: 'Web', value: 'web' },
  { label: 'API', value: 'api' },
  { label: 'Database', value: 'storage' },
  { label: 'Mobile', value: 'phone_android' },
  { label: 'Desktop', value: 'desktop_windows' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Server', value: 'dns' },
  { label: 'Microservice', value: 'hub' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'AI/ML', value: 'psychology' }
]

const healthyProjects = computed(() => {
  return projects.value.filter(p => p.status === 'healthy').length
})

const warningProjects = computed(() => {
  return projects.value.filter(p => p.status === 'warning').length
})

const errorProjects = computed(() => {
  return projects.value.filter(p => p.status === 'error').length
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'positive'
    case 'warning': return 'warning'
    case 'error': return 'negative'
    default: return 'grey'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return 'check_circle'
    case 'warning': return 'warning'
    case 'error': return 'error'
    default: return 'help'
  }
}

const getEndpointStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return 'check'
    case 'warning': return 'warning'
    case 'error': return 'close'
    default: return 'help'
  }
}

const getBuildStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return 'check_circle'
    case 'failed': return 'error'
    case 'building': return 'hourglass_empty'
    case 'pending': return 'schedule'
    default: return 'help'
  }
}

const getBuildStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'positive'
    case 'failed': return 'negative'
    case 'building': return 'warning'
    case 'pending': return 'grey'
    default: return 'grey'
  }
}

const getDeployStatusIcon = (status: string) => {
  switch (status) {
    case 'deployed': return 'rocket_launch'
    case 'failed': return 'error'
    case 'deploying': return 'upload'
    case 'pending': return 'schedule'
    default: return 'help'
  }
}

const getDeployStatusColor = (status: string) => {
  switch (status) {
    case 'deployed': return 'positive'
    case 'failed': return 'negative'
    case 'deploying': return 'info'
    case 'pending': return 'grey'
    default: return 'grey'
  }
}

const getProjectCardClass = (status: string) => {
  return {
    'project-healthy': status === 'healthy',
    'project-warning': status === 'warning',
    'project-error': status === 'error'
  }
}

const formatLastChecked = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}

const loadDemoData = () => {
  projects.value = [
    {
      id: '1',
      name: 'Spasta API',
      description: 'Main application API server',
      url: 'https://api.spasta.com',
      environment: 'Production',
      icon: 'api',
      status: 'healthy',
      buildStatus: 'success',
      deployStatus: 'deployed',
      buildInfo: 'Build #142 - 2m ago',
      deployInfo: 'v1.2.3 - 5m ago',
      buildCommand: 'npm run build',
      deployCommand: 'npm run deploy:prod',
      buildPath: './dist',
      deployUrl: 'https://spasta.com',
      endpoints: [
        {
          id: '1',
          name: 'Health Check',
          method: 'GET',
          path: '/health',
          status: 'healthy',
          responseTime: 45,
          lastChecked: new Date().toISOString()
        },
        {
          id: '2',
          name: 'User Auth',
          method: 'POST',
          path: '/auth/login',
          status: 'healthy',
          responseTime: 120,
          lastChecked: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Tasks API',
          method: 'GET',
          path: '/api/tasks',
          status: 'healthy',
          responseTime: 89,
          lastChecked: new Date().toISOString()
        }
      ],
      metrics: {
        uptime: 99.9,
        avgResponseTime: 85,
        errorRate: 0.1
      },
      checkInterval: 5,
      lastChecked: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Analytics Service',
      description: 'Data analytics and reporting service',
      url: 'https://analytics.spasta.com',
      environment: 'Production',
      icon: 'analytics',
      status: 'warning',
      buildStatus: 'success',
      deployStatus: 'deployed',
      buildInfo: 'Build #89 - 1h ago',
      deployInfo: 'v2.1.0 - 1h ago',
      buildCommand: 'npm run build:analytics',
      deployCommand: 'npm run deploy:analytics',
      buildPath: './build',
      deployUrl: 'https://analytics.spasta.com',
      endpoints: [
        {
          id: '4',
          name: 'Metrics',
          method: 'GET',
          path: '/metrics',
          status: 'warning',
          responseTime: 1200,
          lastChecked: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Reports',
          method: 'GET',
          path: '/reports',
          status: 'healthy',
          responseTime: 340,
          lastChecked: new Date().toISOString()
        }
      ],
      metrics: {
        uptime: 98.5,
        avgResponseTime: 770,
        errorRate: 1.2
      },
      checkInterval: 10,
      lastChecked: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '3',
      name: 'File Storage',
      description: 'Document and media storage service',
      url: 'https://storage.spasta.com',
      environment: 'Production',
      icon: 'storage',
      status: 'error',
      buildStatus: 'failed',
      deployStatus: 'failed',
      buildInfo: 'Build #67 failed - 30m ago',
      deployInfo: 'Deploy failed - 30m ago',
      buildCommand: 'npm run build:storage',
      deployCommand: 'npm run deploy:storage',
      buildPath: './dist',
      deployUrl: 'https://storage.spasta.com',
      endpoints: [
        {
          id: '6',
          name: 'Upload',
          method: 'POST',
          path: '/upload',
          status: 'error',
          responseTime: 0,
          lastChecked: new Date().toISOString()
        },
        {
          id: '7',
          name: 'Download',
          method: 'GET',
          path: '/download',
          status: 'error',
          responseTime: 0,
          lastChecked: new Date().toISOString()
        }
      ],
      metrics: {
        uptime: 85.2,
        avgResponseTime: 0,
        errorRate: 15.8
      },
      checkInterval: 2,
      lastChecked: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: '4',
      name: 'Development API',
      description: 'Development environment API',
      url: 'https://dev-api.spasta.com',
      environment: 'Development',
      icon: 'web',
      status: 'healthy',
      buildStatus: 'pending',
      deployStatus: 'pending',
      buildInfo: 'No recent builds',
      deployInfo: 'Not deployed',
      buildCommand: 'npm run build:dev',
      deployCommand: 'npm run deploy:dev',
      buildPath: './dist',
      deployUrl: 'https://dev.spasta.com',
      endpoints: [
        {
          id: '8',
          name: 'Health',
          method: 'GET',
          path: '/health',
          status: 'healthy',
          responseTime: 25,
          lastChecked: new Date().toISOString()
        }
      ],
      metrics: {
        uptime: 95.0,
        avgResponseTime: 25,
        errorRate: 2.1
      },
      checkInterval: 15,
      lastChecked: new Date(Date.now() - 60000).toISOString()
    }
  ]
}

const refreshAllProjects = async () => {
  refreshing.value = true
  
  try {
    // Simulate API calls to check all projects
    for (const project of projects.value) {
      await checkProject(project, false)
    }
    
    $q.notify({
      type: 'positive',
      message: 'All projects refreshed',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error refreshing projects:', error)
    $q.notify({
      type: 'negative',
      message: 'Error refreshing projects',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    refreshing.value = false
  }
}

const checkProject = async (project: Project, showNotification = true) => {
  project.checking = true
  
  try {
    // Simulate API health checks
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simulate random status updates
    const weights = [0.7, 0.2, 0.1] // 70% healthy, 20% warning, 10% error
    
    let randomValue = Math.random()
    let newStatus = 'healthy'
    
    if (randomValue < weights[2]) {
      newStatus = 'error'
    } else if (randomValue < weights[1] + weights[2]) {
      newStatus = 'warning'
    }
    
    project.status = newStatus as 'healthy' | 'warning' | 'error'
    project.lastChecked = new Date().toISOString()
    
    // Update endpoint statuses
    project.endpoints.forEach(endpoint => {
      endpoint.status = newStatus as 'healthy' | 'warning' | 'error'
      endpoint.responseTime = newStatus === 'error' ? 0 : Math.floor(Math.random() * 500) + 50
      endpoint.lastChecked = new Date().toISOString()
    })
    
    // Update metrics
    project.metrics = {
      uptime: newStatus === 'error' ? Math.random() * 50 + 50 : Math.random() * 10 + 90,
      avgResponseTime: newStatus === 'error' ? 0 : Math.floor(Math.random() * 300) + 100,
      errorRate: newStatus === 'error' ? Math.random() * 20 + 5 : Math.random() * 2
    }
    
    if (showNotification) {
      $q.notify({
        type: newStatus === 'healthy' ? 'positive' : newStatus === 'warning' ? 'warning' : 'negative',
        message: `${project.name} status: ${newStatus.toUpperCase()}`,
        position: 'top-right',
        timeout: 2000
      })
    }
  } catch (error) {
    console.error('Error checking project:', error)
  } finally {
    project.checking = false
  }
}

const buildProject = async (project: Project) => {
  project.building = true
  project.buildStatus = 'building'
  project.buildInfo = 'Building...'
  
  try {
    // Simulate build process
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000))
    
    // Simulate build result (90% success rate)
    const success = Math.random() > 0.1
    
    if (success) {
      project.buildStatus = 'success'
      project.buildInfo = `Build #${Math.floor(Math.random() * 100) + 100} - Just now`
      
      $q.notify({
        type: 'positive',
        message: `${project.name} build completed successfully`,
        position: 'top-right',
        timeout: 3000
      })
    } else {
      project.buildStatus = 'failed'
      project.buildInfo = 'Build failed - Just now'
      
      $q.notify({
        type: 'negative',
        message: `${project.name} build failed`,
        position: 'top-right',
        timeout: 3000
      })
    }
  } catch (error) {
    console.error('Error building project:', error)
    project.buildStatus = 'failed'
    project.buildInfo = 'Build error - Just now'
  } finally {
    project.building = false
  }
}

const deployProject = async (project: Project) => {
  if (project.buildStatus !== 'success') {
    $q.notify({
      type: 'warning',
      message: 'Build must be successful before deploying',
      position: 'top-right',
      timeout: 3000
    })
    return
  }
  
  project.deploying = true
  project.deployStatus = 'deploying'
  project.deployInfo = 'Deploying...'
  
  try {
    // Simulate deploy process
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 4000))
    
    // Simulate deploy result (85% success rate)
    const success = Math.random() > 0.15
    
    if (success) {
      project.deployStatus = 'deployed'
      const version = `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
      project.deployInfo = `${version} - Just now`
      
      $q.notify({
        type: 'positive',
        message: `${project.name} deployed successfully`,
        position: 'top-right',
        timeout: 3000
      })
    } else {
      project.deployStatus = 'failed'
      project.deployInfo = 'Deploy failed - Just now'
      
      $q.notify({
        type: 'negative',
        message: `${project.name} deployment failed`,
        position: 'top-right',
        timeout: 3000
      })
    }
  } catch (error) {
    console.error('Error deploying project:', error)
    project.deployStatus = 'failed'
    project.deployInfo = 'Deploy error - Just now'
  } finally {
    project.deploying = false
  }
}

const addEndpoint = () => {
  projectForm.value.endpoints.push({
    name: '',
    method: 'GET',
    path: ''
  })
}

const removeEndpoint = (index: number) => {
  projectForm.value.endpoints.splice(index, 1)
}

const addProject = () => {
  const newProject: Project = {
    id: Date.now().toString(),
    name: projectForm.value.name,
    description: projectForm.value.description,
    url: projectForm.value.url,
    environment: projectForm.value.environment,
    icon: projectForm.value.icon,
    status: 'healthy',
    buildStatus: 'pending',
    deployStatus: 'pending',
    buildInfo: 'No recent builds',
    deployInfo: 'Not deployed',
    buildCommand: projectForm.value.buildCommand,
    deployCommand: projectForm.value.deployCommand,
    buildPath: projectForm.value.buildPath,
    deployUrl: projectForm.value.deployUrl,
    endpoints: projectForm.value.endpoints.map((ep, index) => ({
      id: `${Date.now()}-${index}`,
      name: ep.name,
      method: ep.method,
      path: ep.path,
      status: 'healthy' as const,
      responseTime: Math.floor(Math.random() * 200) + 50,
      lastChecked: new Date().toISOString()
    })),
    metrics: {
      uptime: 100,
      avgResponseTime: Math.floor(Math.random() * 200) + 50,
      errorRate: 0
    },
    checkInterval: projectForm.value.checkInterval,
    lastChecked: new Date().toISOString()
  }
  
  projects.value.push(newProject)
  closeAddProjectDialog()
  
  $q.notify({
    type: 'positive',
    message: `Project "${newProject.name}" added successfully`,
    position: 'top-right',
    timeout: 2000
  })
}

const closeAddProjectDialog = () => {
  showAddProjectDialog.value = false
  projectForm.value = {
    name: '',
    description: '',
    url: '',
    environment: 'Development',
    icon: 'web',
    checkInterval: 5,
    buildCommand: 'npm run build',
    deployCommand: 'npm run deploy',
    buildPath: './dist',
    deployUrl: '',
    endpoints: [
      { name: 'Health Check', method: 'GET', path: '/health' }
    ]
  }
}

const viewProjectDetails = (project: Project) => {
  $q.notify({
    type: 'info',
    message: `Viewing details for ${project.name}`,
    position: 'top-right',
    timeout: 2000
  })
}

const editProject = (project: Project) => {
  $q.notify({
    type: 'info',
    message: `Editing ${project.name}`,
    position: 'top-right',
    timeout: 2000
  })
}

const viewLogs = (project: Project) => {
  $q.notify({
    type: 'info',
    message: `Viewing logs for ${project.name}`,
    position: 'top-right',
    timeout: 2000
  })
}

const viewMetrics = (project: Project) => {
  $q.notify({
    type: 'info',
    message: `Viewing metrics for ${project.name}`,
    position: 'top-right',
    timeout: 2000
  })
}

const deleteProject = (projectId: string) => {
  $q.dialog({
    title: 'Delete Project',
    message: 'Are you sure you want to delete this project?',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(() => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      const projectName = projects.value[index].name
      projects.value.splice(index, 1)
      
      $q.notify({
        type: 'positive',
        message: `Project "${projectName}" deleted`,
        position: 'top-right',
        timeout: 2000
      })
    }
  })
}

const openProject = (project: Project) => {
  const url = project.deployUrl || project.url
  window.open(url, '_blank')
}

const saveSettings = () => {
  localStorage.setItem('monitor_settings', JSON.stringify(settings.value))
  showSettingsDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: 'Settings saved',
    position: 'top-right',
    timeout: 2000
  })
  
  // Restart auto-refresh if enabled
  if (settings.value.autoRefresh) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const loadSettings = () => {
  const stored = localStorage.getItem('monitor_settings')
  if (stored) {
    settings.value = { ...settings.value, ...JSON.parse(stored) }
  }
}

const startAutoRefresh = () => {
  stopAutoRefresh()
  if (settings.value.autoRefresh) {
    autoRefreshInterval = setInterval(() => {
      refreshAllProjects()
    }, 60000) // Refresh every minute
  }
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
}

onMounted(() => {
  loadDemoData()
  loadSettings()
  startAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.monitor-view {
  height: calc(100vh - 50px);
}

.monitor-controls {
  gap: 16px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.projects-grid {
  margin-bottom: 32px;
}

.project-card {
  transition: all 0.3s ease;
  min-height: 500px;
  border-left: 4px solid transparent;
  overflow: hidden; /* Prevent content overflow */
}

.project-card.project-healthy {
  border-left-color: #21BA45;
}

.project-card.project-warning {
  border-left-color: #F2C037;
}

.project-card.project-error {
  border-left-color: #C10015;
}

.project-card:hover {
  box-shadow: 0 12px 32px rgba(114, 92, 173, 0.4);
}

.add-project-card {
  border: 2px dashed rgba(239, 228, 210, 0.3);
  background: rgba(58, 107, 140, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.add-project-card:hover {
  border-color: rgba(239, 228, 210, 0.5);
  background: rgba(58, 107, 140, 0.2);
}

.project-info {
  flex: 1;
  min-width: 0; /* Allow flex item to shrink */
  overflow: hidden; /* Prevent overflow */
}

/* Text wrapping and overflow fixes */
.project-name {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.project-description {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-menu-btn {
  flex-shrink: 0; /* Prevent button from shrinking */
}

.status-chip,
.environment-chip {
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
}

/* Build & Deploy Status Section */
.build-deploy-status {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.build-status,
.deploy-status {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 8px;
  padding: 12px;
  overflow: hidden; /* Prevent content overflow */
}

.build-info,
.deploy-info {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.api-endpoints {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  overflow: hidden; /* Prevent content overflow */
}

.endpoint-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
  overflow: hidden; /* Prevent content overflow */
}

.endpoint-item:last-child {
  border-bottom: none;
}

.endpoint-info {
  flex: 1;
  min-width: 0; /* Allow flex item to shrink */
  overflow: hidden; /* Prevent overflow */
}

.endpoint-name {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.endpoint-path {
  word-wrap: break-word;
  word-break: break-all; /* Break long URLs */
  hyphens: none; /* Don't hyphenate URLs */
  overflow-wrap: break-word;
  line-height: 1.3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.endpoint-status {
  flex-shrink: 0; /* Prevent status from shrinking */
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.response-time {
  font-family: 'JetBrains Mono', monospace;
}

.project-metrics {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.metric-item {
  padding: 8px;
  overflow: hidden; /* Prevent content overflow */
}

.metric-value {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.2;
  font-family: 'JetBrains Mono', monospace;
}

.metric-label {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.project-footer {
  overflow: hidden; /* Prevent content overflow */
}

.last-checked {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.endpoints-section,
.build-deploy-config {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.endpoint-form {
  margin-bottom: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .monitor-view {
    padding: 12px;
  }
  
  .monitor-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .project-card {
    min-height: auto;
  }
  
  .add-project-card {
    min-height: 200px;
  }
  
  /* Enhanced mobile text wrapping */
  .project-name {
    font-size: 1rem;
    line-height: 1.2;
  }
  
  .project-description {
    font-size: 0.875rem;
    line-height: 1.3;
    -webkit-line-clamp: 3; /* Show more lines on mobile */
  }
  
  .endpoint-path {
    font-size: 0.7rem;
    line-height: 1.2;
  }
  
  .metric-value {
    font-size: 1rem;
  }
  
  .metric-label {
    font-size: 0.75rem;
  }
  
  .build-info,
  .deploy-info {
    font-size: 0.7rem;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .project-name {
    font-size: 0.9rem;
  }
  
  .project-description {
    font-size: 0.8rem;
  }
  
  .endpoint-path {
    font-size: 0.65rem;
  }
  
  .metric-value {
    font-size: 0.9rem;
  }
  
  .metric-label {
    font-size: 0.7rem;
  }
  
  .build-info,
  .deploy-info {
    font-size: 0.65rem;
  }
}
</style>