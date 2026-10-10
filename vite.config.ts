import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "exam-paper",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "clsx", "katex"],
    },
  },
  test: { include: ["src/**/*.test.{ts,tsx}"] },
});
