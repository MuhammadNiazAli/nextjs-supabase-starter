import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Standalone config for plain component/unit tests (jsdom + Testing Library).
// Kept separate from vitest.config.ts, which drives Storybook's browser-mode
// story tests and requires a .storybook config directory.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
    },
  },
  test: {
    name: "unit",
    environment: "jsdom",
    globals: true,
    setupFiles: [path.join(dirname, "vitest.setup.ts")],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
