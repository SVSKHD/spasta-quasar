import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog, Notify } from 'quasar'
import router from './router'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'

// Import Quasar SASS variables first
import './quasar-variables.sass'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Initialize Firebase
import './firebase/config'

import App from './App.vue'

// Import all components
import SpastaRouter from './components/Router.vue'
import SpastaDashboard from './components/Dashboard.vue'
import SpastaTaskStats from './components/TaskStats.vue'
import SpastaTaskFilters from './components/TaskFilters.vue'
import SpastaTaskColumn from './components/TaskColumn.vue'
import SpastaTaskCard from './components/TaskCard.vue'
import SpastaTaskForm from './components/TaskForm.vue'
import SpastaTaskDrawer from './components/TaskDrawer.vue'
import SpastaCategoryDrawer from './components/CategoryDrawer.vue'
import SpastaAuthDialog from './components/AuthDialog.vue'
import SpastaCategoryBoard from './components/CategoryBoard.vue'
import SpastaCategoryForm from './components/CategoryForm.vue'
import SpastaGreetingCard from './components/GreetingCard.vue'

const app = createApp(App)
const pinia = createPinia()

// Register all components globally with Spasta prefix
app.component('SpastaRouter', SpastaRouter)
app.component('SpastaDashboard', SpastaDashboard)
app.component('SpastaTaskStats', SpastaTaskStats)
app.component('SpastaTaskFilters', SpastaTaskFilters)
app.component('SpastaTaskColumn', SpastaTaskColumn)
app.component('SpastaTaskCard', SpastaTaskCard)
app.component('SpastaTaskForm', SpastaTaskForm)
app.component('SpastaTaskDrawer', SpastaTaskDrawer)
app.component('SpastaCategoryDrawer', SpastaCategoryDrawer)
app.component('SpastaAuthDialog', SpastaAuthDialog)
app.component('SpastaCategoryBoard', SpastaCategoryBoard)
app.component('SpastaCategoryForm', SpastaCategoryForm)
app.component('SpastaGreetingCard', SpastaGreetingCard)

app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  }
})

app.mount('#app')