import { defineConfig } from '@playwright/test'

const developmentUrl = process.env.SHIP_TEST_URL

const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'notebook-1366', width: 1366, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
]
export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: { timeout: 10000 },
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: developmentUrl ?? 'http://127.0.0.1:4173',
    channel: 'msedge',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'service-contract', testMatch: ['**/*ship-service.spec.ts', '**/session-user-service.spec.ts'] },
    ...viewports.map(({ name, width, height }) => ({
      name,
      testMatch: '**/ships-ui.spec.ts',
      use: { viewport: { width, height }, hasTouch: width <= 768, isMobile: width <= 430 },
    })),
  ],
  webServer: developmentUrl ? undefined : {
    command: 'npm run preview -- --outDir dist-e2e --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    timeout: 30000,
    reuseExistingServer: false,
  },
})
