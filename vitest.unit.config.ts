import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['apps/api/tests/unit/**/*.test.ts', 'apps/web/tests/**/*.test.ts'] } });
