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
                    <div class="text-h6 text-weight-medium spasta-text">{{ project.name }}</div>
                  </div>
                  <div class="text-body2 spasta-text opacity-80">{{ project.description }}</div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  size="sm"
                  @click="showProjectMenu(project)"
                  class="spasta-text"
                />
              </div>

              <!-- Status Badge -->
              <div class="project-status q-mb-md">
                <q-chip
                  :color="getStatusColor(project.status)"
                  text-color="white"
                  size="sm"
                  :icon="getStatusIcon(project.status)"
                  :label="project.status.toUpperCase()"
                />
                <q-chip
                  outline
                  color="white"
                  text-color="grey-8"
                  size="sm"
                  :label="project.environment"
                  class="q-ml-sm"
                />
              </div>

              <!-- API Endpoints -->
              <div class="api-endpoints q-mb-md">
                <div class="text-body2 spasta-text q-mb-sm">API Endpoints</div>
                <div v-for="endpoint in project.endpoints" :key="endpoint.id" class="endpoint-item q-mb-xs">
                  <div class="row items-center justify-between">
                    <div class="endpoint-info">
                      <div class="text-caption spasta-text text-weight-medium">{{ endpoint.name }}</div>
                      <div class="text-caption spasta-text opacity-70">{{ endpoint.method }} {{ endpoint.path }}</div>
                    </div>
                    <div class="endpoint-status">
                      <q-icon
                        :name="getEndpointStatusIcon(endpoint.status)"
                        :color="getStatusColor(endpoint.status)"
                        size="sm"
                      />
                      <span class="text-caption spasta-text q-ml-xs">{{ endpoint.responseTime }}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Metrics -->
              <div class="project-metrics q-mb-md">
                <div class="row q-gutter-sm">
                  <div class="col">
                    <div class="metric-item text-center">
                      <div class="text-h6 spasta-text">{{ project.metrics.uptime }}%</div>
                      <div class="text-caption spasta-text opacity-70">Uptime</div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="metric-item text-center">
                      <div class="text-h6 spasta-text">{{ project.metrics.avgResponseTime }}ms</div>
                      <div class="text-caption spasta-text opacity-70">Avg Response</div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="metric-item text-center">
                      <div class="text-h6 spasta-text">{{ project.metrics.errorRate }}%</div>
                      <div class="text-caption spasta-text opacity-70">Error Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Last Updated -->
              <div class="project-footer">
                <div class="text-caption spasta-text opacity-60">
                  Last checked: {{ formatLastChecked(project.lastChecked) }}
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="q-pa-lg q-pt-none">
              <q-btn
                flat
                icon="visibility"
                label="View Details"
                @click="viewProjectDetails(project)"
                class="spasta-text"
                size="sm"
              />
              <q-btn
                flat
                icon="refresh"
                label="Check Now"
                @click="checkProject(project)"
                class="spasta-text"
                size="sm"
                :loading="project.checking"
              />
              <q-space />
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

    <!-- Project Menu -->
    <q-menu v-model="projectMenuVisible" class="spasta-card">
      <q-list style="min-width: 150px">
        <q-item 
          clickable 
          v-close-popup
          @click="selectedProject && viewProjectDetails(selectedProject)"
          class="spasta-text"
        >
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>
          <q-item-section>View Details</q-item-section>
        </q-item>
        <q-item 
          clickable 
          v-close-popup
          @click="selectedProject && editProject(selectedProject)"
          class="spasta-text"
        >
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item 
          clickable 
          v-close-popup
          @click="selectedProject && deleteProject(selectedProject.id)"
          class="text-negative"
        >
          <q-item-section avatar>
            <q-icon name="delete" />
          </q-item-section>
          <q-item-section>Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
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
  endpoints: Endpoint[]
  metrics: {
    uptime: number
    avgResponseTime: number
    errorRate: number
  }
  checkInterval: number
  lastChecked: string
  checking?: boolean
}

const $q = useQuasar()
const projects = ref<Project[]>([])
const refreshing = ref(false)
const showAddProjectDialog = ref(false)
const showSettingsDialog = ref(false)
const projectMenuVisible = ref(false)
const selectedProject = ref<Project | null>(null)
let autoRefreshInterval: NodeJS.Timeout | null = null

const projectForm = ref({
  name: '',
  description: '',
  url: '',
  environment: 'Development',
  icon: 'web',
  checkInterval: 5,
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
    const statuses = ['healthy', 'warning', 'error']
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
    endpoints: [
      { name: 'Health Check', method: 'GET', path: '/health' }
    ]
  }
}

const showProjectMenu = (project: Project) => {
  selectedProject.value = project
  projectMenuVisible.value = true
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
  window.open(project.url, '_blank')
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
  min-height: 400px;
  border-left: 4px solid transparent;
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
  min-height: 400px;
}

.add-project-card:hover {
  border-color: rgba(239, 228, 210, 0.5);
  background: rgba(58, 107, 140, 0.2);
}

.project-info {
  flex: 1;
}

.api-endpoints {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.endpoint-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.endpoint-item:last-child {
  border-bottom: none;
}

.project-metrics {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.metric-item {
  padding: 8px;
}

.endpoints-section {
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
}
</style>