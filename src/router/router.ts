import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Layout from "../layout/layout.vue";

import Home from "../views/home.vue";
import Tasks from "../views/tasks.vue";
import Settings from "../views/settings.vue";
import Trade from "../views/trade.vue";
import Notes from "../views/notes.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/",
        name: "Home",
        component: Home,
        // or remove meta to use default
      },
      {
        path: "/tasks",
        name: "Tasks",
        component: Tasks,
      },
      {
        path: "/trade",
        name: "Trade",
        component: Trade,
      },
      {
        path: "/notes",
        name: "Notes",
        component: Notes,
      },
      {
        path: "/settings",
        name: "settings",
        component: Settings,
      },
    ],
  },
  // optional: catch-all -> Home
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
