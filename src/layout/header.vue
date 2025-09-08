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

      <!-- Right: User section -->
      <div class="row items-center no-wrap">
        <!-- While auth initializing -->
        <template v-if="!auth.ready">
          <q-skeleton type="QAvatar" size="28px" class="q-mr-sm" />
          <q-skeleton type="text" width="80px" />
        </template>

        <!-- When NOT authenticated: show nothing (or a login button if you prefer) -->
        <template v-else-if="!auth.isAuthenticated">
          <!-- keep empty to avoid 'Guest' flash; dialog handles login -->
        </template>

        <!-- Authenticated: show avatar + name + logout -->
        <template v-else>
          <q-btn
            flat
            class="q-pl-sm q-pr-md bg-secondary row items-center no-wrap"
            :loading="auth.loading"
            @click.stop.prevent="onLogout"
          >
            <q-avatar size="28px" class="q-mr-sm" color="grey-8" text-color="white">
              <img
                v-if="avatarSrc"
                :key="avatarSrc"
                :src="avatarSrc"
                alt="avatar"
              />
              <span v-else class="text-weight-medium">{{ avatarLetter }}</span>
            </q-avatar>
            <span class="q-mr-sm">{{ username }}</span>
            <q-icon name="eva-log-out-outline" />
            <q-tooltip>Logout</q-tooltip>
          </q-btn>
        </template>
      </div>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../store/auth";

type RouteLike = string | Record<string, any>;
const auth = useAuthStore();

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

/* ---------- username + avatar (only when authed & ready) ---------- */
const emailPrefix   = computed(() => auth.user?.email?.split("@")[0] ?? "");
const firstName     = computed(() => (auth.user?.displayName?.split(" ")[0] ?? "").trim());
const username      = computed(() =>
  auth.ready && auth.isAuthenticated ? (firstName.value || emailPrefix.value) : ""
);
const avatarSrc     = computed(() =>
  auth.ready && auth.isAuthenticated ? (auth.user?.photoURL || "") : ""
);
const avatarLetter  = computed(() =>
  (username.value?.[0] || "S").toUpperCase()
);

/* ---------- tabs active ---------- */
function tooltipText(r: RouteLike) {
  if (typeof r === "string") return `Route: ${r}`;
  const x = r as any;
  const parts: string[] = [];
  if (x?.name) parts.push(`name=${x.name}`);
  if (x?.path) parts.push(`path=${x.path}`);
  if (x?.params) parts.push(`params=${JSON.stringify(x.params)}`);
  if (x?.query) parts.push(`query=${JSON.stringify(x.query)}`);
  return parts.length ? `Route: ${parts.join(" · ")}` : "Navigate";
}

watch(
  () => route.fullPath,
  () => {
    const match = normalizedTabs.value.find((t) => {
      const r = t.route as any;
      if (typeof r === "string") return route.path === r;
      if (r?.name) return route.name === r.name;
      if (r?.path) return route.path === r.path;
      return false;
    });
    if (match) current.value = match.name;
  },
  { immediate: true }
);

/* ---------- logout (no navigation) ---------- */
async function onLogout() {
  await auth.signOut(); // store handles user clearing + dialog opening
}
</script>

<style scoped>
.layout-header {
  background-color: var(--header-color) !important;
}
</style>