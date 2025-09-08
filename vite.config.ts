// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ mode }) => ({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar(),
    // DevTools only in dev
    ...(mode === 'development' ? [VueDevTools()] : []),
  ],
  define: {
    __VUE_PROD_DEVTOOLS__: false, // no devtools in prod
  },
  server: { port: 3000, open: true },
}));