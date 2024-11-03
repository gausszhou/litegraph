import { resolve } from "path";
import { defineConfig } from "vite";
import { viteExternalsPlugin } from "vite-plugin-externals";

export default defineConfig({
  plugins: [
    viteExternalsPlugin({
      "@gausszhou/litegraph-core/src/LGraphNode": "LGraphNode",
      "@gausszhou/litegraph-core/src/LiteGraph": "LiteGraph",
      "@gausszhou/litegraph-core/src/LGraph": "LGraph",
    }),
  ],
  build: {
    outDir: "dist",
    lib: {
      name: "nodes-events",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "umd"],
    },
  },
});
