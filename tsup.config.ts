import { defineConfig } from 'tsup';
import { copyFileSync } from 'node:fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  injectStyle: false,
  onSuccess: async () => {
    // tsup doesn't copy non-imported assets. Ship styles.css alongside
    // the JS so consumers can `import 'streamfield/styles.css'`.
    copyFileSync('src/styles.css', 'dist/styles.css');
  },
});
