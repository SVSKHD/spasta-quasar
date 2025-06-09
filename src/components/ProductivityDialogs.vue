<template>
  <!-- Inactivity Dialog -->
  <q-dialog v-model="showInactivityDialog" persistent>
    <q-card class="spasta-card" style="min-width: 400px">
      <q-card-section class="text-center q-pa-lg">
        <q-icon name="schedule" size="xl" color="warning" class="q-mb-md" />
        <div class="text-h6 spasta-text q-mb-md">Still there?</div>
        <div class="text-body2 spasta-text opacity-80 q-mb-lg">
          You've been inactive for {{ Math.floor(inactivityTime / 60) }} minutes. 
          Take a break or continue working?
        </div>
        
        <div class="productivity-tips q-mb-lg">
          <div class="text-body2 spasta-text opacity-70 q-mb-sm">💡 Productivity Tip:</div>
          <div class="text-caption spasta-text opacity-60">
            {{ getRandomProductivityTip() }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-lg">
        <q-btn
          flat
          icon="coffee"
          label="Take a Break"
          @click="takeBreak"
          class="spasta-text q-mr-md"
          size="lg"
        />
        <q-btn
          flat
          icon="work"
          label="Continue Working"
          color="white"
          text-color="grey-8"
          @click="continueWorking"
          size="lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Night Alert Dialog -->
  <q-dialog v-model="showNightDialog" persistent>
    <q-card class="spasta-card" style="min-width: 450px">
      <q-card-section class="text-center q-pa-lg">
        <q-icon name="bedtime" size="xl" color="info" class="q-mb-md" />
        <div class="text-h6 spasta-text q-mb-md">Time for Rest! 🌙</div>
        <div class="text-body2 spasta-text opacity-80 q-mb-lg">
          It's {{ currentTime }} - consider getting some sleep for better productivity tomorrow.
        </div>
        
        <div class="sleep-benefits q-mb-lg">
          <div class="text-body2 spasta-text opacity-70 q-mb-sm">🛌 Sleep Benefits:</div>
          <div class="text-caption spasta-text opacity-60">
            {{ getRandomSleepBenefit() }}
          </div>
        </div>

        <div class="sleep-stats q-mb-lg">
          <div class="row justify-center spacing-lg">
            <div class="text-center">
              <div class="text-h6 text-positive">7-9</div>
              <div class="text-caption spasta-text opacity-70">Hours Recommended</div>
            </div>
            <div class="text-center">
              <div class="text-h6 text-info">{{ getHoursUntilMorning() }}</div>
              <div class="text-caption spasta-text opacity-70">Hours Until 7 AM</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-lg">
        <q-btn
          flat
          icon="snooze"
          label="Remind in 30 min"
          @click="snoozeNightAlert"
          class="spasta-text q-mr-md"
          size="lg"
        />
        <q-btn
          flat
          icon="bedtime"
          label="Going to Sleep"
          color="white"
          text-color="grey-8"
          @click="goToSleep"
          size="lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Break Timer Dialog -->
  <q-dialog v-model="showBreakDialog" persistent>
    <q-card class="spasta-card" style="min-width: 350px">
      <q-card-section class="text-center q-pa-lg">
        <q-icon name="timer" size="xl" color="positive" class="q-mb-md" />
        <div class="text-h6 spasta-text q-mb-md">Break Time! ☕</div>
        <div class="text-body2 spasta-text opacity-80 q-mb-lg">
          Take a {{ breakDuration }} minute break. You deserve it!
        </div>
        
        <div class="break-timer q-mb-lg">
          <q-circular-progress
            :value="breakProgress"
            size="120px"
            :thickness="0.1"
            color="positive"
            track-color="grey-3"
            class="q-mb-md"
          >
            <div class="text-h5 spasta-text">{{ formatBreakTime(breakTimeLeft) }}</div>
          </q-circular-progress>
        </div>

        <div class="break-activities">
          <div class="text-body2 spasta-text opacity-70 q-mb-sm">💪 Break Ideas:</div>
          <div class="text-caption spasta-text opacity-60">
            {{ getRandomBreakActivity() }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-lg">
        <q-btn
          flat
          icon="stop"
          label="End Break"
          @click="endBreak"
          class="spasta-text q-mr-md"
          size="lg"
        />
        <q-btn
          flat
          icon="add_alarm"
          label="Extend 5 min"
          @click="extendBreak"
          class="spasta-text"
          size="lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State
const showInactivityDialog = ref(false)
const showNightDialog = ref(false)
const showBreakDialog = ref(false)
const lastActivity = ref(Date.now())
const inactivityTime = ref(0)
const breakDuration = ref(15) // minutes
const breakTimeLeft = ref(0)
const breakStartTime = ref(0)
const nightAlertSnoozed = ref(false)

// Timers
let inactivityTimer: NodeJS.Timeout | null = null
let nightCheckTimer: NodeJS.Timeout | null = null
let breakTimer: NodeJS.Timeout | null = null
let activityCheckTimer: NodeJS.Timeout | null = null

// Constants
const INACTIVITY_THRESHOLD = 50 * 60 * 1000 // 50 minutes in milliseconds
const NIGHT_ALERT_HOUR = 21 // 9 PM
const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // Check every minute

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
})

