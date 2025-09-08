<!-- src/views/notes.vue -->
<template>
  <div class="q-gutter-lg">
    <div class="row items-center q-gutter-sm">
      <h4 class="text-white q-mr-sm q-mb-none">Notes</h4>
    </div>

    <q-btn
      color="secondary"
      class="align-right"
      label="Create category"
      @click="openCreateDialog"
    />

    <!-- Categories as tabs -->
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
          <!-- Category header -->
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1">{{ c.title }}</div>
              <div class="text-body2 text-grey-4">{{ c.description }}</div>
            </div>

            <div class="row items-center q-gutter-sm">
              <q-btn
                dense
                outline
                color="secondary"
                icon="eva-edit-outline"
                label="Edit category"
                @click="openEditDialog(c)"
              />
              <q-btn
                dense
                outline
                color="secondary"
                icon="eva-plus-outline"
                label="Add note"
                @click="openEditorFor(c.id)"
              />
            </div>
          </div>

          <!-- Editor (shown only for this category when toggled) -->
          <div v-if="editorOpenId === c.id" class="q-mb-md">
            <spasta-editor v-model="drafts[c.id]" :readonly="false" />
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn
                dense
                flat
                color="negative"
                icon="eva-close-outline"
                label="Cancel"
                @click="cancelEditor()"
              />
              <q-btn
                dense
                unelevated
                color="dark"
                icon="eva-checkmark-outline"
                label="Save"
                :loading="notes.saving"
                :disable="!canSave(c.id)"
                @click="saveNote(c.id)"
              />
            </div>
          </div>

          <!-- Notes list for this category -->
          <q-separator spaced class="bg-grey-7" />

          <div v-if="notesByCategory(c.id).length">
            <q-list bordered class="rounded-borders">
              <q-item
                v-for="n in notesByCategory(c.id)"
                :key="n.id"
                clickable
                class="bg-dark text-white q-mb-xs rounded-borders"
              >
                <q-item-section>
                  <div class="text-body2">
                    {{ stripHtml(n.content).slice(0, 140) }}
                    <span v-if="n.content.length > 140">…</span>
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">
                    {{ humanTime(n.createdAt || n.updatedAt) }}
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat dense round
                    icon="eva-trash-2-outline"
                    color="negative"
                    @click.stop="removeNote(n.id)"
                  >
                    <q-tooltip>Delete note</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <q-banner v-else class="bg-secondary text-white rounded-borders q-mt-md">
            No notes yet in <b>{{ c.title }}</b>.
          </q-banner>
        </q-card>
      </template>
    </spasta-tabs>

    <!-- Empty state -->
    <q-banner v-else class="bg-secondary text-white rounded-borders">
      No categories yet. Click “Create category” to add one.
    </q-banner>

    <!-- Create/Edit Category Dialog (reused) -->
    <spasta-dialog
      v-model="open"
      :title="dialogTitle"
      :width="560"
      :closable="true"
      :error="!!cat.error"
      :error-message="cat.error || ''"
    >
      <div class="q-gutter-md">
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
          type="textarea"
          bgColor="secondary"
          label="Description"
          color="white"
          labelColor="white"
          inputClass="text-white"
        />
      </div>

      <template #actions>
        <q-btn
          flat color="negative"
          icon="eva-close-outline"
          label="Cancel"
          @click="closeDialog"
        />
        <q-btn
          flat color="secondary"
          icon="eva-refresh-outline"
          label="Reset"
          @click="resetForm"
        />
        <q-btn
          unelevated
          color="dark"
          :icon="isEditing ? 'eva-save-outline' : 'eva-checkmark-outline'"
          :label="isEditing ? 'Update' : 'Create'"
          :disable="!isValid || cat.saving"
          :loading="cat.saving"
          @click="submitCategory"
        />
      </template>
    </spasta-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useCategoriesStore } from '../store/category';
import { useNotesStore } from '../store/notes';

const cat   = useCategoriesStore();
const notes = useNotesStore();

/* ---------------------- Tabs / categories ---------------------- */
const categories = computed(() => cat.items);
const tabs = computed(() =>
  categories.value.map(c => ({ name: c.id, label: c.title, icon: 'eva-book-outline' }))
);

