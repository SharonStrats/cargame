import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('/three/')) {
            return 'three'
          }

          if (id.includes('/cannon-es/')) {
            return 'physics'
          }

          if (id.includes('/lit/')) {
            return 'lit'
          }

          if (id.includes('socket.io-client')) {
            return 'socket'
          }

          return undefined
        },
      },
    },
  },
})