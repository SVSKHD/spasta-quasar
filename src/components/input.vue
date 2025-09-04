<template>
  <div class="q-pa-sm">
    <q-input
      v-model="model"
      :type="type"
      :input-class="inputClass"
      :label="label"
      :hint="hint"
      outlined
      dense
      :color="color"    
      :bg-color="bgColor"
      :disable="disable"
      :readonly="readonly"
      :label-color="labelColor"
    >
      <!-- optional icon -->
      <template v-if="icon" #prepend>
        <q-icon :name="icon" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  type?: string;
  label?: string;
  hint?: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  disable?: boolean;
  readonly?: boolean;
  inputClass?: string;
  labelColor?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// local v-model
const model = ref(props.modelValue ?? '');

watch(
  () => props.modelValue,
  (v) => {
    if (v !== model.value) model.value = v ?? '';
  }
);

watch(model, (v) => {
  emit('update:modelValue', v);
});
</script>