import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar(),
    VueDevTools({
      enabled: true,
      appendTo: 'body'
    })
  ],
  define: {
    __VUE_PROD_DEVTOOLS__: true
  },
  server: {
    port: 3000,
    open: true
  }
})