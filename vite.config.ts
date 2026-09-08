import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts'] }, build: { rollupOptions: { output: { manualChunks: { phaser: ['phaser'], three: ['three'] } } } } });
