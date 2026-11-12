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
    // Keep the iPhone viewport/touch emulation, but use Chromium because CI
    // installs Chromium only. This avoids requiring a separate WebKit binary.
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], browserName: "chromium" } }
  ],
  webServer: {
    command: "python3 -m http.server 4173 --directory app",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});
