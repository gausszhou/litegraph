import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      name: "litegraphNodesMidi",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "umd"],
      fileName: (format) => (format === "es" ? "index.js" : "index.umd.cjs"),
    },
    rollupOptions: {
      // 核心引擎由使用方安装，避免打包出第二份 LiteGraph 实例
      external: [/^@gausszhou\/litegraph-core(\/.*)?$/],
      output: {
        exports: "named",
        // UMD 下 core 以全局命名空间提供，核心 UMD 构建即 window.litegraph
        globals: { "@gausszhou/litegraph-core": "litegraph" },
      },
    },
  },
});
