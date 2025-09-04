<template>
  <div class="q-pa-md q-gutter-sm">
    <q-editor
      v-model="local"
      :dense="q.screen.lt.md"
      :toolbar="toolbar"
      :fonts="fonts"
      :definitions="definitions"
      class="bg-primary text-white rounded-borders white-border"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'custom', payload?: any): void;
}>();

const q = useQuasar();

// v-model wiring
const local = ref(
  props.modelValue ??
    '<pre>Check out the two different types of dropdowns in each of the "Align" buttons.</pre>'
);

watch(
  () => props.modelValue,
  (v) => {
    if (typeof v === 'string' && v !== local.value) local.value = v;
  }
);
watch(local, (v) => emit('update:modelValue', v));

// toolbar (same structure you had)
const toolbar = computed(() => [
  [
    {
      label: q.lang.editor.align,
      icon: q.iconSet.editor.align,
      fixedLabel: true,
      list: 'only-icons',
      options: ['left', 'center', 'right', 'justify']
    },
    {
      label: q.lang.editor.align,
      icon: q.iconSet.editor.align,
      fixedLabel: true,
      options: ['left', 'center', 'right', 'justify']
    }
  ],
  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
  ['token', 'hr', 'link', 'custom_btn'],
  ['print', 'fullscreen'],
  [
    {
      label: q.lang.editor.formatting,
      icon: q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
    },
    {
      label: q.lang.editor.fontSize,
      icon: q.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: 'no-icons',
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
    },
    {
      label: q.lang.editor.defaultFont,
      icon: q.iconSet.editor.font,
      fixedIcon: true,
      list: 'no-icons',
      options: [
        'default_font',
        'arial',
        'arial_black',
        'comic_sans',
        'courier_new',
        'impact',
        'lucida_grande',
        'times_new_roman',
        'verdana'
      ]
    },
    'removeFormat'
  ],
  ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
  ['undo', 'redo'],
  ['viewsource']
]);

// fonts mapping
const fonts = {
  arial: 'Arial',
  arial_black: 'Arial Black',
  comic_sans: 'Comic Sans MS',
  courier_new: 'Courier New',
  impact: 'Impact',
  lucida_grande: 'Lucida Grande',
  times_new_roman: 'Times New Roman',
  verdana: 'Verdana'
};

// custom button behaviors
const definitions = {
  token: {
    tip: 'Insert token',
    icon: 'code',
    handler: () => {
      insertAtCursor('{{ token }}');
    }
  },
  custom_btn: {
    tip: 'Custom Action',
    icon: 'flash_on',
    handler: () => {
      // Example: wrap selection in <mark>
      wrapSelectionWith('<mark>', '</mark>');
      emit('custom', { action: 'mark' });
    }
  }
} as const;

// helpers to insert/wrap content
function insertAtCursor(text: string) {
  // QEditor processes execCmd internally; use document.execCommand fallback
  // This is a pragmatic approach; for complex insertions use QEditor refs & API.
  document.execCommand('insertText', false, text);
}

function wrapSelectionWith(before: string, after: string) {
  // try to wrap selected text
  const selection = window.getSelection?.();
  const selectedText = selection?.toString() ?? '';
  if (selectedText) {
    document.execCommand('insertHTML', false, `${before}${selectedText}${after}`);
  } else {
    document.execCommand('insertHTML', false, `${before}${after}`);
  }
}
</script>