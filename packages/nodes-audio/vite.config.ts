import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      name: "litegraph-nodes-audio",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      // 核心引擎由使用方安装，避免打包出第二份 LiteGraph 实例
      external: [/^@gausszhou\/litegraph-core(\/.*)?$/],
    },
  },
});
