<template>
  <h4 class="text-white q-mb-md">Notes</h4>

  <q-btn label="Create category" color="secondary" @click="open = true" />
  <q-space class="q-pb-lg" />

  <spasta-dialog
    v-model="open"
    title="Create New Category"
    :closable="true"
    :width="560"
  >
    <div class="q-gutter-md">
      <!-- keep spasta-input parameters untouched -->
      <spasta-input
        v-model="form.title"
        type="text"
        bgColor="secondary"
        label="Title"
        color="white"
        labelColor="white"
        inputClass="text-white"
      />
      <spasta-input
        v-model="form.description"
        bgColor="secondary"
        type="textarea"
        label="Description"
        color="white"
        labelColor="white"
        inputClass="text-white"
      />
    </div>

    <!-- custom actions slot -->
    <template #actions>
      <q-btn flat color="negative" icon="eva-close-outline" label="Cancel" @click="open = false" />
      <q-btn flat color="secondary" icon="eva-refresh-outline" label="Reset" @click="resetForm" />
      <q-btn
        unelevated
        color="dark"
        icon="eva-checkmark-outline"
        label="Create"
        :disable="!isValid"
        @click="submit"
      />
    </template>
  </spasta-dialog>

  <!-- Notes editor below -->
  <spasta-editor v-model="noteContent" :readonly="false" />
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';

const open = ref(false);
const form = reactive({ title: '', description: '' });

const isValid = computed(() => form.title.trim().length > 0);

function resetForm() {
  form.title = '';
  form.description = '';
}

function submit() {
  if (!isValid.value) return;
  // TODO: handle persistence (API/store)
  console.log('New category:', form);
  open.value = false;
  resetForm();
}

const noteContent = ref<string>(
  'This is a sample note. You can edit it using the rich text editor below.'
);
</script>