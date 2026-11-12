const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./testing/tests",
  fullyParallel: true,
  reporter: [["list"], ["html", { outputFolder: "testing/test-results/html", open: "never" }]],
  outputDir: "testing/test-results/raw",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"] } }
  ],
  webServer: {
    command: "python3 -m http.server 4173 --directory app",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});