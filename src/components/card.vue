<template>
  <q-card
    class="q-pa-md bg-primary rounded-borders transition-all cursor-pointer card-hover"
  >
    <!-- Card section (content) -->
    <q-card-section>
      <div class="text-h6 q-mb-sm text-white">
        {{ title }}
      </div>
      <div class="text-body2 text-grey-2">
        <slot />
      </div>
    </q-card-section>

    <!-- Card actions (custom buttons) -->
    <q-card-actions align="right" class="q-gutter-sm">
      <slot name="actions">
        <q-btn
          v-for="(action, index) in actions"
          :key="index"
          :label="action.label"
          :icon="action.icon"
          :color="action.color || 'white'"
          flat
          dense
          @click="action.onClick"
        />
      </slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
interface Action {
  label: string;
  icon?: string;
  color?: string;
  onClick: () => void;
}

const props = defineProps<{
  title: string;
  actions?: Action[];
}>();
</script>

<style scoped>
.card-hover {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.card-hover:hover {
  /* white glow + elevation */
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}
</style>
