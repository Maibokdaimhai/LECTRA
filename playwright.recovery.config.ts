import { defineConfig, devices } from '@playwright/test';
// Isolated real-browser UI regressions with explicit HTTP fixtures, no database/service needed.
export default defineConfig({
    testDir: './tests/browser', testMatch: ['review-recovery.spec.ts', 'ui-accessibility.spec.ts'], workers: 1, retries: 0, reporter: 'list',
    use: { baseURL: 'http://127.0.0.1:4175', trace: 'off', screenshot: 'off' },
    projects: [{ name: 'chromium-wide', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } }, { name: 'chromium-narrow', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } } },
      { name: 'chromium-320', testMatch: 'ui-accessibility.spec.ts', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 900 } } },
      { name: 'chromium-zoom200', testMatch: 'ui-accessibility.spec.ts', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } }],
    webServer: { command: 'node node_modules/vite/bin/vite.js apps/web --host 127.0.0.1 --port 4175 --strictPort', url: 'http://127.0.0.1:4175', reuseExistingServer: false, timeout: 30000 }
});
