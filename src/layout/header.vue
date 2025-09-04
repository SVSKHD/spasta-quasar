<template>
  <div class="q-pa-lg">
    <q-toolbar class="layout-header text-white rounded-borders">
      <!-- Left: Home -->
      <q-btn flat icon="eva-home-outline" :to="homeTo" class="q-pr-md">
        <q-tooltip>Go to {{ homeToLabel }}</q-tooltip>
      </q-btn>

      <!-- Center text -->
      <div class="text-h6 text-bold text-white q-mx-md">Spasta.online</div>

      <q-space />

      <!-- Right: Tabs -->
      <q-tabs
        v-model="current"
        shrink
        class="text-white"
        active-color="white"
        indicator-color="white"
      >
        <q-route-tab
          v-for="t in normalizedTabs"
          :key="t.name"
          :name="t.name"
          :icon="t.icon"
          :to="t.route"
          no-caps
          class="q-mx-xs"
        >
          <q-tooltip class="bg-primary">
            {{ t.tooltip ?? tooltipText(t.route) }}
          </q-tooltip>
        </q-route-tab>
      </q-tabs>

      <!-- Logout -->
      <q-btn
        flat
        icon="eva-log-out-outline"
        :to="homeTo"
        class="q-pr-md bg-secondary"
      >
        <q-tooltip>Logout</q-tooltip>
      </q-btn>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

type RouteLike = string | Record<string, any>;

interface TabItem {
  name: string;
  route: RouteLike;
  icon?: string;
  tooltip?: string;
}

const props = defineProps<{
  tabs: TabItem[];
  homeTo?: RouteLike;
  homeToLabel?: string;
}>();

const route = useRoute();
const current = ref<string>("");

const homeTo = computed(() => props.homeTo ?? "/");
const homeToLabel = computed(() => props.homeToLabel ?? "/");

const normalizedTabs = computed<TabItem[]>(() => props.tabs ?? []);

function tooltipText(r: RouteLike) {
  if (typeof r === "string") return `Route: ${r}`;
  const parts: string[] = [];
  if (r.name) parts.push(`name=${r.name}`);
  if (r.path) parts.push(`path=${r.path}`);
  if (r.params) parts.push(`params=${JSON.stringify(r.params)}`);
  if (r.query) parts.push(`query=${JSON.stringify(r.query)}`);
  return parts.length ? `Route: ${parts.join(" · ")}` : "Navigate";
}

watch(
  () => route.fullPath,
  () => {
    const match = normalizedTabs.value.find((t) => {
      const r = t.route as any;
      if (typeof r === "string") {
        return route.path === r;
      } else if (r && r.name) {
        return route.name === r.name;
      } else if (r && r.path) {
        return route.path === r.path;
      }
      return false;
    });
    if (match) current.value = match.name;
  },
  { immediate: true },
);
</script>
