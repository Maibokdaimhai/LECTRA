import { defineConfig } from '@playwright/test';
import features from './playwright.features.config.js';

// Run `npm run build` first. Use the real production frontend without development
// HMR requests interfering with the deliberately held session response.
export default defineConfig({
  ...features,
  testMatch: 'logout-csrf-rotation.spec.ts',
  projects: features.projects!.filter(project => ['chromium-wide', 'chromium-narrow'].includes(project.name!)),
  webServer: {
    ...features.webServer,
    command: 'node node_modules/vite/bin/vite.js preview apps/web --host 127.0.0.1 --port 4174 --strictPort',
    env: { API_PROXY_TARGET: 'http://127.0.0.1:3102' },
    url: 'http://127.0.0.1:4174', reuseExistingServer: false, timeout: 30000
  }
});
