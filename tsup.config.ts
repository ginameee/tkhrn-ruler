import { defineConfig } from 'tsup';

export default defineConfig([
  // Library build
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  // CLI build
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
