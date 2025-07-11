<template>
  <div class="redirect-view q-pa-lg">
    <q-card class="spasta-card">
      <q-card-section class="q-pa-lg">
        <div class="text-h5 spasta-text q-mb-md">
          <q-icon name="link" class="q-mr-sm icon-lg" />
          Redirect Parameters
        </div>
        <div class="text-body2 spasta-text opacity-70 q-mb-lg">
          The following parameters were captured from the redirect URL.
        </div>

        <!-- Parameters Display -->
        <div class="params-container q-mb-lg">
          <q-card flat class="spasta-card-light q-pa-md">
            <pre class="params-display spasta-text">{{ formattedParams }}</pre>
          </q-card>
        </div>

        <!-- Copy Buttons -->
        <div class="row q-gutter-md">
          <q-btn
            flat
            icon="content_copy"
            label="Copy All Parameters"
            @click="copyToClipboard(formattedParams)"
            class="spasta-text"
            color="white"
          />
          <q-btn
            flat
            icon="content_copy"
            label="Copy Auth Code"
            @click="copyToClipboard(params.auth_code || '')"
            class="spasta-text"
            color="white"
            :disable="!params.auth_code"
          />
          <q-btn
            flat
            icon="home"
            label="Go to Dashboard"
            @click="$router.push('/')"
            class="spasta-text"
            color="white"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Individual Parameter Cards -->
    <div class="row q-gutter-md q-mt-lg">
      <div v-for="(value, key) in params" :key="key" class="col-12 col-md-6 col-lg-4">
        <q-card class="spasta-card param-card">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 spasta-text q-mb-sm">{{ formatParamName(key) }}</div>
            <div class="param-value-container">
              <div class="text-body2 spasta-text param-value">{{ value }}</div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              icon="content_copy"
              label="Copy"
              @click="copyToClipboard(value)"
              class="spasta-text"
              size="sm"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const params = ref<Record<string, string>>({})

const formattedParams = computed(() => {
  return JSON.stringify(params.value, null, 2)
})

const formatParamName = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    $q.notify({
      type: 'positive',
      message: 'Copied to clipboard',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Failed to copy:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to copy to clipboard',
      position: 'top-right',
      timeout: 2000
    })
  }
}

onMounted(() => {
  // Extract all query parameters
  const queryParams = route.query
  
  // Convert to a simple object
  const paramsObj: Record<string, string> = {}
  Object.keys(queryParams).forEach(key => {
    const value = queryParams[key]
    if (typeof value === 'string') {
      paramsObj[key] = value
    } else if (Array.isArray(value)) {
      paramsObj[key] = value.join(',')
    }
  })
  
  params.value = paramsObj
})
</script>

<style scoped>
.redirect-view {
  max-width: 1200px;
  margin: 0 auto;
}

.params-display {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background: rgba(58, 107, 140, 0.1);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.param-card {
  transition: all 0.3s ease;
  height: 100%;
}

.param-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(58, 107, 140, 0.3);
  border-color: rgba(239, 228, 210, 0.3);
}

.param-value-container {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(239, 228, 210, 0.1);
  max-height: 150px;
  overflow-y: auto;
}

.param-value {
  word-break: break-word;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Scrollbar styling */
.params-display::-webkit-scrollbar,
.param-value-container::-webkit-scrollbar {
  width: 6px;
}

.params-display::-webkit-scrollbar-track,
.param-value-container::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 6px;
}

.params-display::-webkit-scrollbar-thumb,
.param-value-container::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.params-display::-webkit-scrollbar-thumb:hover,
.param-value-container::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .redirect-view {
    padding: 16px;
  }
  
  .params-display {
    font-size: 0.8rem;
    padding: 12px;
  }
  
  .param-value {
    font-size: 0.75rem;
  }
}
</style>