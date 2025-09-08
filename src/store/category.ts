// src/stores/categories.ts
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

export interface Category {
  id: string;
  title: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
  userId?: string;
}

function normalize(docs: any[]): Category[] {
  return (docs ?? []).filter(Boolean).map(d => ({
    id: String(d.id),
    title: (d.title ?? '').toString(),
    description: d.description ?? '',
    createdAt: d.createdAt ?? null,
    updatedAt: d.updatedAt ?? null,
    userId: d.userId ?? null
  }));
}

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref<Category[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  let unsub: Unsubscribe | null = null;

  const total = computed(() => items.value.length);
  const byTitle = (q: string) =>
    items.value.filter(c => c.title.toLowerCase().includes(q.toLowerCase()));

  const coll = 'categories';

  async function fetchOnce() {
    loading.value = true; error.value = null;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { items.value = []; return; }
      const docs = await listDocuments<Category>(
        coll,
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      items.value = normalize(docs as any[]);
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to fetch categories';
    } finally {
      loading.value = false;
    }
  }

  function startObserving() {
    stopObserving();
    const uid = auth.currentUser?.uid;
    if (!uid) { items.value = []; return; }
    unsub = observeCollection<Category>(
      coll,
      (docs) => { items.value = normalize(docs as any[]); },
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
  }

  function stopObserving() { if (unsub) { unsub(); unsub = null; } }

  async function create(payload: { title: string; description?: string }) {
    saving.value = true; error.value = null;
    try {
      await saveDocument<Category>(coll, {
        title: payload.title.trim(),
        description: (payload.description ?? '').trim()
      });
      await fetchOnce();
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to create category';
      throw e;
    } finally { saving.value = false; }
  }

  async function update(id: string, patch: Partial<Omit<Category, 'id'>>) {
    saving.value = true; error.value = null;
    try {
      await saveDocument<Category>(coll, patch as Category, { id, merge: true });
      await fetchOnce();
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to update category';
      throw e;
    } finally { saving.value = false; }
  }

  async function remove(id: string) {
    saving.value = true; error.value = null;
    try {
      await deleteDocFs(coll, id);
      await fetchOnce();
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete category';
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

  return { items, loading, saving, error, total, byTitle, fetchOnce, startObserving, stopObserving, create, update, remove, clear };
});