const breakProgress = computed(() => {
  if (breakDuration.value === 0) return 0
  return ((breakDuration.value * 60 - breakTimeLeft.value) / (breakDuration.value * 60)) * 100
})

const productivityTips = [
  "Try the Pomodoro Technique: 25 minutes of focused work, then a 5-minute break.",
  "Keep a water bottle nearby and stay hydrated throughout the day.",
  "Take regular breaks to prevent eye strain and mental fatigue.",
  "Organize your workspace to minimize distractions and boost focus.",
  "Use the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.",
  "Set specific goals for each work session to maintain motivation.",
  "Listen to instrumental music or nature sounds to enhance concentration.",
  "Keep healthy snacks nearby to maintain energy levels.",
  "Use natural light when possible to regulate your circadian rhythm.",
  "Practice deep breathing exercises to reduce stress and improve focus."
]

const sleepBenefits = [
  "Better memory consolidation and learning retention",
  "Improved immune system function and disease resistance",
  "Enhanced creativity and problem-solving abilities",
  "Better emotional regulation and stress management",
  "Increased focus and concentration during the day",
  "Faster muscle recovery and physical performance",
  "Reduced risk of chronic diseases like diabetes and heart disease",
  "Better skin health and cellular repair",
  "Improved decision-making and cognitive function",
  "Enhanced mood and reduced anxiety levels"
]

const breakActivities = [
  "Take a short walk around the block or office",
  "Do some light stretching or yoga poses",
  "Practice deep breathing or meditation",
  "Hydrate with a glass of water or herbal tea",
  "Step outside for some fresh air and sunlight",
  "Do a few jumping jacks or push-ups",
  "Chat with a colleague or friend",
  "Listen to your favorite song",
  "Tidy up your workspace",
  "Look out the window and rest your eyes"
]

const getRandomProductivityTip = () => {
  return productivityTips[Math.floor(Math.random() * productivityTips.length)]
}

const getRandomSleepBenefit = () => {
  return sleepBenefits[Math.floor(Math.random() * sleepBenefits.length)]
}

const getRandomBreakActivity = () => {
  return breakActivities[Math.floor(Math.random() * breakActivities.length)]
}

const getHoursUntilMorning = () => {
  const now = new Date()
  const tomorrow7AM = new Date()
  tomorrow7AM.setDate(tomorrow7AM.getDate() + 1)
  tomorrow7AM.setHours(7, 0, 0, 0)
  
  const hoursUntil = (tomorrow7AM.getTime() - now.getTime()) / (1000 * 60 * 60)
  return Math.round(hoursUntil * 10) / 10 // Round to 1 decimal place
}

const formatBreakTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const resetActivityTimer = () => {
  lastActivity.value = Date.now()
  inactivityTime.value = 0
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
  }
  
  inactivityTimer = setTimeout(() => {
    if (!showBreakDialog.value && !showNightDialog.value) {
      showInactivityDialog.value = true
    }
  }, INACTIVITY_THRESHOLD)
}

const checkForNightAlert = () => {
  const now = new Date()
  const currentHour = now.getHours()
  
  if (currentHour >= NIGHT_ALERT_HOUR && !nightAlertSnoozed.value && !showBreakDialog.value) {
    showNightDialog.value = true
  }
}

