import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/db-setup.ts"],
    globals: true,
    testTimeout: 30000, // 30 seconds for DB operations
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
