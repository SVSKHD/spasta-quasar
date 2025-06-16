<template>
  <q-card class="greeting-card spasta-card">
    <q-card-section class="q-pa-lg">
      <div class="row items-center justify-between">
        <div class="greeting-content">
          <div class="greeting-header row items-center q-mb-sm">
            <q-icon 
              :name="timeIcon" 
              :color="timeIconColor" 
              size="lg" 
              class="q-mr-md time-icon"
            />
            <div>
              <div class="text-h5 text-weight-medium spasta-text">
                {{ greetingMessage }}
              </div>
              <div class="text-body2 spasta-text opacity-80">
                {{ currentDateTime }}
              </div>
            </div>
          </div>
          
          <!-- Weather Info with Location -->
          <div v-if="weather" class="weather-info row items-center q-mt-md">
            <q-icon 
              :name="weather.icon" 
              :color="weather.color" 
              size="md" 
              class="q-mr-sm weather-icon"
            />
            <div class="weather-details">
              <div class="text-body1 spasta-text">
                {{ weather.temperature }}°{{ temperatureUnit }} • {{ weather.description }}
              </div>
              <div class="text-body2 spasta-text opacity-70">
                <q-icon name="location_on" size="xs" class="q-mr-xs" />
                {{ weather.location }}
                <span v-if="weather.humidity" class="q-ml-md">
                  <q-icon name="water_drop" size="xs" class="q-mr-xs" />
                  {{ weather.humidity }}%
                </span>
                <span v-if="weather.windSpeed" class="q-ml-md">
                  <q-icon name="air" size="xs" class="q-mr-xs" />
                  {{ weather.windSpeed }} km/h
                </span>
              </div>
            </div>
          </div>

          <div v-if="!weather && weatherLoading" class="weather-loading q-mt-md">
            <div class="row items-center">
              <q-spinner-dots size="sm" color="white" class="q-mr-sm" />
              <span class="text-body2 spasta-text opacity-70">Getting your location and weather...</span>
            </div>
          </div>

          <div v-if="weatherError" class="weather-error q-mt-md">
            <div class="text-body2 text-warning">
              <q-icon name="warning" class="q-mr-xs" />
              {{ weatherErrorMessage }}
            </div>
          </div>
        </div>

        <div class="greeting-actions">
          <q-btn
            flat
            round
            icon="my_location"
            @click="getCurrentLocation"
            :loading="locationLoading"
            class="spasta-text"
          >
            <q-tooltip>Get current location</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="refresh"
            @click="refreshWeather"
            :loading="weatherLoading"
            class="spasta-text"
          >
            <q-tooltip>Refresh weather</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            :icon="temperatureUnit === 'C' ? 'thermostat' : 'ac_unit'"
            @click="toggleTemperatureUnit"
            class="spasta-text q-ml-sm"
          >
            <q-tooltip>Switch to {{ temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius' }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

interface Weather {
  temperature: number
  description: string
  icon: string
  color: string
  location: string
  humidity: number
  windSpeed: number
  coordinates?: {
    lat: number
    lon: number
  }
}

interface LocationData {
  lat: number
  lon: number
  city?: string
  country?: string
  state?: string
}

const $q = useQuasar()
const weather = ref<Weather | null>(null)
const weatherLoading = ref(false)
const weatherError = ref(false)
const weatherErrorMessage = ref('')
const locationLoading = ref(false)
const temperatureUnit = ref<'C' | 'F'>('C')
const currentTime = ref(new Date())
const userLocation = ref<LocationData | null>(null)
let timeInterval: NodeJS.Timeout | null = null

// Update time every minute
const updateTime = () => {
  currentTime.value = new Date()
}

const greetingMessage = computed(() => {
  const hour = currentTime.value.getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Good Morning!'
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon!'
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening!'
  } else {
    return 'Good Night!'
  }
})

const timeIcon = computed(() => {
  const hour = currentTime.value.getHours()
  
  if (hour >= 6 && hour < 18) {
    return 'wb_sunny' // Sun icon for daytime
  } else {
    return 'nights_stay' // Moon icon for nighttime
  }
})

const timeIconColor = computed(() => {
  const hour = currentTime.value.getHours()
  
  if (hour >= 6 && hour < 18) {
    return 'warning' // Yellow/orange for sun
  } else {
    return 'info' // Blue for moon
  }
})

const currentDateTime = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase()
  
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    return { icon: 'wb_sunny', color: 'warning' }
  } else if (conditionLower.includes('cloud')) {
    return { icon: 'cloud', color: 'grey' }
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return { icon: 'grain', color: 'primary' }
  } else if (conditionLower.includes('snow')) {
    return { icon: 'ac_unit', color: 'light-blue' }
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return { icon: 'flash_on', color: 'purple' }
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return { icon: 'blur_on', color: 'grey-6' }
  } else {
    return { icon: 'wb_cloudy', color: 'grey' }
  }
}