const checkInactivity = () => {
  const now = Date.now()
  const timeSinceLastActivity = now - lastActivity.value
  inactivityTime.value = Math.floor(timeSinceLastActivity / 1000)
  
  if (timeSinceLastActivity >= INACTIVITY_THRESHOLD && !showInactivityDialog.value && !showBreakDialog.value && !showNightDialog.value) {
    showInactivityDialog.value = true
  }
}

const trackUserActivity = () => {
  resetActivityTimer()
}

const takeBreak = () => {
  showInactivityDialog.value = false
  showBreakDialog.value = true
  breakTimeLeft.value = breakDuration.value * 60
  breakStartTime.value = Date.now()
  
  breakTimer = setInterval(() => {
    breakTimeLeft.value--
    if (breakTimeLeft.value <= 0) {
      endBreak()
    }
  }, 1000)
  
  $q.notify({
    type: 'info',
    message: `Starting ${breakDuration.value} minute break`,
    position: 'top-right',
    timeout: 2000
  })
}

const continueWorking = () => {
  showInactivityDialog.value = false
  resetActivityTimer()
  
  $q.notify({
    type: 'positive',
    message: 'Back to work! Stay focused 💪',
    position: 'top-right',
    timeout: 2000
  })
}

const endBreak = () => {
  showBreakDialog.value = false
  if (breakTimer) {
    clearInterval(breakTimer)
    breakTimer = null
  }
  resetActivityTimer()
  
  const breakTaken = Math.floor((Date.now() - breakStartTime.value) / 1000 / 60)
  $q.notify({
    type: 'positive',
    message: `Break completed! You rested for ${breakTaken} minutes`,
    position: 'top-right',
    timeout: 3000
  })
}

const extendBreak = () => {
  breakTimeLeft.value += 5 * 60 // Add 5 minutes
  breakDuration.value += 5
  
  $q.notify({
    type: 'info',
    message: 'Break extended by 5 minutes',
    position: 'top-right',
    timeout: 2000
  })
}

const snoozeNightAlert = () => {
  showNightDialog.value = false
  nightAlertSnoozed.value = true
  
  // Reset snooze after 30 minutes
  setTimeout(() => {
    nightAlertSnoozed.value = false
  }, 30 * 60 * 1000)
  
  $q.notify({
    type: 'info',
    message: 'Night alert snoozed for 30 minutes',
    position: 'top-right',
    timeout: 2000
  })
}

const goToSleep = () => {
  showNightDialog.value = false
  nightAlertSnoozed.value = true
  
  // Reset for next day
  setTimeout(() => {
    nightAlertSnoozed.value = false
  }, 8 * 60 * 60 * 1000) // 8 hours
  
  $q.notify({
    type: 'positive',
    message: 'Good night! Sweet dreams 🌙',
    position: 'top-right',
    timeout: 3000
  })
}

onMounted(() => {
  // Set up activity tracking
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  events.forEach(event => {
    document.addEventListener(event, trackUserActivity, { passive: true })
  })
  
  // Initialize activity timer
  resetActivityTimer()
  
  // Set up periodic checks
  activityCheckTimer = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL)
  nightCheckTimer = setInterval(checkForNightAlert, 5 * 60 * 1000) // Check every 5 minutes
  
  // Initial night check
  checkForNightAlert()
})

onBeforeUnmount(() => {
  // Clean up event listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  events.forEach(event => {
    document.removeEventListener(event, trackUserActivity)
  })
  
  // Clear timers
  if (inactivityTimer) clearTimeout(inactivityTimer)
  if (nightCheckTimer) clearInterval(nightCheckTimer)
  if (breakTimer) clearInterval(breakTimer)
  if (activityCheckTimer) clearInterval(activityCheckTimer)
})
</script>

<style scoped>
.productivity-tips,
.sleep-benefits,
.break-activities {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.sleep-stats {
  background: rgba(58, 107, 140, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.break-timer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spacing-lg {
  gap: 24px;
}

/* Dialog animations */
.q-dialog .q-card {
  animation: dialogSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .q-card {
    min-width: 90vw !important;
  }
  
  .q-card-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .q-card-actions .q-btn {
    width: 100%;
  }
}
</style>