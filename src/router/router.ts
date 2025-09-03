import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import Layout from "../layout/layout.vue";
import Home from "../views/home.vue";
import Tasks from "../views/tasks.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "",
        name: "Home",
        component: Home,
        meta: { transition: "slide-x" } // or remove meta to use default
      },
      {
        path: "tasks",
        name: "Tasks",
        component: Tasks,
        meta: { transition: "slide-x" }
      }
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
