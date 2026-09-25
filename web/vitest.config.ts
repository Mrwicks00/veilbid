import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  mode: "node",
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", ".next"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
