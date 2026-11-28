import { defineConfig } from "@playwright/test";

const serverURL = new URL("http://127.0.0.1:3100");

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  use: { baseURL: serverURL.origin, browserName: "chromium" },
  webServer: {
    command: `pnpm build && pnpm start --hostname ${serverURL.hostname} --port ${serverURL.port}`,
    url: serverURL.origin,
    timeout: 120_000,
  },
});
