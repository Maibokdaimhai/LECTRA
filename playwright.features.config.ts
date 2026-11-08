import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',globalSetup:'./scripts/prepare-browser.ts',fullyParallel:false,workers:1,retries:0,reporter:'list',
  use:{baseURL:'http://127.0.0.1:4174',trace:'off',screenshot:'off'},
  projects:[{name:'chromium-wide',use:{...devices['Desktop Chrome'],viewport:{width:1280,height:720}}},{name:'chromium-narrow',use:{...devices['Desktop Chrome'],viewport:{width:360,height:800}}}],
  webServer:{command:'node scripts/dev.mjs --features',url:'http://127.0.0.1:4174',reuseExistingServer:false,timeout:30000,gracefulShutdown:{signal:'SIGTERM',timeout:5000}}
});
