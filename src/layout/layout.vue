<template>
  <q-layout view="lHh Lpr lFf" class="bg-primary">
    <Header :tabs="tabs" />

    <q-page-container>
      <q-page class="flex column items-center">
        <div
          class="q-pt-sm bg-primary text-white rounded-borders content-wrap"
          :class="{ blurred: auth.ready && !auth.isAuthenticated }"
          style="max-width: 800px; width: 100%"
        >
          <!-- Optional: gate content until ready -->
          <router-view v-if="auth.ready" />
          <div v-else class="q-pa-lg" />
        </div>
      </q-page>
    </q-page-container>

    <!-- Auth gate dialog -->
    <spasta-dialog
      :model-value="auth.ready && !auth.isAuthenticated"
      :closable="false"
      :persistent="true"
      title="Welcome to Spasta.online"
      :width="420"
    >
      <div class="q-pa-md">
        <div class="text-body1 q-mb-md">Please sign in to continue.</div>
      </div>

      <template #actions>
        <q-btn
          unelevated
          color="dark"
          class="q-px-md"
          :loading="auth.loading"
          @click="auth.signInWithGoogle()"
        >
          <q-icon
            class="q-mr-sm"
            size="18px"
            name="img:https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          />
          Login with Google
        </q-btn>
      </template>
    </spasta-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Header from '../layout/header.vue';
import { useAuthStore } from '../store/auth';

const tabs = [
  { name: 'Tasks', route: '/tasks', icon: 'eva-layers-outline' },
  { name: 'Trading', route: '/trade', icon: 'eva-bar-chart-outline' },
  { name: 'Notes', route: '/notes', icon: 'eva-file-text-outline' },
  { name: 'Settings', route: '/settings', icon: 'eva-options-outline' },
];

const auth = useAuthStore();
onMounted(() => auth.init());
onBeforeUnmount(() => auth.dispose());
</script>

<style scoped>
.blurred {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
  transition: filter .2s ease;
}
</style>