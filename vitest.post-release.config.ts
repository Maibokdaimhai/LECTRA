import { defineConfig } from 'vitest/config';

// Separate from the historical feature/release suites: this suite owns one new,
// explicitly allowlisted database and a test-only unsupported-mode enum fixture.
export default defineConfig({ test: {
  environment: 'node', include: ['apps/api/tests/post-release/**/*.test.ts'],
  fileParallelism: false, hookTimeout: 60000, testTimeout: 30000
} });
