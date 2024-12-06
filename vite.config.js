import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['ammo.js']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    middleware: [
      function wasmMiddleware(req, res, next) {
        if (req.url.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
        }
        next();
      }
    ]
  },
  build: {
    rollupOptions: {
      external: [/^ammo\.js/]
    }
  }
});