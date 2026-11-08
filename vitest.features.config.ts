import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['apps/api/tests/features/**/*.test.ts'], fileParallelism: false, hookTimeout: 60000, testTimeout: 30000 } });
