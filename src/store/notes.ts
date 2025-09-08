// src/stores/notes.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Unsubscribe } from 'firebase/firestore';
import { auth } from '../firebase/firebase';
import {
  saveDocument,
  deleteDocument as deleteDocFs,
  listDocuments,
  observeCollection,
  where,
  orderBy
} from '../firebase/fireabseOperations';

export interface Note {
  id: string;
  categoryId: string;
  content: string;
  createdAt?: any;
  updatedAt?: any;
  userId?: string;
  // local-only flags/fields (not persisted)
  _optimistic?: boolean;
  _clientCreatedAt?: number;
}

function normalize(docs: any[]): Note[] {
  return (docs ?? []).filter(Boolean).map(d => ({
    id: String(d.id),
    categoryId: (d.categoryId ?? '').toString(),
    content: (d.content ?? '').toString(),
    createdAt: d.createdAt ?? null,
    updatedAt: d.updatedAt ?? null,
    userId: d.userId ?? null
  }));
}

export const useNotesStore = defineStore('notes', () => {
  const items = ref<Note[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  let unsub: Unsubscribe | null = null;

  const totalNotes = computed(() => items.value.length);

  const notesByCategory = (categoryId: string) =>
    items.value
      .filter(n => n.categoryId === categoryId)
      .sort((a, b) => {
        // Prefer Firestore createdAt; fall back to client timestamp; newest first
        const at =
          (a.createdAt?.seconds ?? a._clientCreatedAt ?? 0) as number;
        const bt =
          (b.createdAt?.seconds ?? b._clientCreatedAt ?? 0) as number;
        return bt - at;
      });

  const coll = 'notes';

  async function fetchOnce() {
    loading.value = true; error.value = null;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { items.value = []; return; }
      const docs = await listDocuments<Note>(
        coll,
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      items.value = normalize(docs as any[]);
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to fetch notes';
    } finally {
      loading.value = false;
    }
  }

  function startObserving() {
    stopObserving();
    const uid = auth.currentUser?.uid;
    if (!uid) { items.value = []; return; }
    unsub = observeCollection<Note>(
      coll,
      (docs) => {
        // Replace with server truth to clear any optimistic entries
        items.value = normalize(docs as any[]);
      },
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
  }

  function stopObserving() { if (unsub) { unsub(); unsub = null; } }

  async function addNote(categoryId: string, content: string) {
    saving.value = true; error.value = null;
    // --- optimistic insert ---
    const tempId = `temp_${Math.random().toString(36).slice(2)}`;
    const clientNow = Date.now();
    const optimistic: Note = {
      id: tempId,
      categoryId,
      content,
      _optimistic: true,
      _clientCreatedAt: clientNow
    };
    // Put at top so user sees it instantly
    items.value = [optimistic, ...items.value];

    try {
      
      await saveDocument<Note>(coll, { categoryId, content });
    } catch (e: any) {
 
      items.value = items.value.filter(n => n.id !== tempId);
      error.value = e?.message ?? 'Failed to create note';
      throw e;
    } finally { saving.value = false; }
  }

  async function updateNote(id: string, patch: Partial<Omit<Note, 'id'>>) {
  // guard: nothing to update
  if (!patch || Object.keys(patch).length === 0) return;

  saving.value = true;
  error.value = null;

  // --- optimistic update ---
  const idx = items.value.findIndex(n => n.id === id);
  const prev = idx > -1 ? { ...items.value[idx] } : null;
  if (idx > -1) {
    items.value[idx] = { ...items.value[idx], ...patch };
  }

  try {
    await saveDocument<Note>(coll, patch as Note, { id, merge: true });
    // If you are NOT observing, uncomment:
    // await fetchOnce();
  } catch (e: any) {
    // rollback optimistic update
    if (idx > -1 && prev) items.value[idx] = prev;
    error.value = e?.message ?? 'Failed to update note';
    throw e;
  } finally {
    saving.value = false;
  }
}

  async function deleteNote(id: string) {
    saving.value = true; error.value = null;
    try {
      await deleteDocFs(coll, id);
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete note';
      throw e;
    } finally { saving.value = false; }
  }

  function clear() {
    items.value = [];
    loading.value = false;
    saving.value = false;
    error.value = null;
    stopObserving();
  }

  return {
    items, loading, saving, error,
    totalNotes, notesByCategory,
    fetchOnce, startObserving, stopObserving,
    addNote, updateNote, deleteNote, clear
  };
});