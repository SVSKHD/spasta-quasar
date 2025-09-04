<template>
  <q-layout view="lHh Lpr lFf" class="bg-primary">
    <Header :tabs="tabs" />

    <q-page-container>
      <q-page class="flex flex-center column items-center">
        <div
          class="q-pt-sm bg-primary text-white rounded-borders"
          style="max-width: 800px; width: 100%"
        >
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Header from "../layout/header.vue";

const tabs = [
  { name: "Tasks", route: "/tasks", icon: "eva-layers-outline" },
  { name: "Trading", route: "/trade", icon: "eva-bar-chart-outline" },
  { name: "Notes", route: "/notes", icon: "eva-file-text-outline" },
  { name: "Settings", route: "/settings", icon: "eva-options-outline" },
];

const route = useRoute();

/**
 * Smart slide direction:
 * - Forward (history.position increases)  -> slide-left
 * - Back    (history.position decreases)  -> slide-right
 */
const transitionName = ref<"slide-left" | "slide-right">("slide-left");
let lastPos = (window.history.state && window.history.state.position) ?? 0;

watch(
  () => route.fullPath,
  () => {
    const pos = (window.history.state && window.history.state.position) ?? 0;
    transitionName.value = pos > lastPos ? "slide-left" : "slide-right";
    lastPos = pos;
  },
  { immediate: true },
);
</script>

<style scoped>
/* Slide LEFT (forward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease;
}
.slide-left-enter-from {
  transform: translateX(20px);
}
.slide-left-leave-to {
  transform: translateX(-20px);
}

/* Slide RIGHT (back) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease;
}
.slide-right-enter-from {
  transform: translateX(-20px);
}
.slide-right-leave-to {
  transform: translateX(20px);
}
</style>
