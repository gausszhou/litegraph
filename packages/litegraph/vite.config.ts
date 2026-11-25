import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      name: "litegraph",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "umd"],
      fileName: (format) => (format === "es" ? "index.js" : "index.umd.cjs"),
    },
  },
});