const convertTemperature = (temp: number, from: 'C' | 'F', to: 'C' | 'F') => {
  if (from === to) return temp
  
  if (from === 'C' && to === 'F') {
    return Math.round((temp * 9/5) + 32)
  } else {
    return Math.round((temp - 32) * 5/9)
  }
}

const getCurrentLocation = async () => {
  locationLoading.value = true
  weatherError.value = false
  
  try {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser')
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })

    const { latitude, longitude } = position.coords
    console.log('Got coordinates:', latitude, longitude)
    
    // Get location details using reverse geocoding
    await getLocationDetails(latitude, longitude)
    
    // Get weather for this location
    await getWeatherByCoords(latitude, longitude)
    
  } catch (error: any) {
    console.error('Location error:', error)
    weatherError.value = true
    
    if (error.code === 1) {
      weatherErrorMessage.value = 'Location access denied. Please enable location services.'
    } else if (error.code === 2) {
      weatherErrorMessage.value = 'Location unavailable. Please try again.'
    } else if (error.code === 3) {
      weatherErrorMessage.value = 'Location request timed out. Please try again.'
    } else {
      weatherErrorMessage.value = 'Unable to get location. Using default weather.'
    }
    
    // Fallback to default weather
    getDefaultWeather()
  } finally {
    locationLoading.value = false
  }
}

const getLocationDetails = async (lat: number, lon: number) => {
  try {
    // Using a free geocoding service (nominatim)
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Location data:', data)
      
      const address = data.address || {}
      const city = address.city || address.town || address.village || address.suburb || 'Unknown City'
      const state = address.state || address.region || ''
      const country = address.country || 'Unknown Country'
      
      userLocation.value = {
        lat,
        lon,
        city,
        state,
        country
      }
      
      console.log('Parsed location:', userLocation.value)
    } else {
      throw new Error('Failed to get location details')
    }
  } catch (error) {
    console.error('Error getting location details:', error)
    // Set basic location info
    userLocation.value = {
      lat,
      lon,
      city: 'Your Location',
      country: ''
    }
  }
}

const getWeatherByCoords = async (lat: number, lon: number) => {
  try {
    // Since we can't use real weather APIs without API keys in this demo,
    // we'll generate realistic weather data based on location and time
    const mockWeatherData = generateMockWeather(lat, lon)
    weather.value = mockWeatherData
  } catch (error) {
    console.error('Error getting weather by coordinates:', error)
    getDefaultWeather()
  }
}

const generateMockWeather = (lat: number, lon: number) => {
  const hour = currentTime.value.getHours()
  const month = currentTime.value.getMonth()
  
  // Generate realistic temperature based on time, season, and latitude
  let baseTemp = 20 // Base temperature in Celsius
  
  // Latitude-based adjustment (closer to equator = warmer)
  const latAdjustment = (90 - Math.abs(lat)) / 90 * 15
  baseTemp += latAdjustment
  
  // Seasonal adjustment
  if (month >= 11 || month <= 1) { // Winter
    baseTemp -= 15
  } else if (month >= 5 && month <= 7) { // Summer
    baseTemp += 10
  } else if (month >= 2 && month <= 4) { // Spring
    baseTemp += 2
  } else { // Fall
    baseTemp -= 2
  }
  
  // Daily temperature variation
  if (hour >= 6 && hour <= 14) { // Morning to afternoon
    baseTemp += Math.random() * 8
  } else if (hour >= 15 && hour <= 18) { // Late afternoon
    baseTemp += Math.random() * 5
  } else { // Evening and night
    baseTemp -= Math.random() * 8
  }
  
  // Weather conditions based on randomness and season
  const conditions = [
    'Clear sky',
    'Partly cloudy',
    'Cloudy',
    'Light rain',
    'Sunny'
  ]
  
  // Adjust conditions based on season
  let availableConditions = [...conditions]
  if (month >= 11 || month <= 1) { // Winter
    availableConditions.push('Snow', 'Overcast')
  } else if (month >= 5 && month <= 7) { // Summer
    availableConditions.push('Hot', 'Sunny', 'Clear sky')
  }
  
  const condition = availableConditions[Math.floor(Math.random() * availableConditions.length)]
  const weatherIcon = getWeatherIcon(condition)
  
  // Get location name
  const location = userLocation.value 
    ? `${userLocation.value.city}${userLocation.value.state ? ', ' + userLocation.value.state : ''}`
    : getLocationName(lat, lon)
  
  return {
    temperature: Math.round(baseTemp),
    description: condition,
    icon: weatherIcon.icon,
    color: weatherIcon.color,
    location,
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
    coordinates: { lat, lon }
  }
}

