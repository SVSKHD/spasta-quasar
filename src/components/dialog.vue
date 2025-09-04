<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    :persistent="persistent"
    :seamless="seamless"
    :maximized="maximized"
    :position="position"
  >
    <q-card class="bg-primary text-white rounded-borders" :style="cardStyle">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn
          v-if="closable"
          dense
          flat
          round
          icon="eva-close-outline"
          @click="close('cancel')"
        />
      </q-card-section>

      <!-- Body -->
      <q-card-section class="q-pt-md">
        <template v-if="type === 'prompt'">
          <div class="text-body1 q-mb-md">
            {{ message }}
          </div>
        </template>
        <template v-else>
          <slot />
        </template>
      </q-card-section>

      <!-- Footer / Actions -->
      <q-card-actions align="right" class="q-gutter-sm">
        <!-- Prompt mode: fixed two buttons -->
        <template v-if="type === 'prompt'">
          <q-btn
            :label="cancelLabel"
            color="negative"
            flat
            dense
            @click="onCancel"
          />
          <q-btn
            :label="confirmLabel"
            color="dark"
            unelevated
            dense
            @click="onConfirm"
          />
        </template>

        <!-- Default mode: custom actions or slot -->
        <template v-else>
          <slot name="actions">
            <q-btn
              v-for="(a, i) in actions"
              :key="a.id ?? i"
              :label="a.label"
              :icon="a.icon"
              :color="a.color ?? 'secondary'"
              :text-color="a.textColor"
              :flat="a.flat ?? true"
              :unelevated="a.unelevated ?? false"
              :outline="a.outline ?? false"
              :dense="a.dense ?? true"
              :disable="a.disable"
              @click="onAction(a)"
            />
          </slot>
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

type DialogType = "prompt" | "default" | string;
type Position = "standard" | "top" | "bottom" | "left" | "right";

interface Action {
  id?: string | number;
  label?: string;
  icon?: string;
  color?: string;
  textColor?: string;
  flat?: boolean;
  outline?: boolean;
  unelevated?: boolean;
  dense?: boolean;
  disable?: boolean;
  onClick?: () => void | Promise<void>;
  payload?: any;
}

const props = defineProps<{
  modelValue: boolean; // v-model
  type?: DialogType; // 'prompt' or anything else
  title?: string;
  message?: string; // used in prompt
  confirmLabel?: string; // default 'Confirm'
  cancelLabel?: string; // default 'Cancel'
  actions?: Action[]; // used when type !== 'prompt'

  // QDialog/QCard options
  persistent?: boolean;
  seamless?: boolean;
  maximized?: boolean;
  position?: Position;
  width?: number | string; // e.g., 480 or '520px'
  closable?: boolean; // show top-right close btn
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
  (e: "action", a: Action): void;
}>();

const confirmLabel = computed(() => props.confirmLabel ?? "Confirm");
const cancelLabel = computed(() => props.cancelLabel ?? "Cancel");

const cardStyle = computed(() => ({
  width:
    typeof props.width === "number"
      ? `${props.width}px`
      : props.width || "520px",
}));

function close(kind: "confirm" | "cancel") {
  emit("update:modelValue", false);
  if (kind === "confirm") emit("confirm");
  if (kind === "cancel") emit("cancel");
}

function onConfirm() {
  close("confirm");
}

function onCancel() {
  close("cancel");
}

function onAction(a: Action) {
  emit("action", a);
  if (typeof a.onClick === "function") a.onClick();
}
</script>
