<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    :side="side"
    :width="width"
    :overlay="overlay"
    :behavior="behavior"
    :breakpoint="breakpoint"
    :elevated="elevated"
    :bordered="bordered"
    :dark="dark"
    :persistent="persistent"
    class="bg-primary text-white"
  >
    <!-- Header with line + title -->
    <div class="drawer-header q-pa-md row items-center no-wrap">
      <div class="header-line col-grow"></div>
      <div class="header-title q-ml-md text-h6">
        {{ title }}
      </div>
      <q-space />
      <q-btn
        dense
        flat
        round
        icon="eva-close-outline"
        @click="emit('close') || emit('update:modelValue', false)"
      />
    </div>

    <q-separator dark spaced inset />

    <!-- Content -->
    <q-scroll-area class="q-pa-md" style="height: calc(100% - 140px)">
      <slot />
    </q-scroll-area>

    <!-- Footer / Actions -->
    <div class="q-pa-md q-gutter-sm">
      <slot name="actions">
        <q-btn
          v-for="(a, i) in actions"
          :key="a.id ?? i"
          :label="a.label"
          :icon="a.icon"
          :color="a.color ?? 'white'"
          flat
          dense
          @click="onAction(a)"
        />
      </slot>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

type RouteLike = string | Record<string, any>;

interface DrawerAction {
  id?: string | number;
  label?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  to?: RouteLike;
  disable?: boolean;
  onClick?: () => void | Promise<void>;
  payload?: any;
}

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  side?: "left" | "right";
  width?: number;
  overlay?: boolean;
  behavior?: "default" | "desktop" | "mobile";
  breakpoint?: number;
  elevated?: boolean;
  bordered?: boolean;
  dark?: boolean;
  persistent?: boolean;
  actions?: DrawerAction[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "close"): void;
  (e: "action", action: DrawerAction): void;
}>();

function onAction(a: DrawerAction) {
  emit("action", a);
  if (typeof a.onClick === "function") a.onClick();
}
</script>

<style scoped>
.drawer-header {
  align-items: center;
}
.header-line {
  height: 2px;
  background-color: rgba(255, 255, 255, 0.4);
}
.header-title {
  font-weight: bold;
  white-space: nowrap;
}
</style>