const getLocationName = (lat: number, lon: number) => {
  // Simplified location detection based on coordinates
  if (lat > 40 && lat < 50 && lon > -125 && lon < -70) {
    return 'United States'
  } else if (lat > 35 && lat < 70 && lon > -10 && lon < 40) {
    return 'Europe'
  } else if (lat > -40 && lat < -10 && lon > 110 && lon < 155) {
    return 'Australia'
  } else if (lat > 20 && lat < 50 && lon > 70 && lon < 140) {
    return 'Asia'
  } else {
    return 'Your Location'
  }
}

const getDefaultWeather = () => {
  // Fallback weather data
  const hour = currentTime.value.getHours()
  let condition = 'Clear sky'
  let temp = 22
  
  if (hour >= 6 && hour < 18) {
    condition = 'Sunny'
    temp = 25
  } else {
    condition = 'Clear night'
    temp = 18
  }
  
  const weatherIcon = getWeatherIcon(condition)
  
  weather.value = {
    temperature: temp,
    description: condition,
    icon: weatherIcon.icon,
    color: weatherIcon.color,
    location: 'Default Location',
    humidity: 65,
    windSpeed: 10
  }
}

const fetchWeather = async () => {
  weatherLoading.value = true
  weatherError.value = false
  
  try {
    // Try to get user's location first
    await getCurrentLocation()
  } catch (error) {
    console.error('Error fetching weather:', error)
    weatherError.value = true
    weatherErrorMessage.value = 'Unable to get weather data'
    getDefaultWeather()
  } finally {
    weatherLoading.value = false
  }
}

const refreshWeather = async () => {
  if (userLocation.value) {
    weatherLoading.value = true
    await getWeatherByCoords(userLocation.value.lat, userLocation.value.lon)
    weatherLoading.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Weather updated',
      position: 'top-right',
      timeout: 2000
    })
  } else {
    await fetchWeather()
  }
}

const toggleTemperatureUnit = () => {
  if (weather.value) {
    const newUnit = temperatureUnit.value === 'C' ? 'F' : 'C'
    weather.value.temperature = convertTemperature(
      weather.value.temperature,
      temperatureUnit.value,
      newUnit
    )
    temperatureUnit.value = newUnit
    
    // Save preference
    localStorage.setItem('spasta_temperature_unit', newUnit)
  }
}

onMounted(() => {
  // Load temperature unit preference
  const savedUnit = localStorage.getItem('spasta_temperature_unit') as 'C' | 'F'
  if (savedUnit) {
    temperatureUnit.value = savedUnit
  }
  
  // Start time updates
  timeInterval = setInterval(updateTime, 60000) // Update every minute
  
  // Fetch initial weather
  fetchWeather()
})

onBeforeUnmount(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.greeting-card {
  border-radius: 20px;
  border: 2px solid rgba(239, 228, 210, 0.2);
  background: linear-gradient(135deg, rgba(58, 107, 140, 0.1) 0%, rgba(37, 77, 112, 0.1) 100%);
  transition: all 0.3s ease;
}

.greeting-card:hover {
  border-color: rgba(239, 228, 210, 0.4);
  box-shadow: 0 8px 32px rgba(58, 107, 140, 0.2);
}

.greeting-content {
  flex: 1;
}

.greeting-header {
  align-items: flex-start;
}

.time-icon {
  animation: gentle-pulse 3s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.weather-info {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(239, 228, 210, 0.1);
}

.weather-details {
  flex: 1;
}

.weather-icon {
  animation: weather-float 4s ease-in-out infinite;
}

@keyframes weather-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

.weather-loading,
.weather-error {
  background: rgba(239, 228, 210, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
}

.greeting-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .greeting-card :deep(.q-card-section) {
    padding: 16px !important;
  }
  
  .greeting-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .time-icon {
    margin-bottom: 8px;
    margin-right: 0;
  }
  
  .weather-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .greeting-actions {
    flex-direction: row;
    margin-top: 16px;
  }
}
</style>