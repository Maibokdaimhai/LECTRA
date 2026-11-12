import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/browser', testMatch: ['feedback.spec.ts', 'sprint1-rejections.spec.ts', 'sprint1-recovery-states.spec.ts', 'ui-accessibility-real.spec.ts'], globalSetup: './scripts/prepare-browser.ts', fullyParallel: false, workers: 1, retries: 0, reporter: 'list', timeout: 45000,
    use: { baseURL: 'http://127.0.0.1:4174', trace: 'off', screenshot: 'off' },
    projects: [{ name: 'chromium-wide', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } }, { name: 'chromium-narrow', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } } }, { name: 'chromium-320', testMatch: 'ui-accessibility-real.spec.ts', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 900 } } }, { name: 'chromium-zoom200', testMatch: 'ui-accessibility-real.spec.ts', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } }],
    webServer: { command: 'node node_modules/vite/bin/vite.js apps/web --host 127.0.0.1 --port 4174 --strictPort', env: { API_PROXY_TARGET: 'http://127.0.0.1:3102' }, url: 'http://127.0.0.1:4174', reuseExistingServer: false, timeout: 30000, gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 } }
});
