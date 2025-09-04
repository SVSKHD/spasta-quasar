<template>
  <q-list :bordered="bordered" :separator="separator" class="rounded-borders">
    <q-expansion-item
      v-for="it in normalizedItems"
      :key="it.id"
      :group="accordion ? groupId : void 0"
      expand-icon="keyboard_arrow_down"
      switch-toggle-side
      dense
      v-model="openMap[it.id]"
      :header-class="'bg-primary text-white rounded-borders q-my-xs'"
      class="overflow-hidden"
      @update:model-value="(val) => onToggle(it, val)"
    >
      <!-- Custom header -->
      <template #header>
        <div class="row items-center full-width q-py-sm q-px-md">
          <div class="row items-center col">
            <q-icon
              v-if="it.icon"
              :name="it.icon"
              class="q-mr-sm"
              size="20px"
            />
            <div class="column">
              <div class="text-body1 text-weight-medium">{{ it.label }}</div>
              <div v-if="it.caption" class="text-caption text-grey-3">
                {{ it.caption }}
              </div>
            </div>
          </div>

          <!-- Right-side quick actions (optional) -->
          <div class="row items-center q-gutter-xs">
            <slot name="header-actions" :item="it">
              <q-btn
                v-for="(a, i) in it.actions || []"
                :key="a.id ?? i"
                :icon="a.icon"
                :label="a.label"
                :color="a.color || 'white'"
                flat
                dense
                @click.stop="onAction(it, a)"
              />
            </slot>
          </div>
        </div>
      </template>

      <!-- Body -->
      <q-card flat class="bg-primary text-white">
        <q-card-section class="q-pt-none">
          <slot name="body" :item="it">
            <div v-if="it.html" v-html="it.html" />
            <div v-else>{{ it.content }}</div>
          </slot>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";

type Action = {
  id?: string | number;
  icon?: string;
  label?: string;
  color?: string;
  onClick?: (item?: AccordionItem) => void | Promise<void>;
};

export type AccordionItem = {
  id: string | number;
  label: string;
  caption?: string;
  icon?: string;
  content?: string; // simple text
  html?: string; // optional raw HTML
  actions?: Action[]; // header-right buttons
};

const props = defineProps<{
  items: AccordionItem[];
  accordion?: boolean; // one-at-a-time
  defaultOpenedIds?: (string | number)[];
  bordered?: boolean;
  separator?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle", payload: { item: AccordionItem; opened: boolean }): void;
  (e: "action", payload: { item: AccordionItem; action: Action }): void;
  (e: "update:openedIds", opened: (string | number)[]): void;
}>();

// Stable group id for "accordion" mode
const groupId = `spasta-acc-${Math.random().toString(36).slice(2)}`;

const normalizedItems = computed(() => props.items ?? []);

// Local open state map
const openMap = reactive<Record<string | number, boolean>>({});

// initialize openMap (default opened ids)
function initOpen() {
  normalizedItems.value.forEach((it) => {
    openMap[it.id] = props.defaultOpenedIds?.includes(it.id) ?? false;
  });
}

initOpen();

// keep emit of opened ids in sync
watch(
  () => ({ items: normalizedItems.value, map: { ...openMap } }),
  () => {
    const opened = normalizedItems.value
      .filter((it) => !!openMap[it.id])
      .map((it) => it.id);
    emit("update:openedIds", opened);
  },
  { deep: true },
);

function onToggle(item: AccordionItem, opened: boolean) {
  emit("toggle", { item, opened });
}

function onAction(item: AccordionItem, action: Action) {
  emit("action", { item, action });
  if (typeof action.onClick === "function") action.onClick(item);
}
</script>

<style scoped>
/* Hover elevation for headers */
:deep(.q-expansion-item__container .q-item.q-item-type.row) {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
:deep(.q-expansion-item__container .q-item.q-item-type.row:hover) {
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}
</style>
