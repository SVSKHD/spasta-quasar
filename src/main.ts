// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import { Quasar, Dialog, Notify } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/eva-icons/eva-icons.css';
import 'quasar/src/css/index.sass';
import './style.css';

import { registerGlobalComponents } from './components/components';
import { createPinia } from 'pinia';
import { waitForAuthReady, auth } from './firebase/firebase';
import { useAuthStore } from './store/auth';

(async () => {
  // ✨ Block until we know the user (prevents header/dialog flash)
  const user = await waitForAuthReady();

  const app = createApp(App);
  const pinia = createPinia();

  app.use(Quasar, { plugins: { Dialog, Notify } });
  app.use(pinia);
  app.use(router);
  registerGlobalComponents(app);

  // Seed the auth store before first render so components have the user
  const authStore = useAuthStore(pinia);
  authStore.hydrateFromBootstrap(user); // we'll add this method below

  app.mount('#app');
})();