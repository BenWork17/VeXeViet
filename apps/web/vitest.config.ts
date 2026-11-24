import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vexeviet/types': path.resolve(__dirname, '../../packages/types/src'),
      '@vexeviet/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@vexeviet/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
