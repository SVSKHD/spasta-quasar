<template>
  <div class="spasta-tabs">
    <!-- Tab headers -->
    <q-tabs
      v-model="current"
      :align="align"
      :shrink="shrink"
      :vertical="vertical"
      class="text-white bg-primary rounded-borders"
      active-color="secondary"
      indicator-color="white"
    >
      <q-tab
        v-for="t in normalizedTabs"
        :key="t.name"
        :name="t.name"
        :icon="t.icon"
        no-caps
      >
        <q-tooltip class="bg-secondary">
          {{ t.label ?? t.name }}
        </q-tooltip>
      </q-tab>
    </q-tabs>

    <q-tab-panels
      v-model="current"
      animated
      transition-prev="jump-up"
      transition-next="jump-up"
    >
      <q-tab-panel
        v-for="t in normalizedTabs"
        :key="`panel-${t.name}`"
        :name="t.name"
        class="bg-primary text-white q-pa-md"
        :keep-alive="keepAlive"
      >
        <!-- Named slot per tab -->
        <slot :name="`panel-${t.name}`" :tab="t">
          <!-- Fallback if no slot provided -->
          <div class="text-body2">
            No content provided for <b>{{ t.label ?? t.name }}</b
            >.
          </div>
        </slot>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

export interface SpastaTab {
  name: string; // unique
  label?: string; // visible label (defaults to name)
  icon?: string; // optional quasar icon
}

const props = defineProps<{
  tabs: SpastaTab[];
  modelValue?: string; // controlled active tab
  defaultTab?: string; // uncontrolled initial tab
  align?: "left" | "center" | "right" | "justify";
  shrink?: boolean;
  vertical?: boolean;
  keepAlive?: boolean; // keep panel components alive
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "change", v: string): void;
}>();

const normalizedTabs = computed(() => props.tabs ?? []);
const firstTab = computed(() => normalizedTabs.value[0]?.name ?? "");

const current = ref<string>(
  props.modelValue ?? props.defaultTab ?? firstTab.value,
);

// keep internal state in sync with v-model
watch(
  () => props.modelValue,
  (v) => {
    if (typeof v === "string" && v !== current.value) current.value = v;
  },
);

// emit updates
watch(current, (v) => {
  emit("update:modelValue", v);
  emit("change", v);
});
</script>

<style scoped>
.spasta-tabs :deep(.q-tab) {
  transition: transform 0.15s ease;
}
.spasta-tabs :deep(.q-tab:hover) {
  transform: translateY(-1px);
}
</style>
