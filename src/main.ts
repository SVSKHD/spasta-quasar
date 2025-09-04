import { createApp } from "vue";

import App from "./App.vue";
// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/eva-icons/eva-icons.css";
import "quasar/src/css/index.sass";
import "./style.css";
import router from "./router/router";
import { Quasar, Dialog, Notify, QSlideTransition } from "quasar";
import { registerGlobalComponents } from "./components/components";
import { createPinia } from "pinia";

const pinia = createPinia();
const spasta = createApp(App);
registerGlobalComponents(spasta);

spasta
  .use(Quasar, {
    plugins: {
      Dialog,
      Notify,
      QSlideTransition,
    },
  })
  .use(pinia)
  .use(router)
  .mount("#app");
