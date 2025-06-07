<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 400px" class="auth-card spasta-card">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h4 text-weight-bold text-primary q-mb-md">
          <q-icon name="dashboard" size="lg" class="q-mr-sm" color="white" />
          <span class="spasta-text">Spasta</span>
        </div>
        <div class="text-h6 q-mb-md spasta-text">Welcome to Task Management</div>
        <div class="text-body2 spasta-text opacity-80">
          Sign in with your Google account to get started
        </div>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <div class="text-center">
          <q-btn
            size="lg"
            color="white"
            text-color="grey-8"
            class="full-width q-py-md google-btn"
            no-caps
            @click="handleGoogleLogin"
            :loading="loading"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              style="width: 20px; height: 20px; margin-right: 12px;"
            />
            Continue with Google
          </q-btn>
        </div>

        <!-- Show redirect option if popup was blocked -->
        <div v-if="showRedirectOption" class="text-center q-mt-md">
          <q-btn
            size="md"
            color="primary"
            class="full-width q-py-sm"
            no-caps
            @click="handleGoogleRedirect"
            :loading="loading"
          >
            <q-icon name="open_in_new" class="q-mr-sm" />
            Try Google Login (Redirect)
          </q-btn>
          <div class="text-caption spasta-text opacity-70 q-mt-xs">
            Use this if popups are blocked
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <div class="text-center">
          <q-btn
            flat
            color="white"
            @click="loginAsGuest"
            class="full-width spasta-text"
            :loading="loading"
          >
            Continue as Guest
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-caption spasta-text opacity-70">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/authStore'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)
const showRedirectOption = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const handleGoogleLogin = async () => {
  loading.value = true
  try {
    const user = await authStore.login()
    if (user) {
      $q.notify({
        type: 'positive',
        message: `Welcome, ${user.name}!`,
        position: 'top-right',
        timeout: 3000
      })
      dialogVisible.value = false
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    let errorMessage = 'Login failed. Please try again.'
    
    // Check if the error is specifically a popup-blocked error
    if (error?.code === 'auth/popup-blocked') {
      showRedirectOption.value = true
      errorMessage = 'Popup blocked by browser. Please allow popups for this site or try the redirect option below. Look for a popup blocker icon in your address bar and click "Allow".'
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top-right',
      timeout: 8000,
      multiLine: true,
      actions: [
        {
          label: 'Dismiss',
          color: 'white'
        }
      ]
    })
  } finally {
    loading.value = false
  }
}

const handleGoogleRedirect = async () => {
  loading.value = true
  try {
    const user = await authStore.loginWithRedirect()
    if (user) {
      $q.notify({
        type: 'positive',
        message: `Welcome, ${user.name}!`,
        position: 'top-right',
        timeout: 3000
      })
      dialogVisible.value = false
    }
  } catch (error: any) {
    console.error('Redirect login error:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Login failed. Please try again.',
      position: 'top-right',
      timeout: 5000
    })
  } finally {
    loading.value = false
  }
}

const loginAsGuest = () => {
  loading.value = true
  try {
    const user = authStore.loginAsGuest()
    
    $q.notify({
      type: 'info',
      message: 'Logged in as guest',
      position: 'top-right',
      timeout: 2000
    })

    dialogVisible.value = false
  } catch (error) {
    console.error('Guest login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  border-radius: 16px;
  border: 2px solid rgba(255, 227, 169, 0.2);
}

.google-btn {
  border: 1px solid #dadce0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.google-btn:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>