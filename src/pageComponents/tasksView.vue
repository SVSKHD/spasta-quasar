<!-- src/views/tasks.vue -->
<template>
  <div class="q-gutter-lg">
    <h4 class="text-white q-mb-md">Tasks</h4>

    <spasta-tabs
      v-if="tabs.length"
      v-model="activeTab"
      :tabs="tabs"
      :keep-alive="true"
      align="left"
    >
      <!-- One named slot per category -->
      <template
        v-for="c in categories"
        :key="c.id"
        #[`panel-${c.id}`]
      >
        <q-card flat class="bg-primary text-white q-pa-md rounded-borders">
          <div class="text-subtitle1 q-mb-xs">{{ c.title }}</div>
          <div class="text-body2 text-grey-4 q-mb-md">{{ c.description }}</div>

          <!-- Put your real tasks UI for this category here -->
          <q-banner class="bg-secondary text-white rounded-borders">
            Tasks for <b>{{ c.title }}</b> will appear here.
          </q-banner>
        </q-card>
      </template>
    </spasta-tabs>

    <!-- Empty state -->
    <q-banner v-else class="bg-secondary text-white rounded-borders">
      No categories yet. Create one in Notes to get started.
    </q-banner>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useCategoriesStore } from '../store/category';

const cat = useCategoriesStore();

const categories = computed(() => cat.items);

// Map categories -> tabs for <spasta-tabs>
const tabs = computed(() =>
  categories.value.map(c => ({
    name: c.id,           // unique id (required)
    label: c.title,       // tab label
    icon: 'eva-list-outline'
  }))
);

// Keep a valid active tab as categories change
const activeTab = ref<string>('');
watch(categories, (list) => {
  if (!list.length) { activeTab.value = ''; return; }
  if (!list.find(c => c.id === activeTab.value)) {
    activeTab.value = list[0].id;
  }
}, { immediate: true });

onMounted(async () => {
  // realtime + prime fetch
  cat.startObserving();
  await cat.fetchOnce();
});

onBeforeUnmount(() => {
  cat.stopObserving();
});
</script>