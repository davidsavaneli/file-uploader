import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    lib: {
      entry: resolve(root, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    // One stylesheet for the whole library (dist/styles.css) — consumers import it once.
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      // React is a peer — never bundled. The regexes also cover `react/jsx-runtime` and `react-dom/client`.
      external: [/^react($|\/)/, /^react-dom($|\/)/],
      output: {
        // Named exports only, so the CJS build lands `FileUploader` on `exports.FileUploader` predictably.
        exports: 'named',
        assetFileNames: (info) => {
          const name = info.name ?? info.names?.[0] ?? ''
          return name.endsWith('.css') ? 'styles.css' : '[name][extname]'
        },
      },
    },
  },
})
