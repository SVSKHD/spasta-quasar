// src/firebase/firebaseFirestoreOperations.ts
import {
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  query as fsQuery,
  onSnapshot,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
  type Query
} from 'firebase/firestore';
import {
  orderBy,
  where,
  limit,
  startAfter,
  endBefore,
  endAt,
  startAt
} from 'firebase/firestore';
import { db, auth } from './firebase';

export type Id = string;


export interface WithMeta<T> extends T {
  id: Id;
  createdAt?: any;
  updatedAt?: any;
}

type SaveOptions = {
  id?: Id;
  merge?: boolean;
};

/* -------------------- CRUD -------------------- */


export async function saveDocument<T extends Record<string, any>>(
  collectionPath: string,
  data: T,
  options: { id?: string; merge?: boolean } = {}
) {
  const { id, merge = true } = options;
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  if (id) {
    const ref = doc(db, collectionPath, id);
    await setDoc(ref, { ...data, userId: uid, updatedAt: serverTimestamp() }, { merge });
    return { id, ...data } as any;
  } else {
    const ref = await addDoc(collection(db, collectionPath), {
      ...data,
      userId: uid,                       // ← REQUIRED by your rules
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, ...data } as any;
  }
}

export async function deleteDocument(collectionPath: string, id: Id): Promise<void> {
  await deleteDoc(doc(db, collectionPath, id));
}

export async function getDocument<T = DocumentData>(
  collectionPath: string,
  id: Id
): Promise<WithMeta<T> | null> {
  const snap = await getDoc(doc(db, collectionPath, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

export async function listDocuments<T = DocumentData>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<WithMeta<T>[]> {
  const base = collection(db, collectionPath);   // ✅ correct order
  const q = constraints.length ? fsQuery(base, ...constraints) : base;
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

/* --------------- REALTIME LISTENERS --------------- */

export function observeDocument<T = DocumentData>(
  collectionPath: string,
  id: Id,
  cb: (doc: WithMeta<T> | null) => void
): Unsubscribe {
  const ref = doc(db, collectionPath, id);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...(snap.data() as T) }) : null);
  });
}

export function observeCollection<T = DocumentData>(
  collectionPath: string,
  cb: (docs: WithMeta<T>[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const base = collection(db, collectionPath);   // ✅ correct order
  const q = constraints.length ? fsQuery(base, ...constraints) : base;
  return onSnapshot(q, (snap) => {
    const out = snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
    cb(out);
  });
}

/* --------------- QUERY HELPERS --------------- */

export function buildQuery(collectionPath: string, ...constraints: QueryConstraint[]): Query<DocumentData> {
  return fsQuery(collection(db, collectionPath), ...constraints); // ✅
}

export { orderBy, where, limit, startAfter, endBefore, endAt, startAt };