const activeTab = ref<string>('');
watch(categories, (list) => {
  if (!list.length) { activeTab.value = ''; return; }
  if (!list.find(c => c.id === activeTab.value)) {
    activeTab.value = list[0].id;
  }
}, { immediate: true });

/* Close the note editor when switching tabs */
watch(activeTab, () => { editorOpenId.value = null; });

/* ---------------------- Create / Edit category dialog ---------------------- */
const open = ref(false);
const isEditing = ref(false);
const editId = ref<string | null>(null);

const form = reactive({ title: '', description: '' });
const isValid = computed(() => form.title.trim().length > 0);
const dialogTitle = computed(() => isEditing.value ? 'Edit Category' : 'Create New Category');

function resetForm() {
  form.title = '';
  form.description = '';
}
function closeDialog() {
  open.value = false;
  // Delay clearing edit context slightly so dialog close animation uses current title/labels
  setTimeout(() => { isEditing.value = false; editId.value = null; resetForm(); }, 0);
}

function openCreateDialog() {
  isEditing.value = false;
  editId.value = null;
  resetForm();
  open.value = true;
}

function openEditDialog(c: { id: string; title: string; description?: string }) {
  isEditing.value = true;
  editId.value = c.id;
  form.title = c.title || '';
  form.description = c.description || '';
  open.value = true;
}

async function submitCategory() {
  if (!isValid.value || cat.saving) return;
  try {
    if (isEditing.value && editId.value) {
      await cat.update(editId.value, {
        title: form.title.trim(),
        description: (form.description || '').trim()
      });
      // keep the same active tab (edited category)
      activeTab.value = editId.value;
    } else {
      await cat.create({
        title: form.title.trim(),
        description: (form.description || '').trim()
      });
      // Ensure we see the latest list; your store also observes in realtime
      await cat.fetchOnce();
      // Move to the first tab (new one will be top if you order by createdAt desc)
      if (categories.value.length) activeTab.value = categories.value[0].id;
    }
    closeDialog();
  } catch (e) {
    // Error banner is shown via :error / :error-message from store
    console.error('Category save failed:', e);
  }
}

/* ---------------------- Notes per-category editor ---------------------- */
const editorOpenId = ref<string | null>(null);
const drafts = ref<Record<string, string>>({}); // categoryId -> draft HTML

function openEditorFor(categoryId: string) {
  editorOpenId.value = categoryId;
  if (!drafts.value[categoryId]) drafts.value[categoryId] = '';
}
function cancelEditor() { editorOpenId.value = null; }
function canSave(categoryId: string) {
  return (drafts.value[categoryId] || '').trim().length > 0 && !notes.saving;
}
async function saveNote(categoryId: string) {
  const content = (drafts.value[categoryId] || '').trim();
  if (!content) return;
  try {
    await notes.addNote(categoryId, content);
    await notes.fetchOnce(); // snapshot will also refresh shortly
    drafts.value[categoryId] = '';
    editorOpenId.value = null;
  } catch (e) {
    console.error('Failed to save note:', e);
  }
}

/* ---------------------- Notes helpers ---------------------- */
const notesByCategory = (categoryId: string) =>
  notes.items
    .filter(n => n.categoryId === categoryId)
    .sort((a, b) => {
      const aTs = (a.createdAt?.seconds ?? (a as any)._clientCreatedAt ?? 0) as number;
      const bTs = (b.createdAt?.seconds ?? (b as any)._clientCreatedAt ?? 0) as number;
      return bTs - aTs;
    });

function stripHtml(html: string) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || div.innerText || '').trim();
}
function humanTime(ts: any) {
  try {
    const d =
      ts?.toDate?.() ??
      (typeof ts === 'number' ? new Date(ts) : ts ? new Date(ts) : null);
    return d ? d.toLocaleString() : '';
  } catch { return ''; }
}

/* ---------------------- Live updates + prime fetch ---------------------- */
onMounted(async () => {
  cat.startObserving();
  if (typeof notes.startObserving === 'function') notes.startObserving();
  await Promise.all([cat.fetchOnce(), notes.fetchOnce()]);
});
onBeforeUnmount(() => {
  cat.stopObserving();
  if (typeof notes.stopObserving === 'function') notes.stopObserving();
});
</script>