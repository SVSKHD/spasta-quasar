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
          dense flat round icon="eva-close-outline"
          @click="close('cancel')"
        />
      </q-card-section>

      <!-- Error banner (right below title) -->
      <q-card-section v-if="showErrorBlock" class="q-pt-sm q-pb-none">
        <!-- custom error slot wins -->
        <slot name="error">
          <q-banner
            rounded
            dense
            inline-actions
            class="bg-negative text-white"
          >
            <div v-if="errors?.length">
              <div class="q-mb-xs text-weight-medium">{{ errorHeading }}</div>
              <ul class="q-pl-md q-mt-none q-mb-none">
                <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
              </ul>
            </div>
            <div v-else>
              {{ errorMessage || 'Something went wrong. Please try again.' }}
            </div>
          </q-banner>
        </slot>
      </q-card-section>

      <!-- Body -->
      <q-card-section class="q-pt-md">
        <template v-if="type === 'prompt'">
          <div class="text-body1 q-mb-md">{{ message }}</div>
        </template>
        <template v-else>
          <slot />
        </template>
      </q-card-section>

      <!-- Footer / Actions -->
      <q-card-actions align="right" class="q-gutter-sm">
        <template v-if="type === 'prompt'">
          <q-btn :label="cancelLabel" color="negative" flat dense @click="onCancel" />
          <q-btn :label="confirmLabel" color="dark" unelevated dense @click="onConfirm" />
        </template>

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
  modelValue: boolean;
  type?: DialogType;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  actions?: Action[];
  persistent?: boolean;
  seamless?: boolean;
  maximized?: boolean;
  position?: Position;
  width?: number | string;
  closable?: boolean;

  /** --- Error props --- */
  error?: boolean;             // toggles error block
  errorMessage?: string;       // single message
  errors?: string[];           // multiple messages (array)
  errorHeading?: string;       // optional heading above list
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
  width: typeof props.width === "number" ? `${props.width}px` : props.width || "520px",
}));

/** Show error block if: error=true OR errors has items OR errorMessage provided */
const showErrorBlock = computed(
  () => !!(props.error || (props.errors && props.errors.length) || props.errorMessage)
);

function close(kind: "confirm" | "cancel") {
  emit("update:modelValue", false);
  if (kind === "confirm") emit("confirm");
  if (kind === "cancel") emit("cancel");
}
function onConfirm() { close("confirm"); }
function onCancel() { close("cancel"); }
function onAction(a: Action) {
  emit("action", a);
  if (typeof a.onClick === "function") a.onClick();
}
</script>