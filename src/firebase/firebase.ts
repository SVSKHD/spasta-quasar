// src/firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // 👈 RTDB
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);           // 👈 export RTDB instance
export const db   = getFirestore(app);         

setPersistence(auth, browserLocalPersistence).catch(() => { /* ignore */ });

export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);

/** Resolve once, on the FIRST auth state (startup). */
export function waitForAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

// Friendly wrapper to keep your existing imports
export function onAuthUserChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export { onAuthStateChanged };