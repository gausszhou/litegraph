// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  resolve: {
    "@": resolve(__dirname, "./src")
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html")
      }
    },
    outDir: "dist/demo"
  }
});
