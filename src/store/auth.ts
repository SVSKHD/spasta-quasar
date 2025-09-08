// src/store/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'firebase/auth';
import { auth, onAuthUserChanged, signInWithGoogle, signOutUser } from '../firebase/firebase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const ready = ref(false); // <- becomes true after first auth callback
  let unsub: null | (() => void) = null;

  const isAuthenticated = computed(() => !!user.value);

  function init() {
    if (unsub) return;
    unsub = onAuthUserChanged((u) => {
      user.value = u;
      ready.value = true;       // <- important
    });
  }

    function hydrateFromBootstrap(initialUser: User | null) {
    user.value = initialUser;
    ready.value = true;

    // Attach ongoing listener if not already attached
    if (!unsub) {
      unsub = onAuthUserChanged((u) => {
        user.value = u;
        // ready stays true; we already passed bootstrap stage
      });
    }
  }

  async function signInWithGoogleAction() {
    loading.value = true;
    try { await signInWithGoogle(); } finally { loading.value = false; }
  }

  async function signOut() {
    loading.value = true;
    try { await signOutUser(); }
    finally { loading.value = false; /* user becomes null via listener */ }
  }

  function dispose() { if (unsub) { unsub(); unsub = null; } }

  return { user, loading, ready, isAuthenticated, init, dispose, signInWithGoogle: signInWithGoogleAction, signOut, hydrateFromBootstrap };
});